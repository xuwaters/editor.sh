FROM ubuntu:latest
LABEL MAINTAINER="xuwaters@gmail.com"

RUN apt-get update && apt-get install -y nasm binutils

{{ template "yscript.dockerfile" }}
