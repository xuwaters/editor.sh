use actix::prelude::*;
use failure::{err_msg, Fallible};
use std::collections::{HashMap, VecDeque};
use std::time::Duration;

use ycommon::runner_proto as proto;

use super::client_proto::*;
use super::runner_proxy::{self, MsgRunnerEvent, RunnerProxy};
use super::*;
use crate::{
    app::{self, api},
    db,
};

pub type RoomClientListener = Recipient<ClientEvents>;

#[derive(Debug, Clone, Message)]
pub enum ClientEvents {
    Packet(ClientResponses),
    Destroy, // destroy current client
}

struct RoomClient {
    id: u32,
    name: String,
    recipient: RoomClientListener,
}

#[derive(Debug, Clone, Message)]
pub enum RoomEvents {
    Closed(String), // room_key
}

pub type RoomEventListener = Recipient<RoomEvents>;

pub struct Room {
    room_key: String,
    room_run_env: Option<proto::RunEnv>,
    listener: RoomEventListener,
    clients: HashMap<u32, RoomClient>,
    next_client_id: u32,
    runner_proxy_addr: Option<Addr<RunnerProxy>>,
    // cache output
    terminal_stdout: VecDeque<String>,
    // room stop handler
    stop_handle: Option<SpawnHandle>,
    // current code buffer
    code_buffer: TextBuffer,
    // pad with content
    pad: Option<db::Pad>,
}

impl Room {
    pub fn new(room_key: &String, listener: RoomEventListener) -> Room {
        Room {
            room_key: room_key.to_owned(),
            room_run_env: None,
            listener,
            clients: HashMap::new(),
            next_client_id: 1,
            runner_proxy_addr: None,
            terminal_stdout: VecDeque::new(),
            stop_handle: None,
            code_buffer: TextBuffer::new(),
            pad: None,
        }
    }

    pub fn room_config() -> &'static app::config::RoomConfig {
        &app::config().room
    }
}

impl Actor for Room {
    type Context = Context<Self>;

    fn started(&mut self, ctx: &mut <Self as Actor>::Context) {
        let runner_service_url = Self::room_config().runner_service_url.to_owned();
        let recipient = ctx.address().recipient();
        let room_key = self.room_key.to_owned();

        let api_executor = api::api_executor();
        let req = api::ReqQueryPad {
            hash: room_key.clone(),
        };

        api_executor
            .send(req)
            .into_actor(self)
            .then(|res, this: &mut Self, context| {
                let resp = match res {
                    Err(err) => {
                        warn!("load pad error = {:?}", err);
                        context.stop();
                        return fut::err(());
                    }
                    Ok(val) => val,
                };
                let data: api::RespQueryPad = match resp {
                    Err(err) => {
                        warn!("load pad database err = {:?}", err);
                        context.stop();
                        return fut::err(());
                    }
                    Ok(data) => data,
                };

                // pad loaded
                let curr_pad: &db::Pad = match data.pad.as_ref() {
                    None => {
                        warn!("pad not found: {}", data.hash);
                        context.stop();
                        return fut::err(());
                    }
                    Some(val) => val,
                };

                let pad_language = curr_pad.language.to_owned();
                info!("pad loaded: {}, language = {}", curr_pad.hash, pad_language);

                this.pad = data.pad;
                if let Some(content) = data.content {
                    this.code_buffer.set_text(content.code.as_str());
                }

                let run_env = proto::RunEnv {
                    win_size: proto::WinSize { row: 0, col: 0 },
                    language: pad_language,
                    boot: None,
                };

                this.room_run_env = Some(run_env.clone());
                let proxy_addr =
                    RunnerProxy::new(room_key, run_env, recipient, runner_service_url).start();
                this.runner_proxy_addr = Some(proxy_addr);

                fut::ok(())
            })
            .wait(ctx);

        // start auto save
        let cfg = Self::room_config();
        if cfg.auto_save_seconds > 0 {
            let save_interval = Duration::from_secs(cfg.auto_save_seconds);
            ctx.run_interval(save_interval, |this: &mut Self, context| {
                this.save_pad_content(context);
            });
        }
    }

