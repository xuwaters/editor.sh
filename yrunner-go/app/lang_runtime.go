package app

import (
	"archive/tar"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"regexp"
	"strings"
	"time"

	types "github.com/docker/docker/api/types"
	container "github.com/docker/docker/api/types/container"
	network "github.com/docker/docker/api/types/network"
	docker "github.com/docker/docker/client"
	stdcopy "github.com/docker/docker/pkg/stdcopy"
	nat "github.com/docker/go-connections/nat"
	// _ "github.com/AsynkronIT/protoactor-go/actor"
)

const (
	LabelRoomKey       = "room_key"
	LabelRunType       = "run_type"
	LabelRuntimeSeqNum = "rt_seq_num"
)

const (
	RunTypeService = "service"
	RunTypeRepl    = "repl"
	RunTypeCode    = "code"
	RunTypeNetwork = "network"
)

const (
	KwYeServiceName = "<YE_SERVICE_NAME>"
	KwYeNetworkName = "<YE_NETWORK_NAME>"
	KwYeRequestName = "<YE_REQUEST_FILE>"
)

const (
	RtStatusCreating = "rt_status_creating"
	RtStatusRunning  = "rt_status_running"
	RtStatusStopping = "rt_status_stopping"
)

const (
	TcYellow = "01;33"
	TcGreen  = "01;32"
	TcRed    = "01;31"
	TcGray   = "01;30"
)

type LangRuntimeListener interface {
	GetRoomKey() string
	GetDockerClient() *docker.Client
	GetLangConfig() *LangConfig
	WriteStdout(id CodeID, buf []byte)
}

// Writer adapter
type ListenerStdoutWriter struct {
	id       CodeID
	listener LangRuntimeListener
	newline  *regexp.Regexp
}

var _ io.Writer = (*ListenerStdoutWriter)(nil)

func NewListenerStdoutWriter(id CodeID, listener LangRuntimeListener, translateNewLine bool) *ListenerStdoutWriter {
	writer := &ListenerStdoutWriter{
		id:       id,
		listener: listener,
		newline:  nil,
	}
	if translateNewLine {
		writer.newline = regexp.MustCompile("\n")
	}
	return writer
}

func (w *ListenerStdoutWriter) Write(buf []byte) (n int, err error) {
	var dst []byte
	if w.newline != nil {
		dst = w.newline.ReplaceAllLiteral(buf, []byte("\r\n"))
	} else {
		dst = buf
	}
	w.listener.WriteStdout(w.id, dst)
	return len(buf), nil
}

type LangRuntime struct {
	seqNo    int
	listener LangRuntimeListener
	runEnv   *RunEnv
	langEnv  *LangEnv
	status   string
	// network
	networkName string
	networkID   string
	// service
	serviceName      string
	serviceContainer string // container id
	// repl
	replName      string
	replContainer string // container id
	replStdio     *types.HijackedResponse
	// code
	codeName      string
	codeContainer string
	codeStdio     *types.HijackedResponse
	requestName   string
}

func NewLangRuntime(seqNo int, runEnv *RunEnv, listener LangRuntimeListener) (*LangRuntime, error) {
	langConfig := listener.GetLangConfig()
	langEnv, ok := langConfig.GetLangEnv(runEnv.Language)
	if !ok {
		return nil, fmt.Errorf("lang not found: %s", runEnv.Language)
	}
	rt := &LangRuntime{
		seqNo:    seqNo,
		listener: listener,
		runEnv:   runEnv,
		langEnv:  langEnv,
		status:   RtStatusCreating,
	}
	log.Printf("NewLangRuntime: rt = %+v", rt.langEnv)
	rt.networkName = rt.makeUniqueName(RunTypeNetwork)
	rt.serviceName = rt.makeUniqueName(RunTypeService)
	rt.replName = rt.makeUniqueName(RunTypeRepl)
	rt.codeName = rt.makeUniqueName(RunTypeCode)
	rt.requestName = "request.json"
	log.Printf("runtime names: %s, %s, %s, %s", rt.networkName, rt.serviceName, rt.replName, rt.codeName)
	return rt, nil
}

