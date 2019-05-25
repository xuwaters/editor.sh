use actix::prelude::*;
use failure::{err_msg, Fallible, ResultExt};
use juniper::http::GraphQLRequest;
use std::sync::Arc;

use super::config::Config;
use super::launch;
use crate::db;
use crate::graphql::{self, api::GraphSchema, ctx::GraphContext};

lazy_static! {
    static ref DB_POOL: db::DBPool = {
        let config = launch::config();
        let db_pool = start_database_pool(config)
            .context(err_msg("start database pool failure"))
            .unwrap();
        db_pool
    };
    static ref API_EXECUTOR: Addr<GraphQLExecutor> = {
        let pool = db_pool();
        let executor = start_graphql_service(pool.clone())
            .context(err_msg("start graphql service failure"))
            .unwrap();
        executor
    };
}

pub fn db_pool() -> &'static db::DBPool {
    &DB_POOL
}

pub fn api_executor() -> &'static Addr<GraphQLExecutor> {
    &API_EXECUTOR
}

pub fn get_database_url(config: &Config) -> Fallible<String> {
    let postgres = &config.postgres;
    let database_url = format!(
        "postgres://{username}:{password}@{host}/{database}",
        username = postgres.username,
        password = postgres.password,
        host = postgres.host,
        database = postgres.database,
    );
    Ok(database_url)
}

fn start_database_pool(config: &Config) -> Fallible<db::DBPool> {
    let database_url = get_database_url(config)?;
    let pool = db::new_pool(database_url)?;
    Ok(pool)
}

fn start_graphql_service(pool: db::DBPool) -> Fallible<Addr<GraphQLExecutor>> {
    let schema = Arc::new(graphql::api::create_graph_schema());
    let thread_num = num_cpus::get();
    let graphql_addr = SyncArbiter::start(thread_num, move || {
        GraphQLExecutor::new(schema.clone(), pool.clone())
    });

    return Ok(graphql_addr);
}

// Actor Message

pub struct GraphQLData {
    pub request: GraphQLRequest,
    pub authorization: String,
}

impl Message for GraphQLData {
    type Result = Result<String, actix_web::Error>;
}

// GraphQLExecutor Actor
pub struct GraphQLExecutor {
    schema: Arc<GraphSchema>,
    pool: db::DBPool,
}

impl GraphQLExecutor {
    fn new(schema: Arc<GraphSchema>, pool: db::DBPool) -> GraphQLExecutor {
        GraphQLExecutor { schema, pool }
    }
}

impl Actor for GraphQLExecutor {
    type Context = SyncContext<Self>;
}

fn parse_authorization(authorization: &String) -> Option<String> {
    let parts: Vec<&str> = authorization.splitn(2, ' ').collect();
    if parts.len() == 2 {
        Some(parts[1].to_string())
    } else {
        None
    }
}

impl Handler<GraphQLData> for GraphQLExecutor {
    type Result = Result<String, actix_web::Error>;

    fn handle(&mut self, msg: GraphQLData, _ctx: &mut Self::Context) -> Self::Result {
        let dao = db::ApiDao::new(&self.pool);
        let auth_token = parse_authorization(&msg.authorization).unwrap_or("".to_owned());
        let session = dao.user.get_session_by_auth_token(&auth_token)?;
        let graphql_ctx = GraphContext::new(auth_token, session, dao);
        let res = msg.request.execute(&self.schema, &graphql_ctx);
        let res_text = serde_json::to_string_pretty(&res)?;
        Ok(res_text)
    }
}

// handle queries from room
#[derive(Debug)]
pub struct ReqQueryPad {
    pub hash: String,
}
impl Message for ReqQueryPad {
    type Result = Result<RespQueryPad, actix_web::Error>;
}
pub struct RespQueryPad {
    pub hash: String,
    pub pad: Option<db::Pad>,
    pub content: Option<db::PadContent>,
}
impl Handler<ReqQueryPad> for GraphQLExecutor {
    type Result = MessageResult<ReqQueryPad>;

    fn handle(&mut self, msg: ReqQueryPad, ctx: &mut Self::Context) -> Self::Result {
        let pads_dao = db::dao::pads::PadsDao::new(&self.pool);
        let pad_option = match pads_dao.query_pad_by_hash(msg.hash.as_str()) {
            Err(err) => {
                info!("ReqQueryPad failure: hash = {}, err = {:?}", msg.hash, err);
                return MessageResult(Err(err.into()));
            }
            Ok(val) => val,
        };
        match pad_option {
            None => MessageResult(Ok(RespQueryPad {
                hash: msg.hash,
                pad: None,
                content: None,
            })),
            Some(pad) => {
                let pad_id = pad.id;
                let content_option = match pads_dao.query_pad_content(pad_id) {
                    Err(err) => return MessageResult(Err(err.into())),
                    Ok(val) => val,
                };
                MessageResult(Ok(RespQueryPad {
                    hash: msg.hash,
                    pad: Some(pad),
                    content: content_option,
                }))
            }
        }
    }
}

#[derive(Debug)]
pub struct ReqSavePadContent {
    pub content: db::NewPadContent,
}
impl Message for ReqSavePadContent {
    type Result = Result<(), actix_web::Error>;
}
impl Handler<ReqSavePadContent> for GraphQLExecutor {
    type Result = MessageResult<ReqSavePadContent>;

    fn handle(&mut self, msg: ReqSavePadContent, ctx: &mut Self::Context) -> Self::Result {
        let pad_id = msg.content.pad_id;
        info!("ReqSaveContent, pad_id = {}", pad_id);
        let pads_dao = db::dao::pads::PadsDao::new(&self.pool);
        match pads_dao.save_pad_content(msg.content) {
            Err(err) => {
                warn!(
                    "ReqSavePadContent failure, id = {}, err = {:?}",
                    pad_id, err
                );
                MessageResult(Err(err.into()))
            }
            Ok(_) => MessageResult(Ok(())),
        }
    }
}

#[derive(Debug)]
pub struct ReqUpdatePad {
    pub pad_id: i32,
    pub changeset: db::PadChangeset,
}
impl Message for ReqUpdatePad {
    type Result = Result<(), actix_web::Error>;
}
impl Handler<ReqUpdatePad> for GraphQLExecutor {
    type Result = MessageResult<ReqUpdatePad>;

    fn handle(&mut self, msg: ReqUpdatePad, ctx: &mut Self::Context) -> Self::Result {
        info!("ReqUpdatePad, msg = {:?}", msg);
        let pads_dao = db::dao::pads::PadsDao::new(&self.pool);
        match pads_dao.update_pad(msg.pad_id, msg.changeset) {
            Err(err) => {
                warn!("ReqUpdatePad failure: id = {}, err = {:?}", msg.pad_id, err);
                MessageResult(Err(err.into()))
            }
            Ok(_) => MessageResult(Ok(())),
        }
    }
}
