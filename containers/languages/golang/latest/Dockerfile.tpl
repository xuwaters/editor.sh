FROM golang:latest
LABEL MAINTAINER="xuwaters@gmail.com"

RUN apt-get update && apt-get install -y rlwrap
ADD ./languages/golang/latest/files/gomacro /usr/local/bin/gomacro
RUN chmod +x /usr/local/bin/gomacro

{{template "yscript.dockerfile"}}
