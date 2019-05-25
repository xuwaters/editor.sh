package app

import (
	"context"
	"encoding/json"
	"log"
	"time"

	docker "github.com/docker/docker/client"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type SessionState int

const (
	SessStateNone       SessionState = 0
	SessStateReseting   SessionState = 1
	SessStateReady      SessionState = 2
	SessStateDestroying SessionState = 3
)

type RoomInfoProvider interface {
	GetDockerClient() *docker.Client
	GetLangConfig() *LangConfig
}

type RoomSession struct {
	roomKey      string
	provider     RoomInfoProvider
	c            *gin.Context
	conn         *websocket.Conn
	state        SessionState
	runtime      *LangRuntime
	runtimeSeqNo int
	writeQueue   chan *ServiceResponses
}

var _ LangRuntimeListener = (*RoomSession)(nil)

func NewRoomSession(c *gin.Context, conn *websocket.Conn, roomKey string, provider RoomInfoProvider) *RoomSession {
	log.Printf("new room session: %v, remote = %v", roomKey, conn.RemoteAddr())
	return &RoomSession{
		roomKey:      roomKey,
		provider:     provider,
		c:            c,
		conn:         conn,
		state:        SessStateNone,
		runtime:      nil,
		runtimeSeqNo: 1,
		writeQueue:   make(chan *ServiceResponses, 0),
	}
}

func (sess *RoomSession) GetRoomKey() string {
	return sess.roomKey
}

func (sess *RoomSession) GetDockerClient() *docker.Client {
	return sess.provider.GetDockerClient()
}

func (sess *RoomSession) GetLangConfig() *LangConfig {
	return sess.provider.GetLangConfig()
}

func (sess *RoomSession) WriteStdout(id CodeID, buf []byte) {
	sess.sendStdoutResponse(id, string(buf))
}

func (sess *RoomSession) ProcessEvents(ctx context.Context) {
	log.Printf("session room key: %s", sess.roomKey)

	sess.OnStart()

	// start write thread
	go sess.writeLoop(ctx)

	// read loop
	sess.readLoop(ctx)
}

func (sess *RoomSession) writeLoop(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			log.Printf("request cancelled, end write, %v", ctx.Err())
			return

		case resp, ok := <-sess.writeQueue:
			if !ok {
				log.Printf("write queue closed: %v", sess.roomKey)
				return
			}
			sess.conn.WriteJSON(resp)
		}
	}
}

func (sess *RoomSession) readLoop(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			log.Printf("request cancelled: %v", ctx.Err())
			return

		default:
			running := sess.handleSessionMessage(ctx)
			if !running {
				return
			}
		}
	}
}

func (sess *RoomSession) OnStart() {
	// session started
	sess.state = SessStateNone
}

func (sess *RoomSession) OnDestroy() {
	// session cleanup
	sess.state = SessStateDestroying
	if sess.runtime != nil {
		sess.runtime.Stop(context.Background())
		sess.runtime = nil
	}
}

func (sess *RoomSession) handleSessionMessage(ctx context.Context) (running bool) {
	const maxPingSize = 256

	msgType, msgData, err := sess.conn.ReadMessage()
	if err != nil {
		log.Printf("read websocket message failure: %v, remote = %v", err, sess.c.Request.RemoteAddr)
		return false
	}
	switch msgType {
	case websocket.TextMessage:
		msgReq := &ServiceRequests{}
		err := json.Unmarshal(msgData, msgReq)
		if err != nil {
			log.Printf("json message decode err = %v, text = %v", err, string(msgData))
			return false
		}
		log.Printf("remote = %v, req = %+v", sess.conn.RemoteAddr(), string(msgData))
		sess.onRequestMessage(ctx, msgReq)

	case websocket.BinaryMessage:
		// unsupported binary message
		log.Printf("binary message not supported: %v", sess.c.Request.RemoteAddr)
		return false

	case websocket.PingMessage:
		if len(msgData) > maxPingSize {
			log.Printf("ping msg too long: %d, remote = %v", len(msgData), sess.c.Request.RemoteAddr)
			return false
		}
		deadline := time.Now().Add(time.Duration(5000))
		sess.conn.WriteControl(websocket.PongMessage, msgData, deadline)

	case websocket.PongMessage:
		if len(msgData) > maxPingSize {
			log.Printf("pong msg too long: %d, remote = %v", len(msgData), sess.c.Request.RemoteAddr)
			return false
		}
	}

	return true
}

