use failure::{format_err, Fallible};
use std::process::ExitStatus;

use super::{cmd, util};

pub fn run(files: Vec<&str>, stdin: &str) -> Fallible<ExitStatus> {
    let work_dir = util::dirname(files[0])?;
    cmd::run_stdin(work_dir, vec!["groovy", files[0]], stdin)
}
