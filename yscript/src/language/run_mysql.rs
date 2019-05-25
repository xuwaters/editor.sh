use failure::{format_err, Fallible, ResultExt};
use std::process::ExitStatus;
use std::env;

use super::{cmd, util};

pub fn run(files: Vec<&str>, stdin: &str) -> Fallible<ExitStatus> {
    let work_dir = util::dirname(files[0])?;
    let file_bytes: Vec<u8> = util::read_file(files[0])?;
    let file_content = String::from_utf8(file_bytes)
        .context(format_err!("file content is not utf8: {}", files[0]))?;

    let default_mysql_host = "127.0.0.1".to_owned();
    let mysql_host = env::var("MYSQL_HOST").unwrap_or(default_mysql_host);
    cmd::run_stdin(
        work_dir,
        vec!["mysql", "--host", &mysql_host],
        file_content.as_str(),
    )
}
