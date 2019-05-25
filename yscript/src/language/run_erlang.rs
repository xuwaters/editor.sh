use failure::{format_err, Fallible};
use std::path::Path;
use std::process::ExitStatus;

use super::{cmd, util};

pub fn run(files: Vec<&str>, stdin: &str) -> Fallible<ExitStatus> {
    let work_dir = util::dirname(files[0])?;

    // Compile all files except the first
    for file in files.iter().skip(1) {
        let status = cmd::run(work_dir, vec!["erlc", *file])?;
        if !status.success() {
            return Ok(status);
        }
    }

    // Run first file with escript
    cmd::run_stdin(work_dir, vec!["escript", files[0]], stdin)
}
