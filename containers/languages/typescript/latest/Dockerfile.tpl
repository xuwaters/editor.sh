FROM node:latest
LABEL MAINTAINER="xuwaters@gmail.com"

RUN npm install -g typescript && npm install -g ts-node

{{template "yscript.dockerfile"}}
