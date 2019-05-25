FROM clojure:latest
LABEL MAINTAINER="xuwaters@gmail.com"

# Add clojure.jar link
RUN ln -s /usr/share/java/leiningen-*-standalone.jar /usr/share/java/clojure.jar
ADD ./languages/clojure/bin/clojure /usr/local/bin/clojure
RUN chmod +x /usr/local/bin/clojure

{{template "yscript.dockerfile"}}
