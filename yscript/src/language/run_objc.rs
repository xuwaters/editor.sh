use failure::{format_err, Fallible, ResultExt};
use std::path::Path;
use std::process::ExitStatus;

use super::{cmd, util};

pub fn run(files: Vec<&str>, stdin: &str) -> Fallible<ExitStatus> {
    let work_dir = util::dirname(files[0])?;
    let bin_file = "main_oc";

    let compile_cmd = format!(
        "clang `gnustep-config --objc-flags` `gnustep-config --objc-libs` \
         -lobjc -ldispatch -lgnustep-base -fobjc-arc -o {} \"{}\"",
        bin_file, files[0]
    );
    let status: ExitStatus = cmd::run_bash(work_dir, &compile_cmd)?;

    if !status.success() {
        return Ok(status);
    }

    let bin_path_buf = Path::new(work_dir).join(bin_file);
    let bin_path = bin_path_buf
        .to_str()
        .ok_or(format_err!("invalid bin_path"))?;
    cmd::run_bash_stdin(work_dir, bin_path, stdin)
}
