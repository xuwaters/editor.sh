# YEditor

Yet another live programming environment for collaborative code editing and running.

A complete runnable example about [`Angular`](https://angular.io/), [`NgRx`](https://ngrx.io/), [`Monaco Editor`](https://microsoft.github.io/monaco-editor/index.html), [`Xterm.js`](https://xtermjs.org/), [`actix-web`](https://actix.rs/), [`Diesel`](https://diesel.rs/), [`GraphQL`](https://graphql.org/), [`Gin`](https://gin-gonic.com/), [`Docker`](https://www.docker.com/).

For a live preview: https://editor.sh

## Bird's-eye View

```

+--------------+
|    CLIENT    +----------------+
+------+-------+                |
       |                        |
       |                        |
       |                        |
       |                        |
       |                        |
+------v-------+        +-------v-------+                  +-----------------+
|              |        |               |                  |                 |
|  API SERVER  |        |  ROOM SERVER  +------------------>  RUNNER SERVER  |
|              |        |               |                  |                 |
+------+-------+        +-------+-------+                  +--------+--------+
       |                        |                                   |
       |                        |                                   |
       |                        |                                   |
       |                        |                                   |
       +------+                 |                                   |
              |                 |                                   |
              |                 |                                   |
        +-----v------+          |                        +----------v----------+
        |            |          |                        |                     |
        |  DATABASE  <----------+                        |  DOCKER CONTAINERS  |
        |            |                                   |                     |
        +------------+                                   +---------------------+

```

`CLIENT (yeditor_client)`: Single page application implemented in [`Angular`](https://angular.io/).

`API SERVER (yeditor)`: Responsible for `login`, `authorization` and `business logic`.

`ROOM SERVER (yeditor)`: Responsible for hosting a live `room`, synchronizing editing operations and terminal operations among room members.

`RUNNER SERVER (yrunner-go)`: Stateless server for running commands and interactive shell in an isolated environment.

`YSCRIPT (yscript)`: Entrypoint of each docker image, providing a unifined interface for running any language.


## How to run

- Start Client

```
cd yeditor_client && yarn && yarn start
```

- Start Database

```
# data folder
mkdir -p ./var/database/postgres

# start db
docker run --detach --rm --name postgres \
       -e POSTGRES_PASSWORD=postgres \
       -p 127.0.0.1:5432:5432 \
       -v `pwd`/var/database/postgres:/var/lib/postgresql/data \
       postgres:latest


# create db

echo "create database yeditor;" | \
  docker exec -i -e POSTGRES_PASSWORD=postgres postgres psql -Upostgres

```

- Prepare for Building

```
cargo install diesel_cli
```


- Migrate database

```
cd yeditor && cargo run -- --migration && cd ..

# insert demo pad

echo "insert into pads values (1, 'demo', 1, 'demo', 'unused', '', 'typescript');" | \
  docker exec -i -e POSTGRES_PASSWORD=postgres postgres psql -Upostgres yeditor

```

- Build Containers

```
cd containers && make build && cd ..
```


- Start Servers

```
# start API SERVER
cd yeditor && cargo run

# start RUNNER SERVER
cd yrunner-go && go build -o bin/yrunner && ./bin/yrunner service --config config.yaml --debug

```

- Open browser

```
open http://127.0.0.1:4200/demo
```


## Supported Languages

```
bash
c
csharp
cpp
clojure
coffeescript
crystal
elixir
erlang
fsharp
go
haskell
java
javascript
kotlin
markdown
mysql
ocaml
objc
php
perl
perl6
plaintext
postgres
python2
python3
r
ruby
rust
scala
swift
typescript
vb
```


## Roadmap

- Implement [`CRDT`](https://github.com/atom/teletype-crdt) algorithm for collaborative code editing.
- Separate `room server` and `api server`, add a load balancer in front of room server, routing by `room_hash`.
- Make `room server` stateless.
- Add cache layer for `database`.

## Contribution

Welcome for contributions!
