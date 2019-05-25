package app

import (
	"context"
	"fmt"
	"log"
	"regexp"
	"sync"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"

	docker "github.com/docker/docker/client"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var patternRoomKey = regexp.MustCompile(`^[a-zA-Z0-9_-]{1,128}$`)

// RoomService manages RoomSession
type RoomService struct {
	mutex          *sync.RWMutex
	sessions       map[string]*RoomSession
	serviceOptions *ServiceOptions
	langConfig     *LangConfig
	dockerClient   *docker.Client
}

var _ RoomInfoProvider = (*RoomService)(nil)

func NewDockerClient(ctx context.Context) (*docker.Client, error) {
	dockerClient, err := docker.NewEnvClient()
	if err != nil {
		return nil, fmt.Errorf("create docker client err = %v", err)
	}
	dockerClient.NegotiateAPIVersion(ctx)
	return dockerClient, nil
}

func NewRoomService(serviceOptions *ServiceOptions) (*RoomService, error) {

	// load lang config
	langConfig, err := LoadLangConfig(serviceOptions.ConfigFile)
	if err != nil {
		return nil, fmt.Errorf("load config file: %s, err = %v", serviceOptions.ConfigFile, err)
	}

	// init docker client
	dockerClient, err := NewDockerClient(context.Background())
	if err != nil {
		return nil, fmt.Errorf("create docker client err = %v", err)
	}

	roomService := &RoomService{
		mutex:          &sync.RWMutex{},
		sessions:       make(map[string]*RoomSession),
		serviceOptions: serviceOptions,
		langConfig:     langConfig,
		dockerClient:   dockerClient,
	}

	return roomService, nil
}

func (room *RoomService) GetDockerClient() *docker.Client { return room.dockerClient }
func (room *RoomService) GetLangConfig() *LangConfig      { return room.langConfig }

func (room *RoomService) NewSession(c *gin.Context, conn *websocket.Conn, roomKey string) (*RoomSession, error) {

	if !patternRoomKey.MatchString(roomKey) {
		log.Printf("invalid room_key, create session failure: %v", roomKey)
		room.sendSessionInitResponse(conn, &ResultInit{
			Err: ErrInvalidRoomKey,
		})
		return nil, fmt.Errorf("invalid room_key")
	}

	// lock
	room.mutex.Lock()
	defer room.mutex.Unlock()

	if _, ok := room.sessions[roomKey]; ok {
		log.Printf("room session already exists: %v", roomKey)
		room.sendSessionInitResponse(conn, &ResultInit{
			Err: ErrInitRoomExists,
		})
		return nil, fmt.Errorf("room session already exists")
	}

	session := NewRoomSession(c, conn, roomKey, room)
	room.sessions[roomKey] = session

	room.sendSessionInitResponse(conn, &ResultInit{
		Ok: &InitResp{},
	})

	return session, nil
}

func (room *RoomService) sendSessionInitResponse(conn *websocket.Conn, init *ResultInit) {
	conn.WriteJSON(ServiceResponses{Init: init})
}

func (room *RoomService) OnSessionDestroy(session *RoomSession) {
	// lock
	room.mutex.Lock()
	defer room.mutex.Unlock()

	roomKey := session.GetRoomKey()
	delete(room.sessions, roomKey)

	session.OnDestroy()
}

func (room *RoomService) GetStats() *ServiceStats {
	room.mutex.RLock()
	defer room.mutex.RUnlock()

	stats := &ServiceStats{
		Rooms: make([]string, 0),
	}

	for roomKey := range room.sessions {
		stats.Rooms = append(stats.Rooms, roomKey)
	}

	return stats
}

func (room *RoomService) StopAllUnmanagedRoomProcesses(ctx context.Context) error {
	room.mutex.RLock()
	defer room.mutex.RUnlock()

	log.Printf("stopping all unmanaged room processes")
	containerListOptions := types.ContainerListOptions{
		Filters: filters.NewArgs(filters.Arg("label", LabelRoomKey)),
	}
	containers, err := room.dockerClient.ContainerList(ctx, containerListOptions)
	if err != nil {
		log.Printf("list containers failure: %v", err)
		// return fmt.Errorf("list containers err = %v", err)
	} else {
		for _, item := range containers {
			roomKey := item.Labels[LabelRoomKey]
			if _, ok := room.sessions[roomKey]; ok {
				log.Printf("skip container: %s, image = %s, room_key = %s", item.ID, item.Image, roomKey)
				continue
			}
			// kill process
			log.Printf("killing container: %s, image = %s, room_key = %s", item.ID, item.Image, roomKey)
			err = room.dockerClient.ContainerKill(ctx, item.ID, "SIGKILL")
			if err != nil {
				// ignore error
				log.Printf("kill container: %s, image = %s, err = %v", item.ID, item.Image, err)
			}
		}
	}

	log.Printf("removing all unmanaged networks")
	networkListOptions := types.NetworkListOptions{
		Filters: filters.NewArgs(filters.Arg("label", LabelRoomKey)),
	}
	networks, err := room.dockerClient.NetworkList(ctx, networkListOptions)
	if err != nil {
		log.Printf("list networks failure: %v", err)
	} else {
		for _, item := range networks {
			roomKey := item.Labels[LabelRoomKey]
			if _, ok := room.sessions[roomKey]; ok {
				log.Printf("skip network: %s, name = %s, room_key = %s", item.ID, item.Name, roomKey)
				continue
			}
			log.Printf("removing network: %s, name = %s, room_key = %s", item.ID, item.Name, roomKey)
			err = room.dockerClient.NetworkRemove(ctx, item.ID)
			if err != nil {
				log.Printf("remove network: %s, name = %s, err = %v", item.ID, item.Name, err)
			}
		}
	}

	return nil
}
