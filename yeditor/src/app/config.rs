use failure::{Fallible, ResultExt};
use std::{collections, fs, path};
use toml;

#[derive(Clone, Deserialize, Debug)]
pub struct Config {
    pub server: ServerConfig,
    pub postgres: DatabaseConfig,
    pub log: LogConfig,
    pub room: RoomConfig,
    pub languages: collections::BTreeMap<String, LangItem>,
}

impl Config {
    pub fn from_file(filename: &str) -> Fallible<Self> {
        let content = fs::read_to_string(filename)
            .context(format!("open config file failure: {}", filename))?;

        let mut config: Config =
            toml::from_str(&content).context("load from config toml failure")?;

        // read from dotenv
        let github_client_id = dotenv::var("GITHUB_CLIENT_ID").unwrap_or("".to_owned());
        let github_client_secret = dotenv::var("GITHUB_CLIENT_SECRET").unwrap_or("".to_owned());
        if github_client_id.len() > 0 {
            config.server.github_client_id = github_client_id;
        }
        if github_client_secret.len() > 0 {
            config.server.github_client_secret = github_client_secret;
        }

        Ok(config)
    }

    pub fn get_lang(&self, name: &String) -> Option<Language> {
        match self.languages.get(name) {
            None => None,
            Some(item) => Some(Language {
                name: name.clone(),
                ui: item.ui.clone(),
                editor: item.editor.clone(),
            }),
        }
    }
}

#[derive(Clone, Deserialize, Debug)]
pub struct ServerConfig {
    pub bind_url: String,
    pub tls_cert: path::PathBuf,
    pub tls_key: path::PathBuf,
    pub github_client_id: String,
    pub github_client_secret: String,
    pub github_auth_url: String,
    pub github_token_url: String,
}

#[derive(Clone, Deserialize, Debug)]
pub struct DatabaseConfig {
    pub username: String,
    pub password: String,
    pub host: String,
    pub database: String,
}

#[derive(Clone, Deserialize, Debug)]
pub struct LogConfig {
    pub level: String,
}

// room config

#[derive(Clone, Deserialize, Debug)]
pub struct RoomConfig {
    pub runner_service_url: String,

    #[serde(default = "room_default_close_delay_ms")]
    pub close_delay_ms: u64,

    #[serde(default = "room_default_cache_lines")]
    pub cache_lines: usize,

    #[serde(default = "room_default_client_keep_alive_ms")]
    pub client_keep_alive_ms: u64,

    #[serde(default = "room_default_client_timeout_ms")]
    pub client_timeout_ms: u64,

    #[serde(default = "room_default_auto_save_seconds")]
    pub auto_save_seconds: u64,

    #[serde(default = "room_default_agent_keep_alive_seconds")]
    pub agent_keep_alive_seconds: u64,

    #[serde(default = "room_default_max_pads_per_user")]
    pub max_pads_per_user: u64,
}

fn room_default_close_delay_ms() -> u64 {
    10000
}

fn room_default_cache_lines() -> usize {
    30
}

fn room_default_client_keep_alive_ms() -> u64 {
    10000
}

fn room_default_client_timeout_ms() -> u64 {
    15000
}

fn room_default_auto_save_seconds() -> u64 {
    300
}

fn room_default_agent_keep_alive_seconds() -> u64 {
    3
}

fn room_default_max_pads_per_user() -> u64 {
    0
}

#[derive(Clone, Deserialize, Debug)]
pub struct LangItem {
    pub ui: String,
    pub editor: String,
}

#[derive(Clone, Debug)]
pub struct Language {
    pub name: String,
    pub ui: String,
    pub editor: String,
}