func (rt *LangRuntime) Start(ctx context.Context) {
	rt.status = RtStatusRunning

	welcomeLine := termColor(TcYellow, fmt.Sprintf("[ Welcome to %s ]", rt.runEnv.Language))
	welcomeLine = "\r\n" + welcomeLine + "\r\n"
	rt.writeStdout(0, []byte(welcomeLine))

	// start background service if any
	rt.startServiceNetwork(ctx)
	rt.startServiceProcess(ctx)

	if rt.serviceContainer != "" {
		log.Printf("waiting for service ready...")
		rt.writeStdout(0, []byte("Waiting for service ready...\r\n"))
		time.Sleep(10 * time.Second)
	}

	rt.startServiceBootProcess(ctx)
	rt.startReplProcess(ctx)
}

func (rt *LangRuntime) Stop(ctx context.Context) {
	rt.status = RtStatusStopping

	// kill all processes
	rt.stopReplProcess(ctx)
	rt.stopCodeProcess(ctx)
	rt.stopServiceProcess(ctx)
	rt.stopServiceNetwork(ctx)

	// finally clear listener
	rt.listener = nil
}

func (rt *LangRuntime) SetReplWinSize(ctx context.Context, winSize *WinSize) {
	dockerClient := rt.listener.GetDockerClient()
	rt.runEnv.WinSize = *winSize
	if rt.replContainer != "" {
		dockerClient.ContainerResize(ctx, rt.replContainer, types.ResizeOptions{
			Height: uint(winSize.Row),
			Width:  uint(winSize.Col),
		})
	}
}

func (rt *LangRuntime) SendReplStdin(stdin string) {
	if rt.replStdio != nil {
		rt.replStdio.Conn.Write([]byte(stdin))
	}
}

func (rt *LangRuntime) RunCode(ctx context.Context, code *Code) error {
	if rt.codeContainer != "" {
		return errors.New(ErrCodeAlreadyRunning)
	}
	return rt.startCodeProcess(ctx, code)
}

func (rt *LangRuntime) getLangEnv() (*LangEnv, bool) {
	lang := rt.runEnv.Language
	langConfig := rt.listener.GetLangConfig()
	langEnv, ok := langConfig.GetLangEnv(lang)
	return langEnv, ok
}

func (rt *LangRuntime) makeUniqueName(nameSuffix string) string {
	roomHash := MD5Hash(rt.listener.GetRoomKey())[0:8]
	return fmt.Sprintf("%s.%03d.%s", roomHash, rt.seqNo, nameSuffix)
}

func (rt *LangRuntime) buildCommonLabels(runType string) map[string]string {
	return map[string]string{
		LabelRoomKey:       rt.listener.GetRoomKey(),
		LabelRuntimeSeqNum: fmt.Sprintf("%d", rt.seqNo),
		LabelRunType:       runType,
	}
}

func (rt *LangRuntime) defaultHostConfig() *container.HostConfig {
	networkMode := "none"
	if rt.networkID != "" {
		networkMode = rt.networkName
	}

	config := rt.listener.GetLangConfig()

	memory := int64(config.Docker.MemoryMB)
	if memory < 64 {
		memory = 64
	} else if memory > 2048 {
		memory = 2048
	}
	cpuPeriod := int64(config.Docker.CPUPeriodMS)
	cpuQuota := int64(config.Docker.CPUQuotaMS)

	log.Printf("memory limit: %d MiB, cpu usage: %d/%d", memory, cpuQuota, cpuPeriod)

	return &container.HostConfig{
		NetworkMode: container.NetworkMode(networkMode),
		AutoRemove:  true,
		Resources: container.Resources{
			Memory:    memory * 1024 * 1024, // memory MiB
			CPUPeriod: cpuPeriod * 1000,     // cpuPeriod ms
			CPUQuota:  cpuQuota * 1000,      // cpuQuota ms
		},
		ConsoleSize: [2]uint{
			uint(rt.runEnv.WinSize.Row),
			uint(rt.runEnv.WinSize.Col),
		},
		PortBindings: make(nat.PortMap),
		DNS:          []string{},
		DNSOptions:   []string{},
		DNSSearch:    []string{},
		RestartPolicy: container.RestartPolicy{
			Name:              "no",
			MaximumRetryCount: 0,
		},
	}
}

