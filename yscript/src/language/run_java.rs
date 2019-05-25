use failure::{format_err, Fallible};
use std::ffi::OsStr;
use std::path::Path;
use std::process::ExitStatus;

use super::{cmd, util};

pub fn run(files: Vec<&str>, stdin: &str) -> Fallible<ExitStatus> {
    let work_dir = util::dirname(files[0])?;

    let filename = util::basename(files[0])?;
    let args = vec!["javac", filename];
    let status: ExitStatus = cmd::run(work_dir, args)?;

    if !status.success() {
        return Ok(status);
    }

    let classname = class_name(filename)?;
    cmd::run_stdin(work_dir, vec!["java", classname], stdin)
}

fn class_name(filename: &str) -> Fallible<&str> {
    let classname = Path::new(filename)
        .file_stem()
        .and_then(|s: &OsStr| s.to_str())
        .ok_or(format_err!("class_name not found"))?;
    Ok(classname)
}
