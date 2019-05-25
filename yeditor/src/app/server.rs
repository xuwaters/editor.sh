use actix::prelude::*;
use actix::SystemRunner;
use actix_web::{
    http, middleware, server, ws, App, AsyncResponder, Error, FutureResponse, HttpRequest,
    HttpResponse, Json,
};
use failure::{Fallible, ResultExt};
use futures::future::Future;
use juniper::http::GraphQLRequest;
use openssl::ssl::{SslAcceptor, SslAcceptorBuilder, SslFiletype, SslMethod};

use super::api;
use super::config::Config;
use super::launch;
use crate::{graphql::playground, room};

// AppState

pub struct AppState {
    pub executor: Addr<api::GraphQLExecutor>,
}

pub struct Server {
    runner: SystemRunner,
    bind_url: url::Url,
}

impl Server {
    pub fn create() -> Fallible<Self> {
        let runner = System::new("yeditor");

        let graphql_addr = api::api_executor();

        room::RoomManager::from_registry();

        // Start http server
        let server = server::new(move || {
            let app_state = AppState {
                executor: graphql_addr.clone(),
            };

            App::with_state(app_state)
                .middleware(middleware::Logger::default())
                .resource("/graphql", |r| {
                    r.method(http::Method::POST).with(handle_graphql)
                })
                .resource("/playground", |r| {
                    r.method(http::Method::GET).f(handle_playground)
                })
                .resource("/realtime/{room_key}", |r| {
                    r.method(http::Method::GET).f(handle_room_socket)
                })
        });

        let config = launch::config();
        let bind_url = url::Url::parse(&config.server.bind_url)?;

        info!("server bind to url: {}", bind_url);
        let server = if bind_url.scheme() == "https" {
            let acceptor_builder = Self::build_tls(&config)?;
            server.bind_ssl(&bind_url, acceptor_builder)?
        } else {
            server.bind(&bind_url)?
        };
        server.start();

        Ok(Server {
            runner: runner,
            bind_url: bind_url,
        })
    }

    fn build_tls(config: &Config) -> Fallible<SslAcceptorBuilder> {
        let mut tls_builder = SslAcceptor::mozilla_intermediate(SslMethod::tls())?;
        tls_builder.set_private_key_file(&config.server.tls_key, SslFiletype::PEM)?;
        tls_builder.set_certificate_chain_file(&config.server.tls_cert)?;
        Ok(tls_builder)
    }

    pub fn run(self) -> i32 {
        info!("server start running: {}", self.bind_url.as_str());
        self.runner.run()
    }
}

fn handle_playground(_req: &HttpRequest<AppState>) -> Result<HttpResponse, Error> {
    let html = playground::graphiql_source("/graphql");
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(html))
}

fn handle_graphql(
    (req, graphql_request): (HttpRequest<AppState>, Json<GraphQLRequest>),
) -> FutureResponse<HttpResponse> {
    let authorization = req
        .headers()
        .get(http::header::AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .unwrap_or("")
        .to_string();

    let msg = api::GraphQLData {
        request: graphql_request.into_inner(),
        authorization: authorization,
    };

    let state = req.state();
    state
        .executor
        .send(msg)
        .from_err()
        .and_then(|res: Result<String, Error>| match res {
            Ok(content) => Ok(HttpResponse::Ok()
                .content_type("application/json")
                .body(content)),
            Err(err) => {
                error!("graphql result error: {:?}", err);
                Ok(HttpResponse::InternalServerError().into())
            }
        })
        .responder()
}

fn handle_room_socket(r: &HttpRequest<AppState>) -> Result<HttpResponse, Error> {
    ws::start(r, room::RoomClientSession::new())
}
