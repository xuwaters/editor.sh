use failure::{format_err, Fallible};
use std::path::Path;
use std::process::ExitStatus;

use super::{cmd, util};

pub fn run(files: Vec<&str>, stdin: &str) -> Fallible<ExitStatus> {
    let work_dir = util::dirname(files[0])?;
    let obj_name = "a.o";
    let bin_name = "a.out";

    let status = cmd::run(
        work_dir,
        vec!["nasm", "-f", "elf64", "-o", obj_name, files[0]],
    )?;
    if !status.success() {
        return Ok(status);
    }

    let status = cmd::run(work_dir, vec!["ld", "-o", bin_name, obj_name])?;
    if !status.success() {
        return Ok(status);
    }

    let bin_path_buf = Path::new(work_dir).join(bin_name);
    let bin_path = bin_path_buf
        .to_str()
        .ok_or(format_err!("invalid bin_path"))?;

    cmd::run_stdin(work_dir, vec![bin_path], stdin)
}
