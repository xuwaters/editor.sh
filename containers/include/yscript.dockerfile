######## yscript #######

# Add user
USER root
RUN groupadd ye && useradd -m -d /home/ye -g ye -s /bin/bash ye

# Add yscript
ADD ./bin/yscript /usr/local/bin/yscript
RUN chmod +x /usr/local/bin/yscript

USER ye
WORKDIR /home/ye/
CMD ["yscript"]
