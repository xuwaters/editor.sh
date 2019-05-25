use failure::{format_err, Fallible};
use std::ffi::OsStr;
use std::path::Path;
use std::process::ExitStatus;

use super::{cmd, util};

pub fn run(files: Vec<&str>, stdin: &str) -> Fallible<ExitStatus> {
    let work_dir = util::dirname(files[0])?;

    let filename = util::basename(files[0])?;
    let main_jar = "main_kt.jar";

    let args = vec!["kotlinc", "-d", main_jar, filename];
    let status: ExitStatus = cmd::run(work_dir, args)?;

    if !status.success() {
        return Ok(status);
    }

    let classname = class_name(filename)?;
    cmd::run_stdin(
        work_dir,
        vec!["kotlin", "-classpath", main_jar, classname.as_str()],
        stdin,
    )
}

fn class_name(filename: &str) -> Fallible<String> {
    let classname: &str = Path::new(filename)
        .file_stem()
        .and_then(|s: &OsStr| s.to_str())
        .ok_or(format_err!("class_name not found"))?;

    let mut chars = classname.chars();
    match chars.next() {
        None => Err(format_err!("classname empty")),
        Some(c) => {
            let capitalized = c.to_uppercase().chain(chars).collect::<String>();
            Ok(capitalized + "Kt")
        }
    }
}
