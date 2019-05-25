FROM perl:latest
LABEL MAINTAINER="xuwaters@gmail.com"

RUN apt-get update && apt-get install -y rlwrap
ADD ./languages/perl/latest/files/perli /usr/local/bin/perli
RUN chmod +x /usr/local/bin/perli

{{template "yscript.dockerfile"}}
