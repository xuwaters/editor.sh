

ported from [prasmussen/glot-containers](https://github.com/prasmussen/glot-containers)



## swift

swift REPL needs to run as (add `personality` syscall and `sys_ptrace` capability):

```
docker run -ti --rm \
    --security-opt seccomp=bin/swift.json \
    --cap-add=sys_ptrace \
    yscript/swift:latest swift
```

The bug is discussed here: https://github.com/apple/swift-docker/issues/9#issuecomment-328224511
