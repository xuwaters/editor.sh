FROM openjdk:8
LABEL MAINTAINER="xuwaters@gmail.com"

RUN wget -O- "https://downloads.lightbend.com/scala/2.12.8/scala-2.12.8.tgz" \
    | tar xzf - -C /usr/local --strip-components=1

{{template "yscript.dockerfile"}}
