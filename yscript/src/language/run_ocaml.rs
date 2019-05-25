use failure::{format_err, Fallible, ResultExt};
use std::path::Path;
use std::process::ExitStatus;

use super::{cmd, util};

pub fn run(mut files: Vec<&str>, stdin: &str) -> Fallible<ExitStatus> {
    let work_dir = util::dirname(files[0])?;
    let bin_file = "main_ocaml";

    let mut args = vec!["ocamlc", "-o", bin_file];
    files.reverse();
    args.append(&mut files);

    let status: ExitStatus = cmd::run(work_dir, args)?;

    if !status.success() {
        return Ok(status);
    }

    let bin_path_buf = Path::new(work_dir).join(bin_file);
    let bin_path = bin_path_buf
        .to_str()
        .ok_or(format_err!("invalid bin_path"))?;
    cmd::run_stdin(work_dir, vec![bin_path], stdin)
}
