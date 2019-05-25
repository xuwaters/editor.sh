package app

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"runtime"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/spf13/cobra"
)

type ServiceOptions struct {
	ConfigFile string
	BindAddr   string
	DebugMode  bool
}

var (
	serviceOptions ServiceOptions
)

func init() {
	cmdService := getCmdService()
	RootCmd.AddCommand(cmdService)
}

func getCmdService() *cobra.Command {
	cmdService := &cobra.Command{
		Use: "service",
		Run: onRunService,
	}
	flagset := cmdService.Flags()
	flagset.StringVar(&serviceOptions.ConfigFile, "config", "", "config file")
	flagset.StringVar(&serviceOptions.BindAddr, "bind", "127.0.0.1:4500", "service bind address")
	flagset.BoolVar(&serviceOptions.DebugMode, "debug", false, "enable debug mode")
	cmdService.MarkFlagRequired("config")
	return cmdService
}

func onRunService(cmd *cobra.Command, args []string) {
	configRuntime()

	service, err := NewWebService(&serviceOptions)
	if err != nil {
		log.Printf("create web service err = %v", err)
		os.Exit(1)
	}

	log.Printf("listening on: %v", serviceOptions.BindAddr)
	service.Run(serviceOptions.BindAddr)
}

func configRuntime() {
	cpus := runtime.NumCPU()
	runtime.GOMAXPROCS(cpus)
	log.Printf("Running with %d CPUs", cpus)
}

func setGinEngineMode(debug bool) {
	if debug {
		gin.SetMode(gin.DebugMode)
		log.SetFlags(log.LstdFlags | log.Lshortfile)
	} else {
		gin.SetMode(gin.ReleaseMode)
		log.SetFlags(log.LstdFlags)
	}
}

func NewWebService(serviceOptions *ServiceOptions) (*gin.Engine, error) {
	setGinEngineMode(serviceOptions.DebugMode)

	roomService, err := NewRoomService(serviceOptions)
	if err != nil {
		return nil, err
	}
	err = roomService.StopAllUnmanagedRoomProcesses(context.Background())
	if err != nil {
		return nil, err
	}

	engine := gin.Default()
	engine.GET("/stats", onGetStats(roomService))
	engine.GET("/ws/:room_key", onRoomSocket(roomService))
	return engine, nil
}

func onGetStats(roomService *RoomService) gin.HandlerFunc {
	return func(c *gin.Context) {
		stats := roomService.GetStats()
		content, err := json.Marshal(stats)
		if err != nil {
			log.Printf("marshal serivce stats err = %v", err)
			c.JSON(http.StatusInternalServerError, ServiceError{
				Err: ErrServiceInternal,
			})
		} else {
			c.JSON(http.StatusOK, content)
		}
	}
}

func onRoomSocket(roomService *RoomService) gin.HandlerFunc {
	return func(c *gin.Context) {
		upgrader := websocket.Upgrader{
			// ReadBufferSize:  1024,
			// WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				log.Printf("req = %s, origin = %s, remote = %v", r.RequestURI, r.Header.Get("Origin"), r.RemoteAddr)
				return true
			},
		}

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("upgrade websocket failure: %v", err)
			return
		}
		defer conn.Close()

		roomKey := c.Param("room_key")
		session, err := roomService.NewSession(c, conn, roomKey)
		if err != nil {
			log.Printf("new room session: %v, err = %v, remote = %v", roomKey, err, conn.RemoteAddr())
			return
		}
		defer roomService.OnSessionDestroy(session)

		ctx := c.Request.Context()
		session.ProcessEvents(ctx)

	}
}
