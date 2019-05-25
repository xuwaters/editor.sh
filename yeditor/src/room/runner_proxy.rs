use actix::prelude::*;
use std::ops::Add;
use std::time::Duration;

use super::runner_agent as agent;
use ycommon::runner_proto as proto;

#[derive(Message)]
pub enum MsgRunnerEvent {
    Stdout(String),
}

pub type RunnerEventRecipient = Recipient<MsgRunnerEvent>;

pub struct RunnerProxy {
    room_key: String,
    reset_params: proto::RunEnv,
    recipient: RunnerEventRecipient,
    service_uri_tpl: String,
    agent: Option<Addr<agent::RunnerAgent>>,
    reconnect_delay: Duration,
}

impl RunnerProxy {
    pub fn new(
        room_key: String,
        reset_params: proto::RunEnv,
        recipient: RunnerEventRecipient,
        runner_service_url: String,
    ) -> RunnerProxy {
        RunnerProxy {
            room_key,
            reset_params,
            recipient,
            service_uri_tpl: runner_service_url,
            agent: None,
            reconnect_delay: Duration::from_millis(0),
        }
    }

    fn service_full_uri(&self) -> String {
        self.service_uri_tpl
            .replace("{room_key}", self.room_key.as_str())
    }

    fn agent_reconnect(&mut self, ctx: &mut <Self as Actor>::Context) {
        if self.agent.is_some() {
            warn!("agent is running, do not need to reconnect");
            return;
        }
        let prefix = if self.reconnect_delay.as_millis() == 0 {
            "\r\n"
        } else {
            ""
        };
        self.reconnect_delay = {
            let delay = self.reconnect_delay + Duration::from_millis(500);
            if delay.as_secs() <= 5 {
                delay
            } else {
                self.reconnect_delay
            }
        };
        let waiting_str = format!(
            "reconnecting, waiting for {}ms",
            self.reconnect_delay.as_millis()
        );
        info!("{}", waiting_str);

        let _ = self.recipient.do_send(MsgRunnerEvent::Stdout(format!(
            "{}{}\r\n",
            prefix, waiting_str
        )));

        ctx.run_later(self.reconnect_delay.clone(), |this: &mut Self, context| {
            this.agent_connect(context);
        });
    }

    fn agent_connect(&mut self, ctx: &mut <Self as Actor>::Context) {
        let service_full_uri = self.service_full_uri();
        info!("connecting to agent: {}", service_full_uri);

        let listener = ctx.address().recipient();
        let agent = agent::RunnerAgent::new(service_full_uri, listener).start();
        self.agent = Some(agent);

        // launch
        let run_env = self.reset_params.clone();
        self.send_agent_message(proto::ServiceRequests::Reset(run_env));
    }

    fn agent_stop(&mut self, ctx: &mut <Self as Actor>::Context) {
        if let Some(agent) = self.agent.as_ref() {
            info!("sending stop signal to runner_agent");
            agent.do_send(agent::ReqStop);
        }
    }
}

impl Actor for RunnerProxy {
    type Context = Context<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        self.agent_connect(ctx);
    }

    fn stopping(&mut self, ctx: &mut Self::Context) -> Running {
        info!("runner proxy stopping: {}", self.room_key);
        self.agent_stop(ctx);
        Running::Stop
    }
}

impl Handler<proto::ServiceRequests> for RunnerProxy {
    type Result = MessageResult<proto::ServiceRequests>;

    fn handle(&mut self, mut msg: proto::ServiceRequests, ctx: &mut Self::Context) -> Self::Result {
        debug!("received command: {:?}", msg);
        match &mut msg {
            proto::ServiceRequests::Reset(params) => {
                self.reset_params.language = params.language.clone();
                self.reset_params.boot = params.boot.clone();
                if params.win_size.col > 0 && params.win_size.row > 0 {
                    self.reset_params.win_size = params.win_size.clone();
                } else {
                    params.win_size = self.reset_params.win_size.clone();
                }
            }
            proto::ServiceRequests::WinSize(params) => {
                self.reset_params.win_size = params.clone();
            }
            _ => {}
        }

        // forward to agent
        self.send_agent_message(msg);

        MessageResult(())
    }
}

impl RunnerProxy {
    fn send_agent_message(&mut self, msg: proto::ServiceRequests) {
        match self.agent.as_ref() {
            None => {
                warn!("agent not found: {}, msg = {:?}", self.room_key, msg);
            }
            Some(agent) => {
                agent.do_send(msg);
            }
        }
    }
}

// Handle listener events from RunnerAgent
impl Handler<agent::Events> for RunnerProxy {
    type Result = MessageResult<agent::Events>;

    fn handle(&mut self, msg: agent::Events, ctx: &mut Self::Context) -> Self::Result {
        debug!("events from agent: {:?}", msg);
        match msg {
            agent::Events::Connected => {
                info!("runner agent connected successfully: {}", self.room_key);
                self.reconnect_delay = Duration::from_secs(0);
            }
            agent::Events::Closed => {
                // agent closed
                info!("runner agent closed: {}", self.room_key);
                self.agent.take();
                self.agent_reconnect(ctx);
            }
            agent::Events::Response(packet) => match packet {
                proto::ServiceResponses::Init(resp) => {}
                proto::ServiceResponses::Reset(resp) => {}
                proto::ServiceResponses::Run(resp) => {}
                proto::ServiceResponses::Stdout(resp) => match resp.into() {
                    Err(err) => {}
                    Ok(val) => {
                        let _ = self.recipient.do_send(MsgRunnerEvent::Stdout(val.data));
                    }
                },
                proto::ServiceResponses::WinSize(resp) => {}
            },
        }
        MessageResult(())
    }
}

#[derive(Debug, Message)]
pub struct ReqStop;
impl Handler<ReqStop> for RunnerProxy {
    type Result = ();

    fn handle(&mut self, msg: ReqStop, ctx: &mut Self::Context) -> Self::Result {
        info!("requesting runner proxy stop");
        ctx.stop();
    }
}
