use failure::{format_err, Fallible};
use std::path::Path;
use std::process::ExitStatus;

use super::{cmd, util};

pub fn run(files: Vec<&str>, stdin: &str) -> Fallible<ExitStatus> {
    let work_dir = util::dirname(files[0])?;
    let bin_file = "main_cpp";

    let mut source_files = util::filter_by_extension(&files, ".cpp");
    let mut args = vec!["clang++", "-std=c++11", "-o", bin_file];
    args.append(&mut source_files);
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
