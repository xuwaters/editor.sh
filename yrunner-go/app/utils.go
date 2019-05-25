package app

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"log"
	"strings"
)

func MD5Hash(data string) string {
	hash := md5.New()
	hash.Write([]byte(data))
	checksum := hash.Sum(nil)
	return hex.EncodeToString(checksum)
}

func LogObjects(prefix string, vars ...interface{}) {
	var obj interface{} = vars
	if len(vars) == 1 {
		obj = vars[0]
	}
	content, _ := json.Marshal(obj)
	if content == nil {
		log.Printf("%s", prefix)
	} else {
		log.Printf("%s %s", prefix, string(content))
	}
}

func ReplaceStringArrayParams(arr []string, kw map[string]string) []string {
	res := make([]string, len(arr))
	for i, val := range arr {
		for k, v := range kw {
			val = strings.ReplaceAll(val, k, v)
		}
		res[i] = val
	}
	return res
}
