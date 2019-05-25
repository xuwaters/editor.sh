FROM postgres:latest
LABEL MAINTAINER="xuwaters@gmail.com"

{{template "yscript.dockerfile"}}

USER root
