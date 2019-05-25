FROM python:latest
LABEL MAINTAINER="xuwaters@gmail.com"

RUN pip3 install mdv

{{template "yscript.dockerfile"}}