    fn stopping(&mut self, ctx: &mut Self::Context) -> Running {
        info!("room stopping: {}", self.room_key);

        self.save_pad_content(ctx);
        self.destroy_clients(ctx);
        self.destroy_proxy(ctx);

        let _ = self
            .listener
            .do_send(RoomEvents::Closed(self.room_key.clone()));
        Running::Stop
    }

    fn stopped(&mut self, ctx: &mut Self::Context) {
        info!("room stopped: {}", self.room_key);
    }
}

impl Room {
    pub fn broadcast_all(&self, msg: ClientEvents) {
        self.broadcast_excludes(msg, vec![]);
    }

    pub fn broadcast_excludes(&self, msg: ClientEvents, excludes: Vec<u32>) {
        for client in self.clients.values() {
            if excludes.contains(&client.id) {
                continue;
            }
            let res = client.recipient.do_send(msg.clone());
            match res {
                Err(err) => info!("send recipient {} error: {:?}", client.id, err),
                Ok(_) => (),
            }
        }
    }

    fn destroy_clients(&mut self, ctx: &mut <Self as Actor>::Context) {
        self.broadcast_all(ClientEvents::Destroy);
    }

    fn destroy_proxy(&mut self, ctx: &mut <Self as Actor>::Context) {
        if let Some(runner_proxy_addr) = self.runner_proxy_addr.as_ref() {
            info!("sending stop signal to runner_proxy");
            let _ = runner_proxy_addr.do_send(runner_proxy::ReqStop);
        }
    }

    fn save_pad_content(&mut self, ctx: &mut <Self as Actor>::Context) {
        let pad: &db::Pad = match self.pad.as_ref() {
            None => {
                info!("pad not found, skip saving content: {}", self.room_key);
                return;
            }
            Some(val) => val,
        };

        let code = self.code_buffer.text();
        let req = api::ReqSavePadContent {
            content: db::NewPadContent {
                pad_id: pad.id,
                code: code,
            },
        };

        let api_executor = api::api_executor();
        api_executor.do_send(req);
    }
}

pub struct MsgJoinRoom {
    pub name: String,
    pub client: RoomClientListener,
}

impl Message for MsgJoinRoom {
    type Result = u32; // client id
}

impl Handler<MsgJoinRoom> for Room {
    type Result = MessageResult<MsgJoinRoom>;
    fn handle(&mut self, msg: MsgJoinRoom, ctx: &mut Self::Context) -> Self::Result {
        let client_id = self.get_next_client_id();
        let room_client = RoomClient {
            id: client_id,
            name: msg.name,
            recipient: msg.client,
        };
        info!("client({}) joins room: {}", client_id, self.room_key);

        // send language to client
        let language = match self.pad.as_ref() {
            None => "plaintext".to_owned(),
            Some(pad) => pad.language.to_owned(),
        };
        let msg_lang = ClientResponses::Command(CommandResponseParams::SetLang(language));
        let _ = room_client
            .recipient
            .do_send(ClientEvents::Packet(msg_lang));

        // send editor text to client
        let curr_code = self.code_buffer.text();
        let msg_code = ClientResponses::Editor(EditorSyncParams::Text(curr_code));
        let _ = room_client
            .recipient
            .do_send(ClientEvents::Packet(msg_code));

        // send cached output to client
        for line in self.terminal_stdout.iter() {
            let value = TerminalResponseParams::Stdout(line.to_owned());
            let msg_stdout = ClientResponses::Terminal(value);
            let _ = room_client
                .recipient
                .do_send(ClientEvents::Packet(msg_stdout));
        }

        self.clients.insert(client_id, room_client);

        // check stop handle
        if let Some(stop_handle) = self.stop_handle.take() {
            info!(
                "client({}) joined room, cancelling stop handle: {}",
                client_id, self.room_key
            );
            ctx.cancel_future(stop_handle);
        }

        MessageResult(client_id)
    }
}

impl Room {
    fn get_next_client_id(&mut self) -> u32 {
        self.next_client_id += 1;
        return self.next_client_id;
    }
}

pub struct MsgLeaveRoom {
    pub client_id: u32,
}

impl Message for MsgLeaveRoom {
    type Result = u32;
}