func (sess *RoomSession) sendResponse(resp *ServiceResponses) error {
	LogObjects("response =", resp)
	sess.writeQueue <- resp
	return nil
}

func (sess *RoomSession) sendStdoutResponse(id CodeID, data string) {
	sess.sendResponse(&ServiceResponses{
		Stdout: &ResultStdout{
			Ok: &StdoutResp{
				ID:   id,
				Data: data,
			},
		},
	})
}

func (sess *RoomSession) onRequestMessage(ctx context.Context, msgReq *ServiceRequests) {
	switch sess.state {
	case SessStateNone:
		sess.onEventStateNone(ctx, msgReq)
	case SessStateReseting:
		sess.onEventStateReseting(ctx, msgReq)
	case SessStateReady:
		sess.onEventStateReady(ctx, msgReq)
	default:
		log.Printf("unknow session state = %v", sess.state)
	}
}

func (sess *RoomSession) onEventStateNone(ctx context.Context, msgReq *ServiceRequests) {
	if msgReq.Reset == nil {
		log.Printf("state: None, expect Reset, but got request: %v", msgReq)
		sess.sendResponse(&ServiceResponses{
			Reset: &ResultReset{
				Err: ErrServiceInternal,
			},
		})
		return
	}

	sess.doResetLangRuntime(ctx, msgReq.Reset)

}

func (sess *RoomSession) onEventStateReseting(ctx context.Context, msgReq *ServiceRequests) {
	// ignore all events
	log.Printf("state: Reseting, ignore all requests: %v", msgReq)
}

func (sess *RoomSession) onEventStateReady(ctx context.Context, msgReq *ServiceRequests) {
	if msgReq.Reset != nil {
		sess.doResetLangRuntime(ctx, msgReq.Reset)
	} else if msgReq.WinSize != nil {
		sess.doReplWinSize(ctx, msgReq.WinSize)
	} else if msgReq.Stdin != "" {
		sess.doReplStdin(ctx, msgReq.Stdin)
	} else if msgReq.Run != nil {
		sess.doRunCode(ctx, msgReq.Run)
	} else {
		log.Printf("state: Ready, unsupported request: %v", msgReq)
	}
}

func (sess *RoomSession) createLangRuntime(runEnv *RunEnv) (*LangRuntime, error) {
	seqNo := sess.getNextSeqNo()
	return NewLangRuntime(seqNo, runEnv, sess)
}

func (sess *RoomSession) getNextSeqNo() int {
	seqNo := sess.runtimeSeqNo
	sess.runtimeSeqNo = (sess.runtimeSeqNo + 1) % 1000
	if sess.runtimeSeqNo == 0 {
		sess.runtimeSeqNo = 1
	}
	return seqNo
}

func (sess *RoomSession) doResetLangRuntime(ctx context.Context, runEnv *RunEnv) {
	sess.state = SessStateReseting
	if sess.runtime != nil {
		sess.runtime.Stop(ctx)
	}

	var err error
	sess.runtime, err = sess.createLangRuntime(runEnv)
	if err != nil {
		sess.state = SessStateNone
		log.Printf("create lang runtime failure: %v", err)
		sess.sendResponse(&ServiceResponses{
			Reset: &ResultReset{
				Err: ErrServiceInternal,
			},
		})
		return
	}
	sess.runtime.Start(ctx)

	log.Printf("ResetLangRuntime success: %v", sess.runtime.seqNo)
	// reset finished
	sess.state = SessStateReady

	// ok
	sess.sendResponse(&ServiceResponses{
		Reset: &ResultReset{
			Ok: &ResetResp{},
		},
	})
}

func (sess *RoomSession) doReplWinSize(ctx context.Context, winSize *WinSize) {
	sess.runtime.SetReplWinSize(ctx, winSize)
}

func (sess *RoomSession) doReplStdin(ctx context.Context, stdin string) {
	sess.runtime.SendReplStdin(stdin)
}

func (sess *RoomSession) doRunCode(ctx context.Context, code *Code) {
	err := sess.runtime.RunCode(ctx, code)
	if err != nil {
		log.Printf("run code %v, err = %v, code = %+v", sess.roomKey, err, code)
		sess.sendResponse(&ServiceResponses{
			Run: &ResultRun{
				Err: err.Error(),
			},
		})
	}
}
