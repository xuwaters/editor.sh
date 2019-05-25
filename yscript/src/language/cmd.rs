use failure::{format_err, Fallible, ResultExt};
use std::io::{self, BufWriter, Write};
use std::path::Path;
use std::process::{Child, Command, ExitStatus, Stdio};

pub fn run_stdin(work_dir: &str, args: Vec<&str>, stdin: &str) -> Fallible<ExitStatus> {
    let mut child: Child = Command::new(args[0])
        .args(&args[1..])
        .current_dir(work_dir)
        .stdin(Stdio::piped())
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .spawn()
        .context(format_err!("spawn command failure: {:?}", args))?;

    let child_stdin = child
        .stdin
        .as_mut()
        .ok_or(format_err!("get child stdin failure: {:?}", args))?;

    {
        let mut stdin_writer = BufWriter::new(child_stdin);
        stdin_writer
            .write_all(stdin.as_bytes())
            .context(format_err!("write stdin to command failure: {:?}", args))?;
    }

    let exit_status = child
        .wait()
        .context(format_err!("wait for command failure: {:?}", args))?;

    Ok(exit_status)
}

pub fn run(work_dir: &str, args: Vec<&str>) -> Fallible<ExitStatus> {
    run_stdin(work_dir, args, "")
}

pub fn run_bash_stdin(work_dir: &str, command: &str, stdin: &str) -> Fallible<ExitStatus> {
    run_stdin(work_dir, vec!["bash", "--login", "-c", command], stdin)
}

pub fn run_bash(work_dir: &str, command: &str) -> Fallible<ExitStatus> {
    run_bash_stdin(work_dir, command, "")
}
