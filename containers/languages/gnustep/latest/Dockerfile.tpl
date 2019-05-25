FROM ubuntu:19.04
LABEL MAINTAINER="xuwaters@gmail.com"

RUN mkdir -p /ubuntu-19.04-clang-8.0-runtime-2.0
ADD ./languages/gnustep/latest/files/ubuntu-19.04-clang-8.0-runtime-2.0/build.sh /ubuntu-19.04-clang-8.0-runtime-2.0/build.sh
RUN chmod +x /ubuntu-19.04-clang-8.0-runtime-2.0/build.sh

RUN apt-get update && apt-get install -y clang build-essential wget git sudo
RUN /bin/bash -c "/ubuntu-19.04-clang-8.0-runtime-2.0/build.sh"

{{template "yscript.dockerfile"}}

RUN echo ". /usr/GNUstep/System/Library/Makefiles/GNUstep.sh" >> /home/ye/.profile
