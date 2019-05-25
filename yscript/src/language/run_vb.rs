use failure::{format_err, Fallible};
use std::path::Path;
use std::process::ExitStatus;

use super::{cmd, util};

pub fn run(files: Vec<&str>, stdin: &str) -> Fallible<ExitStatus> {
    let work_dir = util::dirname(files[0])?;
    let bin_file = "main_vb.exe";

    let out_flag = format!("/out:{}", bin_file);
    let args = vec!["vbc", "/target:exe", out_flag.as_str(), files[0]];
    let status: ExitStatus = cmd::run(work_dir, args)?;

    if !status.success() {
        return Ok(status);
    }

    let bin_path_buf = Path::new(work_dir).join(bin_file);
    let bin_path = bin_path_buf
        .to_str()
        .ok_or(format_err!("invalid bin_path"))?;
    cmd::run_stdin(work_dir, vec!["mono", bin_path], stdin)
}
