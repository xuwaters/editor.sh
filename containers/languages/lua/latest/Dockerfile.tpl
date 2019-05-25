FROM ubuntu:latest
LABEL MAINTAINER="xuwaters@gmail.com"

USER root
RUN apt-get update && apt-get install -y lua5.3 && \
    ln -s /usr/bin/lua5.3 /usr/local/bin/lua && ln -s /usr/bin/luac5.3 /usr/local/bin/luac

{{template "yscript.dockerfile"}}
