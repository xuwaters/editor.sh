package app

import (
	"encoding/json"
	"fmt"
)

// ServiceResponses Error Messages
const (
	ErrServiceInternal = "err_service_internal"
	ErrInitRoomExists  = "err_init_room_exists"
	ErrInvalidRoomKey  = "err_invalid_room_key"
	ErrCodeAlreadyRunning = "err_code_already_running"
)

// ServiceStats Response
type ServiceStats struct {
	Rooms []string `json:"rooms,omitempty"`
}

type ServiceError struct {
	Err string `json:"err,omitempty"`
}

// ServiceRequests
type ServiceRequests struct {
	Reset   *RunEnv  `json:"reset,omitempty"`
	Run     *Code    `json:"run,omitempty"`
	WinSize *WinSize `json:"win_size,omitempty"`
	Stdin   string   `json:"stdin,omitempty"`
}

func ParseServiceRequests(data []byte) (*ServiceRequests, error) {
	req := &ServiceRequests{}
	err := json.Unmarshal(data, req)
	if err != nil {
		return nil, fmt.Errorf("parsing ServiceRequests failure: %v", err)
	}
	return req, nil
}

// ServiceResponses
type ServiceResponses struct {
	Init    *ResultInit    `json:"init,omitempty"`
	Reset   *ResultReset   `json:"reset,omitempty"`
	Run     *ResultRun     `json:"run,omitempty"`
	WinSize *ResultWinSize `json:"win_size,omitempty"`
	Stdout  *ResultStdout  `json:"stdout,omitempty"`
}

type ResultInit struct {
	Ok  *InitResp `json:"ok,omitempty"`
	Err string    `json:"err,omitempty"`
}
type ResultReset struct {
	Ok  *ResetResp `json:"ok,omitempty"`
	Err string     `json:"err,omitempty"`
}
type ResultRun struct {
	Ok  *RunResp `json:"ok,omitempty"`
	Err string   `json:"err,omitempty"`
}
type ResultWinSize struct {
	Ok  *WinSize `json:"ok,omitempty"`
	Err string   `json:"err,omitempty"`
}
type ResultStdout struct {
	Ok  *StdoutResp `json:"ok,omitempty"`
	Err string      `json:"err,omitempty"`
}

// win size
type WinSize struct {
	Row uint16 `json:"row"`
	Col uint16 `json:"col"`
}

type InitResp struct{}

type RunEnv struct {
	WinSize  WinSize `json:"win_size,omitempty"`
	Language string  `json:"language,omitempty"`
	Boot     *Code   `json:"boot,omitempty"`
}

type ResetResp struct{}

type CodeID uint32

type Code struct {
	ID       CodeID `json:"id"`
	Language string `json:"language"`
	Filename string `json:"filename"`
	Content  string `json:"content"`
}

type RunResp struct {
	ID             CodeID  `json:"id"`
	ExitStatus     int32   `json:"exit_status"`
	DurationMillis float64 `json:"duration_ms"`
}

type StdoutResp struct {
	ID   CodeID `json:"id"`
	Data string `json:"data"`
}
