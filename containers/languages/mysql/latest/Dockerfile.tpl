FROM mariadb:latest
LABEL MAINTAINER="xuwaters@gmail.com"

{{template "yscript.dockerfile"}}

ENV MYSQL_ALLOW_EMPTY_PASSWORD=true
USER root