func (rt *LangRuntime) defaultNetworkingConfig() *network.NetworkingConfig {
	networkingConfig := &network.NetworkingConfig{
		EndpointsConfig: map[string]*network.EndpointSettings{},
	}
	if rt.networkID != "" {
		networkingConfig.EndpointsConfig[rt.networkName] = &network.EndpointSettings{}
	}
	return networkingConfig
}

func (rt *LangRuntime) startServiceNetwork(ctx context.Context) error {
	if rt.langEnv.Service == nil {
		log.Printf("runtime service is nil: %s", rt.langEnv.Name)
		return nil
	}
	labels := rt.buildCommonLabels(RunTypeNetwork)
	dockerClient := rt.listener.GetDockerClient()
	options := types.NetworkCreate{
		Internal: true,
		Labels:   labels,
	}
	createResp, err := dockerClient.NetworkCreate(ctx, rt.networkName, options)
	if err != nil {
		return fmt.Errorf("create network: %s, err = %v", rt.networkName, err)
	}
	rt.networkID = createResp.ID
	return nil
}

func (rt *LangRuntime) startServiceProcess(ctx context.Context) error {
	if rt.langEnv.Service == nil {
		log.Printf("runtime service is nil: %s", rt.langEnv.Name)
		return nil
	}
	labels := rt.buildCommonLabels(RunTypeService)

	config := types.ContainerCreateConfig{
		Name: rt.serviceName,
		Config: &container.Config{
			Labels: labels,
			Image:  rt.langEnv.Image,
			Cmd:    rt.langEnv.Service.Cmd,
			Env:    rt.langEnv.Service.Env,
		},
		HostConfig:       rt.defaultHostConfig(),
		NetworkingConfig: &network.NetworkingConfig{},
	}
	dockerClient := rt.listener.GetDockerClient()
	containerCreateResult, err := dockerClient.ContainerCreate(
		ctx,
		config.Config,
		config.HostConfig,
		config.NetworkingConfig,
		config.Name,
	)
	if err != nil {
		return fmt.Errorf("create container err = %v", err)
	}
	rt.serviceContainer = containerCreateResult.ID
	//
	err = dockerClient.ContainerStart(ctx, rt.serviceContainer, types.ContainerStartOptions{})
	if err != nil {
		return fmt.Errorf("start container err = %v", err)
	}

	log.Printf("service started: %s, id = %s", rt.serviceName, rt.serviceContainer)

	return nil
}

func (rt *LangRuntime) startServiceBootProcess(ctx context.Context) error {
	if rt.runEnv.Boot != nil {
		return rt.RunCode(ctx, rt.runEnv.Boot)
	}
	return nil
}

func (rt *LangRuntime) stopServiceProcess(ctx context.Context) error {
	dockerClient := rt.listener.GetDockerClient()

	if rt.serviceContainer != "" {
		err := dockerClient.ContainerKill(ctx, rt.serviceContainer, "SIGKILL")
		if err != nil {
			return fmt.Errorf("kill container: %s, err = %v", rt.serviceContainer, err)
		}
		rt.serviceContainer = ""
	}

	return nil
}

func (rt *LangRuntime) stopServiceNetwork(ctx context.Context) error {
	dockerClient := rt.listener.GetDockerClient()

	if rt.networkID != "" {
		err := dockerClient.NetworkRemove(ctx, rt.networkID)
		if err != nil {
			return fmt.Errorf("remote network: %s, failure: %v", rt.networkName, err)
		}
		rt.networkID = ""
	}

	return nil
}

