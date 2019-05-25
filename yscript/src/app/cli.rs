use structopt::StructOpt;

#[derive(Debug, Clone, StructOpt)]
/// Ported from https://github.com/prasmussen/glot-code-runner
pub struct CmdLineOpt {
    #[structopt(short = "w", long = "work-dir")]
    /// Working directory, if not specified, will use a temporary directory.
    pub work_dir: Option<String>,

    #[structopt(short = "f", long = "file")]
    /// Read input from file, if not specified, read from STDIN.
    pub file: Option<String>,

    #[structopt(short = "l", long = "list")]
    /// List all supported languages.
    pub list: bool,

    #[structopt(long = "sample")]
    /// Sample stdin or file content.
    pub sample: bool,
}
