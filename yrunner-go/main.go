package main

import (
	"fmt"
	"yrunner-go/app"
)

func main() {
	if err := app.Launch(); err != nil {
		fmt.Printf("%v", err)
	}
}
