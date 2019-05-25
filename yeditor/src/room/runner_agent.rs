use actix::prelude::*;
use actix_web::ws;
use std::time::Duration;

use super::room;
use ycommon::runner_proto;

#[derive(Debug, Message)]
pub enum Events {
    Response(runner_proto::ServiceResponses),
    Closed,
    Connected,
}

pub type EventListener = Recipient<Events>;

pub enum AgentState {
    None,
    Connecting,
    Connected,
    Disconnecting,
}

pub struct RunnerAgent {
    service_uri: String,
    state: AgentState,
    listener: EventListener,
    client_writer: Option<ws::ClientWriter>, // send to upstream yrunner
}

impl RunnerAgent {
    pub fn new(service_uri: String, listener: EventListener) -> Self {
        Self {
            service_uri,
            listener,
            state: AgentState::None,
            client_writer: None,
        }
    }

    fn heart_beat(&mut self, ctx: &mut <Self as Actor>::Context) {
        let config = room::Room::room_config();
        let agent_keep_alive_seconds = config.agent_keep_alive_seconds;
        ctx.run_later(
            Duration::from_secs(agent_keep_alive_seconds),
            |act: &mut Self, context| {
                match act.client_writer.as_mut() {
                    None => {
                        warn!("heart_beat client_writer not found!");
                    }
                    Some(writer) => {
                        writer.ping("");
                        act.heart_beat(context);
                    }
                };
            },
        );
    }
}

impl Actor for RunnerAgent {
    type Context = Context<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        info!("agent started");
        self.state = AgentState::Connecting;
        ws::Client::new(&self.service_uri)
            .connect()
            .into_actor(self)
            .then(|res, act: &mut RunnerAgent, context: &mut Self::Context| {
                info!("runner agent connected to remote: {}", act.service_uri);
                let (reader, writer) = match res {
                    Ok((r, w)) => (r, w),
                    Err(err) => {
                        warn!("runner agent res error = {:?}", err);
                        context.stop();
                        return fut::ok(());
                    }
                };
                Self::add_stream(reader, context);
                act.client_writer = Some(writer);
                act.state = AgentState::Connected;
                act.heart_beat(context);
                let _ = act.listener.do_send(Events::Connected);
                fut::ok(())
            })
            .wait(ctx);
    }

    fn stopping(&mut self, ctx: &mut Self::Context) -> Running {
        info!("runner agent stopping: {}", self.service_uri);
        if let Some(w) = self.client_writer.take().as_mut() {
            w.close(None);
        }
        self.state = AgentState::Disconnecting;
        let _ = self.listener.do_send(Events::Closed);
        Running::Stop
    }

    fn stopped(&mut self, ctx: &mut Self::Context) {
        info!("runner agent stopped: {}", self.service_uri);
        self.state = AgentState::None;
    }
}

/// Forward ServiceRequests to upstream yrunner websocket service
impl Handler<runner_proto::ServiceRequests> for RunnerAgent {
    type Result = MessageResult<runner_proto::ServiceRequests>;

    fn handle(
        &mut self,
        msg: runner_proto::ServiceRequests,
        ctx: &mut Self::Context,
    ) -> Self::Result {
        debug!("agent received service request: {:?}", msg);
        let writer = match self.client_writer.as_mut() {
            Some(w) => w,
            None => {
                info!("runner agent writer not ready");
                return MessageResult(());
            }
        };
        let data = match serde_json::to_string(&msg) {
            Ok(text) => text,
            Err(err) => {
                info!("runner agent serialize msg failure: {:?}", err);
                return MessageResult(());
            }
        };
        writer.text(data);
        MessageResult(())
    }
}

// Forward ServiceResponse from upstream yrunner service to listener
impl StreamHandler<ws::Message, ws::ProtocolError> for RunnerAgent {
    fn started(&mut self, ctx: &mut Self::Context) {
        info!("stream started: {}", self.service_uri);
    }

    fn error(&mut self, err: ws::ProtocolError, ctx: &mut Self::Context) -> Running {
        info!("stream error: {}, err = {:?}", self.service_uri, err);
        Running::Stop
    }

    fn finished(&mut self, ctx: &mut Self::Context) {
        info!("stream finished: {}", self.service_uri);
        ctx.stop();
    }

    fn handle(&mut self, msg: ws::Message, ctx: &mut Self::Context) {
        match msg {
            ws::Message::Text(payload) => {
                let packet_result =
                    serde_json::from_str::<runner_proto::ServiceResponses>(&payload);
                match packet_result {
                    Ok(packet) => {
                        let _ = self.listener.do_send(Events::Response(packet));
                    }
                    Err(err) => {
                        error!("invalid response, payload = {}, err = {:?}", payload, err);
                    }
                }
            }
            ws::Message::Close(reason) => {
                info!(
                    "connection closed: reason = {:?}, uri = {}",
                    reason, self.service_uri
                );
                ctx.stop();
            }
            ws::Message::Pong(_payload) => {
                // ignore
            }
            _ => {
                // ignore
                debug!("ignore unknown websocket packet: {:?}", msg);
            }
        }
    }
}

#[derive(Message)]
pub struct ReqStop;

impl Handler<ReqStop> for RunnerAgent {
    type Result = ();

    fn handle(&mut self, msg: ReqStop, ctx: &mut Self::Context) -> Self::Result {
        info!("request agent stop");
        ctx.stop();
    }
}
