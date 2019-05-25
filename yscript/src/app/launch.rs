use failure::Fallible;
use std::fs;
use std::io;
use structopt::StructOpt;

use super::cli;
use super::script;
use crate::language;

lazy_static! {
    static ref CMD_LINE_OPT: cli::CmdLineOpt = cli::CmdLineOpt::from_args();
    static ref SAMPLE_JSON: &'static str = r#"{
  "language": "python2",
  "stdin": "42",
  "files": [
    {
      "name": "main.py",
      "content": "print(input('Number from stdin: '))"
    }
  ]
}"#;
}

pub fn cmd_line_opt() -> &'static cli::CmdLineOpt {
    &CMD_LINE_OPT
}

pub fn launch() -> Fallible<()> {
    let opts = cmd_line_opt();
    if opts.list {
        for lang in language::supported_languages() {
            println!("{}", lang);
        }
    } else if opts.sample {
        println!("{}", *SAMPLE_JSON);
    } else {
        let work_dir = opts.work_dir.as_ref().cloned();
        match opts.file.as_ref() {
            None => {
                script::run_from_reader(io::stdin(), work_dir)?;
            }
            Some(filename) => {
                let fin = fs::File::open(filename)?;
                let fin = io::BufReader::new(fin);
                script::run_from_reader(fin, opts.work_dir.clone())?;
            }
        };
    }

    Ok(())
}
