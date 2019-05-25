
.PHONY: build clean

build:
	go run build.go

clean:
	docker image rm $(shell docker images -f dangling=true -q)
