package app

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
)

const (
	AppVersion = "1.0.0"
)

var (
	RootCmd = &cobra.Command{
		Use: filepath.Base(os.Args[0]),
	}
)

func init() {
	cmdVersion := &cobra.Command{
		Use: "version",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Printf("version %s\n", AppVersion)
		},
	}
	RootCmd.AddCommand(cmdVersion)
}

func Launch() error {
	return RootCmd.Execute()
}
