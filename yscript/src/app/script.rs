use failure::{format_err, Fallible, ResultExt};
use regex::Regex;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::process::ExitStatus;
use tempfile;

use crate::language;

#[derive(Debug, Clone, Deserialize)]
pub struct Payload {
    pub language: String,
    pub files: Vec<InMemoryFile>,
    pub stdin: Option<String>,
    pub command: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct InMemoryFile {
    pub name: String,
    pub content: String,
}

pub fn run_from_reader<R: io::Read>(reader: R, work_dir: Option<String>) -> Fallible<ExitStatus> {
    let payload = serde_json::from_reader::<R, Payload>(reader)
        .context(format_err!("invalid payload format"))?;

    run_from_payload(payload, work_dir)
}

pub fn run_from_payload(payload: Payload, work_dir: Option<String>) -> Fallible<ExitStatus> {
    if payload.files.is_empty() {
        return Err(format_err!("no files"));
    }
    if !language::is_supported(payload.language.as_str()) {
        return Err(format_err!("not supported language: {}", payload.language));
    }

    let (file_paths, _temp_dir) = write_files(&payload.files, work_dir.as_ref())?;

    if payload.command.is_none() {
        let language = payload.language.as_str();
        let file_paths = file_paths.iter().map(|s| s.as_str()).collect();
        let stdin = payload.stdin.as_ref().map(|s| s.as_str());
        language::run_code(language, file_paths, stdin)
    } else {
        let run_dir = Path::new(&file_paths[0])
            .parent()
            .and_then(|p| p.to_str())
            .ok_or(format_err!("invalid run directory"))?;

        let command = payload
            .command
            .as_ref()
            .ok_or(format_err!("command not provided"))?;

        let stdin = payload.stdin.as_ref().map(|s| s.as_str());
        language::run_bash_stdin(run_dir, command.as_str(), stdin)
    }
}

fn write_files(
    files: &Vec<InMemoryFile>,
    work_dir: Option<&String>,
) -> Fallible<(Vec<String>, Option<tempfile::TempDir>)> {
    // check file names
    let valid_filename: Regex = Regex::new(r"^[a-zA-Z0-9_]+[.a-zA-Z0-9_-]*$")
        .context(format_err!("valid_filename pattern is error"))?;
    for file in files {
        if !valid_filename.is_match(file.name.as_str()) {
            return Err(format_err!("invalid file name: {}", file.name));
        }
    }

    let mut temp_dir: Option<tempfile::TempDir> = None;
    let write_dir: PathBuf = match work_dir {
        Some(dir) => {
            let curr_path = Path::new(dir);
            if !curr_path.is_dir() {
                return Err(format_err!("work directory not exists: {}", dir));
            }
            curr_path.canonicalize()?.into()
        }
        None => {
            temp_dir = Some(tempfile::tempdir_in(".")?);
            // do not persist the temporary directory into disk
            temp_dir.as_ref().map(|t| t.path()).unwrap().to_owned()
        }
    };

    //
    let mut file_paths = vec![];
    for file in files {
        let file_path = write_file(&write_dir, file)?;
        file_paths.push(file_path);
    }

    Ok((file_paths, temp_dir))
}

fn write_file(write_dir: &Path, file: &InMemoryFile) -> Fallible<String> {
    use std::io::Write;

    let file_path = write_dir.join(&file.name);
    let fout = fs::File::create(&file_path)?;
    let mut buf_writer = io::BufWriter::new(fout);
    buf_writer.write_all(file.content.as_bytes())?;
    let full_path = file_path
        .to_str()
        .ok_or(format_err!("invalid file path"))?
        .to_owned();
    Ok(full_path)
}
