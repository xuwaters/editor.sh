FROM rakudo-star:latest
LABEL MAINTAINER="xuwaters@gmail.com"

#Remove terminal colour codes for error reporting from Rakudo compiler output
ENV RAKUDO_ERROR_COLOR 0

{{template "yscript.dockerfile"}}
