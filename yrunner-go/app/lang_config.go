package app

import (
	"fmt"
	"io/ioutil"
	"log"

	"github.com/go-yaml/yaml"
)

type LangConfigData struct {
	Languages []*LangEnv    `yaml:"languages"`
	Docker    *DockerConfig `yaml:"docker"`
}

type DockerConfig struct {
	MemoryMB      int `yaml:"memory_mb"`
	CPUPeriodMS   int `yaml:"cpu_period_ms"`
	CPUQuotaMS    int `yaml:"cpu_quota_ms"`
	CodeTimeoutMS int `yaml:"code_timeout_ms"`
}

type LangConfig struct {
	Languages map[string]*LangEnv
	Docker    *DockerConfig
}

type LangEnv struct {
	Name    string   `yaml:"name"`
	Ext     string   `yaml:"ext"`
	Image   string   `yaml:"image"`
	Service *CmdLine `yaml:"service"`
	Repl    *CmdLine `yaml:"repl"`
	Run     *CmdLine `yaml:"run"`
}

type CmdLine struct {
	Env []string `yaml:"env"`
	Cmd []string `yaml:"cmd"`
}

func LoadLangConfig(configFile string) (*LangConfig, error) {
	content, err := ioutil.ReadFile(configFile)
	if err != nil {
		return nil, fmt.Errorf("load config file: %s, err = %v", configFile, err)
	}

	configData := &LangConfigData{}
	err = yaml.Unmarshal(content, configData)
	if err != nil {
		return nil, fmt.Errorf("parse config file: %s, err = %v", configFile, err)
	}

	content, _ = yaml.Marshal(configData)
	log.Printf("config loaded: %+v", string(content))

	// convert to hash map version
	config := &LangConfig{
		Languages: make(map[string]*LangEnv),
		Docker:    configData.Docker,
	}

	for _, lang := range configData.Languages {
		config.Languages[lang.Name] = lang
	}

	return config, nil
}

func (config *LangConfig) GetLangEnv(name string) (*LangEnv, bool) {
	lang, ok := config.Languages[name]
	log.Printf("GetLangEnv name = %s, lang = %+v, ok = %v", name, lang, ok)
	return lang, ok
}
