use structopt::StructOpt;

#[derive(Debug, Clone, StructOpt)]
#[structopt(rename_all = "kebab-case")]
pub struct CmdLineOpt {
    #[structopt(short = "c", long = "config-file", default_value = "Config.toml")]
    pub config_file: String,

    #[structopt(long = "migration")]
    pub migration: bool,
}
