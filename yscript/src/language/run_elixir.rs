use failure::{format_err, Fallible};
use std::path::Path;
use std::process::ExitStatus;

use super::{cmd, util};

pub fn run(files: Vec<&str>, stdin: &str) -> Fallible<ExitStatus> {
    let work_dir = util::dirname(files[0])?;

    let mut source_files = util::filter_by_extension(&files, ".ex");
    let mut args = vec!["elixirc"];
    args.append(&mut source_files);

    cmd::run_stdin(work_dir, args, stdin)
}
