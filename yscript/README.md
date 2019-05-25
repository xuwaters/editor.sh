
## Description

`yscript` is a command line application that reads code as a json payload from stdin – compiles and runs the code – and writes the result to stdout directly (which is different from glot-code-runner).

ported from [prasmussen/glot-code-runner](https://github.com/prasmussen/glot-code-runner)


## Usage

```
USAGE:
    yscript [FLAGS] [OPTIONS]

FLAGS:
    -h, --help       Prints help information
    -l, --list       List all supported languages.
        --sample     Sample stdin or file content.
    -V, --version    Prints version information

OPTIONS:
    -f, --file <file>            Read input from file, if not specified, read from STDIN.
    -w, --work-dir <work_dir>    Working directory, if not specified, will use a temporary directory.

```

## Example

```bash
$ mkdir temp
$ yscript --sample | yscript -w temp

Hello PHP!
This is a text!
```


## Supported Languages

```
assembly
bash
c
clojure
coffeescript
cpp
crystal
csharp
elixir
erlang
fsharp
go
groovy
haskell
java
javascript
julia
kotlin
lua
markdown
mysql
objc
ocaml
perl
perl6
php
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

## Sample Input Json Content

```json
{
  "language": "python2",
  "stdin": "42",
  "files": [
    {
      "name": "main.py",
      "content": "print(input('Number from stdin: '))"
    }
  ]
}
```
