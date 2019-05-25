use failure::Fallible;
use structopt::StructOpt;

use super::api;
use super::config::Config;
use super::server;
use super::cli;

lazy_static! {
    static ref CMD_LINE_OPT: cli::CmdLineOpt = cli::CmdLineOpt::from_args();
    static ref CONFIG: Config = {
        let options = cmd_line_opt();
        let config = Config::from_file(&options.config_file).unwrap();
        config
    };
}

pub fn cmd_line_opt() -> &'static cli::CmdLineOpt {
    &CMD_LINE_OPT
}

pub fn config() -> &'static Config {
    &CONFIG
}

pub fn launch() -> Fallible<()> {
    let config = config();
    setup_logger(config)?;
    info!("yeditor config file:\n{:#?}", config);

    let options = cmd_line_opt();
    if options.migration {
        return db_migration(config);
    }

    let server = server::Server::create()?;
    let _ = server.run();

    Ok(())
}

fn setup_logger(config: &Config) -> Fallible<()> {
    let crate_name = env!("CARGO_PKG_NAME");
    let default_filter = format!("{}={}", crate_name, config.log.level);
    let environment = env_logger::Env::default().default_filter_or(&default_filter);
    env_logger::init_from_env(environment);
    info!("log default_filter = {}", default_filter);
    Ok(())
}

embed_migrations!();

fn db_migration(config: &Config) -> Fallible<()> {
    use diesel::pg::PgConnection;
    use diesel::prelude::*;
    let database_url = api::get_database_url(config)?;
    let connection = PgConnection::establish(&database_url)?;
    self::embedded_migrations::run(&connection)?;
    Ok(())
}
