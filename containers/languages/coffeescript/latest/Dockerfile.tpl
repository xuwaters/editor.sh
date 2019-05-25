FROM node:latest
LABEL MAINTAINER="xuwaters@gmail.com"

RUN npm install -g coffeescript

{{template "yscript.dockerfile"}}