func (rt *LangRuntime) closeAttachResponse(resp *types.HijackedResponse) {
	if resp != nil {
		resp.Close()
	}
}

func (rt *LangRuntime) stopReplProcess(ctx context.Context) error {

	rt.closeAttachResponse(rt.replStdio)
	rt.replStdio = nil

	if rt.replContainer != "" {
		dockerClient := rt.listener.GetDockerClient()
		dockerClient.ContainerKill(ctx, rt.replContainer, "SIGKILL")

		rt.replContainer = ""
	}

	return nil
}

func (rt *LangRuntime) startReplProcess(ctx context.Context) error {
	if rt.langEnv.Repl == nil {
		log.Printf("runtime repl is nil: %s", rt.langEnv.Name)
		return nil
	}

	log.Printf("start repl process: %v", rt.langEnv.Name)

	// kill existing repl
	rt.stopReplProcess(ctx)

	// start new

	labels := rt.buildCommonLabels(RunTypeRepl)
	config := types.ContainerCreateConfig{
		Name: rt.replName,
		Config: &container.Config{
			Labels:       labels,
			Image:        rt.langEnv.Image,
			Cmd:          rt.replaceParams(rt.langEnv.Repl.Cmd),
			Env:          rt.replaceParams(rt.langEnv.Repl.Env),
			Tty:          true,
			AttachStdin:  true,
			AttachStdout: true,
			AttachStderr: true,
			OpenStdin:    true,
			StdinOnce:    true,
		},
		HostConfig:       rt.defaultHostConfig(),
		NetworkingConfig: rt.defaultNetworkingConfig(),
	}

	dockerClient := rt.listener.GetDockerClient()
	createResult, err := dockerClient.ContainerCreate(
		ctx,
		config.Config,
		config.HostConfig,
		config.NetworkingConfig,
		config.Name,
	)
	if err != nil {
		return fmt.Errorf("create container err = %v", err)
	}
	rt.replContainer = createResult.ID

	// // network
	// if rt.networkID != "" {
	// 	err = dockerClient.NetworkConnect(ctx, rt.networkID, rt.replContainer, nil)
	// 	if err != nil {
	// 		log.Printf("connet repl %s to network %s, err = %v", rt.replName, rt.networkName, err)
	// 	}
	// }

	// attach
	attachOptions := types.ContainerAttachOptions{
		Stream:     true,
		Stdin:      true,
		Stdout:     true,
		Stderr:     true,
		Logs:       false,
		DetachKeys: "",
	}

	attachResp, err := dockerClient.ContainerAttach(ctx, rt.replContainer, attachOptions)
	if err != nil {
		log.Printf("attach to container %s, err = %v", rt.replContainer, err)
		return fmt.Errorf("attach container %s, err = %v", rt.replContainer, err)
	}

	rt.replStdio = &attachResp

	// start copy stream
	go func() {
		log.Printf("start reading repl stdout")
		reader := rt.replStdio.Reader

		writer := NewListenerStdoutWriter(0, rt.listener, false)
		written, copyError := io.Copy(writer, reader)
		if copyError != nil {
			log.Printf("read repl stdout pipe err = %v", err)
		}
		log.Printf("stop reading repl stdout: %d", written)
	}()

	log.Printf("repl container attach success: %s", rt.replContainer)

	startOptions := types.ContainerStartOptions{}
	err = dockerClient.ContainerStart(ctx, rt.replContainer, startOptions)
	if err != nil {
		return fmt.Errorf("start container err = %v", err)
	}
	log.Printf("repl container start success: %s", rt.replName)

	// resize only works on running containers
	rt.SetReplWinSize(ctx, &rt.runEnv.WinSize)

	// wait for process exit
	okWaiter, errWaiter := dockerClient.ContainerWait(ctx, createResult.ID, container.WaitConditionRemoved)
	go func() {
		select {
		case <-okWaiter:
		case <-errWaiter:
		}
		// TODO: put all runtime logic into a separate thread (like actor model)
		log.Printf("repl process stopped: status = %s", rt.status)
		if rt.status == RtStatusStopping {
			return
		}
		restartNotice := termColor(TcGray, "restarting repl...")
		restartNotice = "\r\n" + restartNotice + "\r\n";
		rt.writeStdout(0, []byte(restartNotice))
		time.Sleep(2 * time.Second)
		if rt.listener != nil {
			rt.startReplProcess(ctx)
		}
	}()

	return nil
}