impl Handler<MsgLeaveRoom> for Room {
    type Result = MessageResult<MsgLeaveRoom>;

    fn handle(&mut self, msg: MsgLeaveRoom, ctx: &mut Self::Context) -> Self::Result {
        info!("client({}) leaves room: {}", msg.client_id, self.room_key);
        let client_option = self.clients.remove(&msg.client_id);

        if self.clients.is_empty() {
            // if room is empty, destory room after a few seconds
            let delay_ms = Self::room_config().close_delay_ms;
            info!("room is empty now, waiting for {}ms to stop", delay_ms);
            let stop_handle = ctx.run_later(
                Duration::from_millis(delay_ms),
                |this: &mut Self, context: &mut Self::Context| {
                    info!("stop delay timeout, call stop room now: {}", this.room_key);
                    context.stop();
                },
            );
            self.stop_handle = Some(stop_handle);
        }

        // broadcast remove all cursors
        let payload = EditorSyncParams::Cursor(CursorChangedEvent {
            peer_id: msg.client_id,
            position: None,
            secondary_positions: vec![],
        });
        let new_msg = ClientResponses::Editor(payload);
        self.broadcast_excludes(ClientEvents::Packet(new_msg), vec![msg.client_id]);

        match client_option {
            None => MessageResult(0),
            Some(client) => MessageResult(client.id),
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct MsgRoomClientRequest {
    pub client_id: u32,
    pub client_request: ClientRequests,
}

impl Message for MsgRoomClientRequest {
    type Result = u32;
}

impl Handler<MsgRoomClientRequest> for Room {
    type Result = MessageResult<MsgRoomClientRequest>;

    fn handle(&mut self, msg: MsgRoomClientRequest, ctx: &mut Self::Context) -> Self::Result {
        info!("room: {}, client msg: {:?}", self.room_key, msg);
        let packet = msg.client_request;
        match packet {
            ClientRequests::Editor(payload) => {
                if let Err(err) = self.on_editor(ctx, msg.client_id, payload) {
                    warn!("on_editor err = {:?}", err);
                }
            }
            ClientRequests::Command(payload) => {
                if let Err(err) = self.on_command(ctx, msg.client_id, payload) {
                    warn!("on_command err = {:?}", err);
                }
            }
            ClientRequests::Terminal(payload) => {
                if let Err(err) = self.on_terminal(ctx, msg.client_id, payload) {
                    warn!("on_terminal err = {:?}", err);
                }
            }
        }
        MessageResult(0)
    }
}

impl Room {
    pub fn on_editor(
        &mut self,
        ctx: &mut <Self as Actor>::Context,
        client_id: u32,
        mut payload: EditorSyncParams,
    ) -> Fallible<()> {
        info!("on_editor: client = {}, msg = {:?}", client_id, payload);

        // sync to code buffer
        // TODO: port teletype algorithms here
        match &mut payload {
            EditorSyncParams::Text(text) => {
                warn!("not supported text input from client");
            }
            EditorSyncParams::Changed(changed) => {
                for change in changed.changes.iter() {
                    let r = &change.range;
                    let start = TextPosition::new(r.start_line as usize, r.start_column as usize);
                    let end = TextPosition::new(r.end_line as usize, r.end_column as usize);
                    let res = self.code_buffer.edit(&start, &end, change.text.as_str());
                    if let Err(err) = res {
                        warn!("invalid edit: err = {:?}, change = {:?}", err, change);
                    }
                }
            }
            EditorSyncParams::Cursor(cursor) => {
                cursor.peer_id = client_id;
            }
        };

        let msg = ClientResponses::Editor(payload);
        self.broadcast_excludes(ClientEvents::Packet(msg), vec![client_id]);

        Ok(())
    }

    pub fn on_command(
        &mut self,
        ctx: &mut <Self as Actor>::Context,
        client_id: u32,
        payload: CommandRequestParams,
    ) -> Fallible<()> {
        info!("on_command: client = {}, msg = {:?}", client_id, payload);

        let runner_proxy_addr = self
            .runner_proxy_addr
            .as_ref()
            .ok_or(err_msg("runner not ready"))?
            .clone();

        let msg = match payload {
            CommandRequestParams::Reset() => match self.room_run_env.as_ref() {
                None => {
                    warn!("room run env not set: {}", self.room_key);
                    return Err(err_msg("run_env not set"));
                }
                Some(run_env) => proto::ServiceRequests::Reset(run_env.clone()),
            },
            CommandRequestParams::RunCode(content) => match self.room_run_env.as_ref() {
                None => {
                    warn!("room run env not found: {}", self.room_key);
                    return Err(err_msg("run_env not set"));
                }
                Some(run_env) => proto::ServiceRequests::Run(proto::Code {
                    id: 1,
                    language: run_env.language.clone(),
                    filename: "source".to_owned(),
                    content: content,
                }),
            },
            CommandRequestParams::SetLang(lang) => {
                self.update_room_language(lang.as_str());

                // broadcast to clients
                let msg_lang =
                    ClientResponses::Command(CommandResponseParams::SetLang(lang.clone()));
                self.broadcast_all(ClientEvents::Packet(msg_lang));

                proto::ServiceRequests::Reset(self.room_run_env.as_ref().unwrap().clone())
            }
        };

        runner_proxy_addr
            .send(msg)
            .into_actor(self)
            .then(|res, act, context| {
                debug!("runner proxy response = {:?}", res);
                fut::ok(())
            })
            .spawn(ctx);

        Ok(())
    }

    fn update_room_language(&mut self, language: &str) {
        // save run_env
        if let Some(run_env) = self.room_run_env.as_mut() {
            run_env.language = language.to_owned();
            run_env.boot = None;
        }
        // save language to pad
        if let Some(pad) = self.pad.as_mut() {
            let pad: &mut db::Pad = pad;
            pad.language = language.to_owned();

            let req = api::ReqUpdatePad {
                pad_id: pad.id,
                changeset: db::PadChangeset {
                    language: Some(language.to_owned()),
                    status: None,
                    title: None,
                },
            };

            api::api_executor().do_send(req);
        }
    }

    pub fn on_terminal(
        &mut self,
        ctx: &mut <Self as Actor>::Context,
        client_id: u32,
        payload: TerminalRequestParams,
    ) -> Fallible<()> {
        info!("on_terminal: client = {}, msg = {:?}", client_id, payload);

        let runner_proxy_addr = self
            .runner_proxy_addr
            .as_ref()
            .ok_or(err_msg("runner not ready"))?;

        let msg = match payload {
            TerminalRequestParams::SetSize(row, col) => {
                proto::ServiceRequests::WinSize(proto::WinSize { row, col })
            }

            TerminalRequestParams::Stdin(input) => proto::ServiceRequests::Stdin(input),
        };

        runner_proxy_addr
            .send(msg)
            .into_actor(self)
            .then(|res, act, context| {
                debug!("runner proxy response = {:?}", res);
                fut::ok(())
            })
            .spawn(ctx);

        Ok(())
    }
}

impl Handler<MsgRunnerEvent> for Room {
    type Result = MessageResult<MsgRunnerEvent>;

    fn handle(&mut self, msg: MsgRunnerEvent, ctx: &mut Self::Context) -> Self::Result {
        match msg {
            MsgRunnerEvent::Stdout(payload) => {
                self.push_terminal_stdout(&payload);
                let value = TerminalResponseParams::Stdout(payload);
                let msg = ClientResponses::Terminal(value);
                self.broadcast_all(ClientEvents::Packet(msg));
            }
        }
        MessageResult(())
    }
}

impl Room {
    fn push_terminal_stdout(&mut self, payload: &String) {
        match self.terminal_stdout.back_mut() {
            None => {
                self.terminal_stdout.push_back(payload.clone());
            }
            Some(back_line) => {
                let line: &mut String = back_line;
                if line.len() >= 256 {
                    self.terminal_stdout.push_back(payload.clone());
                } else if line.ends_with("\n") {
                    self.terminal_stdout.push_back(payload.clone());
                } else {
                    line.push_str(payload.as_str());
                }
            }
        }
        let cache_lines = Self::room_config().cache_lines;
        if self.terminal_stdout.len() > cache_lines {
            self.terminal_stdout.pop_front();
        }
    }
}
