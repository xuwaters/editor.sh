use failure::{format_err, Fallible, ResultExt};
use std::ffi::OsStr;
use std::fs::File;
use std::io::prelude::*;
use std::io::BufReader;
use std::path::Path;

pub fn basename(file_path: &str) -> Fallible<&str> {
    let file_name = Path::new(file_path)
        .file_name()
        .and_then(|s: &OsStr| s.to_str())
        .ok_or(format_err!("can not get basename: {}", file_path))?;
    Ok(file_name)
}

pub fn dirname(file_path: &str) -> Fallible<&str> {
    let dir = Path::new(file_path)
        .parent()
        .and_then(|p| p.to_str())
        .ok_or(format_err!("can not get dirname: {}", file_path))?;

    Ok(dir)
}

pub fn filter_by_extension<'a>(files: &Vec<&'a str>, ext: &str) -> Vec<&'a str> {
    let mut res = vec![];
    for file in files {
        if file.ends_with(ext) {
            res.push(*file);
        }
    }
    res
}

pub fn read_file(file_path: &str) -> Fallible<Vec<u8>> {
    let fin = File::open(file_path).context(format_err!("open file failure: {}", file_path))?;
    let mut freader = BufReader::new(fin);
    let mut content = Vec::new();
    freader
        .read_to_end(&mut content)
        .context(format_err!("read file failure: {}", file_path))?;
    Ok(content)
}