func (rt *LangRuntime) startCodeProcess(ctx context.Context, code *Code) error {

	// kill existing
	rt.stopCodeProcess(ctx)

	// TODO: refactor, code cleanup
	// start new

	labels := rt.buildCommonLabels(RunTypeCode)
	config := types.ContainerCreateConfig{
		Name: rt.codeName,
		Config: &container.Config{
			Labels:       labels,
			Image:        rt.langEnv.Image,
			Cmd:          rt.replaceParams(rt.langEnv.Run.Cmd),
			Env:          rt.replaceParams(rt.langEnv.Run.Env),
			Tty:          true,
			AttachStdin:  false,
			AttachStdout: true,
			AttachStderr: true,
			OpenStdin:    false,
			StdinOnce:    false,
		},
		HostConfig:       rt.defaultHostConfig(),
		NetworkingConfig: rt.defaultNetworkingConfig(),
	}

	dockerClient := rt.listener.GetDockerClient()
	createResult, err := dockerClient.ContainerCreate(
		ctx,
		config.Config,
		config.HostConfig,
		config.NetworkingConfig,
		config.Name,
	)
	if err != nil {
		return fmt.Errorf("create container err = %v", err)
	}
	rt.codeContainer = createResult.ID

	// if rt.networkID != "" {
	// 	err = dockerClient.NetworkConnect(ctx, rt.networkID, createResult.ID, nil)
	// 	if err != nil {
	// 		log.Printf("connet code %s to network %s, err = %v", rt.codeName, rt.networkName, err)
	// 	}
	// }

	// write code payload
	reqPayload := &ReqRunCode{
		Language: code.Language,
		Files: []CodeFile{
			CodeFile{
				// TODO: filename with extesion should be passed from web client
				Name:    code.Filename + rt.langEnv.Ext,
				Content: code.Content,
			},
		},
	}
	reqContent, err := json.Marshal(reqPayload)
	if err != nil {
		log.Printf("marshal req code run err = %v, req = %+v", err, reqPayload)
		return nil
	}

	// TODO: query WorkingDir and User from container inspect

	tarBuffer := bytes.NewBuffer(nil)
	tarWriter := tar.NewWriter(tarBuffer)
	tarWriter.WriteHeader(&tar.Header{
		Typeflag:   tar.TypeReg,
		Name:       rt.requestName,
		Mode:       0644,
		Size:       int64(len(reqContent)),
		Uname:      "ye",
		Gname:      "ye",
		ModTime:    time.Now(),
		AccessTime: time.Now(),
		ChangeTime: time.Now(),
	})
	tarWriter.Write(reqContent)

	err = dockerClient.CopyToContainer(ctx, createResult.ID, "/home/ye/", tarBuffer, types.CopyToContainerOptions{})
	if err != nil {
		log.Printf("copy file to container failure: %v", err)
	}
	log.Printf("copy file success: %v", createResult.ID)

	// attach
	attachOptions := types.ContainerAttachOptions{
		Stream:     true,
		Stdin:      false,
		Stdout:     true,
		Stderr:     true,
		Logs:       false,
		DetachKeys: "",
	}

	attachResp, err := dockerClient.ContainerAttach(ctx, createResult.ID, attachOptions)
	if err != nil {
		log.Printf("attach to container %s, err = %v", createResult.ID, err)
		return fmt.Errorf("attach container %s, err = %v", createResult.ID, err)
	}

	rt.codeStdio = &attachResp

	// start copy stream
	outputDone := make(chan error)
	go func() {
		log.Printf("start reading code stdout")

		reader := rt.codeStdio.Reader
		var written int64
		var copyError error

		if config.Config.Tty {
			writer := NewListenerStdoutWriter(code.ID, rt.listener, false)
			written, copyError = io.Copy(writer, reader)
		} else {
			writer := NewListenerStdoutWriter(code.ID, rt.listener, true)
			written, copyError = stdcopy.StdCopy(writer, writer, reader)
			if copyError != nil {
				log.Printf("copy from resp.reader err = %v", copyError)
			}
		}

		log.Printf("stop reading code stdout: written = %d", written)
		outputDone <- nil
	}()

	log.Printf("code container attach success: %s", createResult.ID)

	// process end waiter
	okWaiter, errWaiter := dockerClient.ContainerWait(ctx, createResult.ID, container.WaitConditionRemoved)

	langConfig := rt.listener.GetLangConfig()
	codeTimeout := time.Duration(langConfig.Docker.CodeTimeoutMS)

	startLine := termColor(TcYellow, fmt.Sprintf("[ start executing code ]"))
	startLine = "\r\n" + startLine + "\r\n"
	rt.writeStdout(0, []byte(startLine))
	startTime := time.Now().UnixNano()
	codeTimeoutTicker := time.NewTicker(codeTimeout * time.Millisecond)

	// start
	startOptions := types.ContainerStartOptions{}
	err = dockerClient.ContainerStart(ctx, createResult.ID, startOptions)
	if err != nil {
		return fmt.Errorf("start container err = %v", err)
	}
	log.Printf("repl container start success: %s", rt.codeName)

	// wait and cleanup code process
	go func() {
		select {
		case <-codeTimeoutTicker.C:
			log.Printf("code execution timeout: %s", createResult.ID)
			rt.writeStdout(0, []byte("\r\n[ execution timeout ]\r\n"))
			rt.stopCodeProcess(context.Background())
		case <-ctx.Done():
			log.Printf("context canceled: %s", createResult.ID)
			rt.stopCodeProcess(context.Background())
		case <-okWaiter:
		case <-errWaiter:
		}

		codeTimeoutTicker.Stop()

		endTime := time.Now().UnixNano()
		executeTime := float64(endTime-startTime) / 1e9

		log.Printf("code process exited: %s, time = %.3f s", createResult.ID, executeTime)
		finishLine := strings.Join([]string{
			"\r\n",
			termColor(TcYellow, "[ execution finished in "),
			termColor(TcGreen, fmt.Sprintf("%.3f", executeTime)),
			termColor(TcYellow, " seconds ]"),
			"\r\n",
		}, "")
		rt.writeStdout(0, []byte(finishLine))

		<-outputDone
		rt.stopCodeProcess(context.Background())
	}()

	return nil
}

func termColor(color, text string) string {
	return fmt.Sprintf("\u001b[%sm\u001b[K%s\u001b[m\u001b[K", color, text)
}

func (rt *LangRuntime) writeStdout(id CodeID, content []byte) {
	if rt.listener != nil {
		rt.listener.WriteStdout(id, content)
	}
}

func (rt *LangRuntime) stopCodeProcess(ctx context.Context) error {
	rt.closeAttachResponse(rt.codeStdio)
	rt.codeStdio = nil

	if rt.codeContainer != "" {
		dockerClient := rt.listener.GetDockerClient()
		dockerClient.ContainerKill(ctx, rt.codeContainer, "SIGKILL")

		rt.codeContainer = ""
	}

	return nil
}

func (rt *LangRuntime) replaceParams(cmdline []string) []string {
	kw := map[string]string{
		KwYeServiceName: rt.serviceName,
		KwYeNetworkName: rt.networkName,
		KwYeRequestName: rt.requestName,
	}
	return ReplaceStringArrayParams(cmdline, kw)
}

// yscript payload

type CodeFile struct {
	Name    string `json:"name"`
	Content string `json:"content"`
}

type ReqRunCode struct {
	Language string     `json:"language"`
	Files    []CodeFile `json:"files"`
}
