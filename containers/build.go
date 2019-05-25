package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"text/template"
)

func main() {

	langList := make(map[string]bool)
	for _, langName := range os.Args[1:] {
		langList[langName] = true
	}

	dockerfiles := []string{}
	includefiles := []string{}

	extractLangName := func(path string) string {
		idx := strings.Index(path, "/")
		if idx > 0 {
			return path[0:idx]
		}
		return ""
	}

	filepath.Walk(".", func(path string, info os.FileInfo, err error) error {
		if info.IsDir() {
			return nil
		}
		if strings.HasPrefix(path, "include/") {
			includefiles = append(includefiles, path)
		}
		if strings.HasPrefix(path, "languages/") && strings.HasSuffix(path, "/Dockerfile.tpl") {
			// check langList
			langName := extractLangName(path[len("languages/"):])
			if langName == "" || langName[0] == '_' {
				return nil
			}
			if len(langList) == 0 || langList[langName] {
				dockerfiles = append(dockerfiles, path)
			}
		}
		return nil
	})

	for _, file := range includefiles {
		fmt.Printf(">> Inc: %s\n", file)
	}

	for _, file := range dockerfiles {
		fileList := append([]string{file}, includefiles...)
		tpl, err := template.ParseFiles(fileList...)
		if err != nil {
			fmt.Printf("parse file failure: %s, err = %v\n", file, err)
			return
		}

		outputfile := strings.TrimSuffix(file, ".tpl")
		output, err := os.Create(outputfile)
		if err != nil {
			fmt.Printf("create result file failure: %s, err = %v\n", outputfile, err)
			return
		}
		if err := tpl.Execute(output, nil); err != nil {
			fmt.Printf("execute template failure: %s, err = %v\n", file, err)
			return
		}

		// run docker command
		if err = dockerBuild(outputfile); err != nil {
			fmt.Printf("docker build failure: %s, err = %v\n", outputfile, err)
			return
		}
	}
}

func dockerBuild(dockerfile string) error {
	tagPath := filepath.Dir(dockerfile)
	imagePath := filepath.Dir(tagPath)
	tag := filepath.Base(tagPath)
	image := filepath.Base(imagePath)
	imageName := fmt.Sprintf("yscript/%s:%s", image, tag)

	fmt.Printf("\n>> building image: %s, dockerfile = %s\n\n", imageName, dockerfile)
	cmd := exec.Command("docker",
		"build",
		"--no-cache",
		"--network=host",
		fmt.Sprintf("--tag=%s", imageName),
		fmt.Sprintf("--file=%s", dockerfile),
		".",
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}
