use actix::fut;
use actix::prelude::*;
use actix::Actor;
use actix_web::ws;
use failure::{Fallible, ResultExt};
use std::time;

use super::client_proto::*;
use super::manager;
use super::room;
use crate::app;

// client session

pub struct RoomClientSession {
    client_id: u32,
    room_id: u32,
    room_key: String,
    room_addr: Option<Addr<super::Room>>,
    keep_alive_time: time::Instant,
}

impl RoomClientSession {
    pub fn new() -> Self {
        RoomClientSession {
            client_id: 0,
            room_id: 0,
            room_key: "".to_owned(),
            room_addr: None,
            keep_alive_time: time::Instant::now(),
        }
    }
}

impl Actor for RoomClientSession {
    type Context = ws::WebsocketContext<Self, app::AppState>;

    fn started(&mut self, ctx: &mut Self::Context) {
        let req = ctx.request();
        let params = req.match_info();
        self.room_key = params.get("room_key").unwrap_or("").to_owned();
        info!(
            "client started! {:?}, room_key = {:?}",
            req.peer_addr(),
            self.room_key
        );
        self.start_keep_alive(ctx);
        self.get_or_create_room(ctx);
    }

    fn stopping(&mut self, ctx: &mut Self::Context) -> Running {
        info!("client stopping!");
        let _ = self.leave_room(ctx);
        Running::Stop
    }

    fn stopped(&mut self, ctx: &mut Self::Context) {
        info!("client stopped!");
    }
}

impl RoomClientSession {
    fn start_keep_alive(&self, ctx: &mut <Self as Actor>::Context) {
        let room_config = room::Room::room_config();
        let keep_alive_ms = room_config.client_keep_alive_ms;
        let keep_alive_interval = time::Duration::from_millis(keep_alive_ms);
        let client_timeout_ms = room_config.client_timeout_ms;
        let client_timeout = time::Duration::from_millis(client_timeout_ms);

        info!(
            "start client keep alive: {}, timout = {}",
            keep_alive_ms, client_timeout_ms
        );

        ctx.run_interval(keep_alive_interval, move |this, context| {
            if time::Instant::now().duration_since(this.keep_alive_time) > client_timeout {
                info!("client keep alive timeout, disconnecting...");
                context.stop();
                return;
            } else {
                // info!("client keep alive start, ping...");
                context.ping("");
            }
        });
    }

    fn get_or_create_room(&mut self, ctx: &mut <Self as Actor>::Context) {
        let msg = manager::MsgGetOrCreateRoom::new(self.room_key.clone());
        manager::RoomManager::from_registry()
            .send(msg)
            .into_actor(self)
            .then(|res, act, ctx| {
                let val = res.expect("call should not fail");
                if let Err(err) = val {
                    info!("get or create room failure: {:?}", err);
                    return fut::ok(());
                }

                let room_info: manager::RoomInfo = val.unwrap();
                act.room_addr = Some(room_info.addr.clone());
                act.room_id = room_info.id;
                info!("room created: room_info {:?}", room_info.id);

                if let Err(err) = act.join_room(ctx) {
                    info!("join room failure: {:?}", err);
                    ctx.stop();
                }

                return fut::ok(());
            })
            .wait(ctx);
    }

    fn join_room(&mut self, ctx: &mut <Self as Actor>::Context) -> Fallible<()> {
        let join_msg = room::MsgJoinRoom {
            name: "".to_owned(),
            client: ctx.address().recipient(),
        };

        info!("join room: {:?}", self.room_id);
        self.room_addr
            .as_ref()
            .ok_or(failure::err_msg("room address none"))?
            .send(join_msg)
            .into_actor(self)
            .then(|res, act, ctx| {
                match res {
                    Err(e) => {
                        info!("join room failure: {:?}", e);
                        ctx.stop();
                    }
                    Ok(client_id) => {
                        info!("client join: id = {}", client_id);
                        act.client_id = client_id;
                    }
                }
                fut::ok(())
            })
            .wait(ctx);

        Ok(())
    }

    fn leave_room(&mut self, ctx: &mut <Self as Actor>::Context) -> Fallible<()> {
        let leave_msg = room::MsgLeaveRoom {
            client_id: self.client_id,
        };
        self.room_addr
            .as_ref()
            .ok_or(failure::err_msg("room address none"))?
            .do_send(leave_msg);
        Ok(())
    }
}

impl StreamHandler<ws::Message, ws::ProtocolError> for RoomClientSession {
    fn handle(&mut self, msg: ws::Message, ctx: &mut Self::Context) {
        match msg {
            ws::Message::Ping(ping) => {
                // debug!("received ping from client");
                self.keep_alive_time = time::Instant::now();
                ctx.pong(&ping);
            }
            ws::Message::Pong(_) => {
                // debug!("received pong from client");
                self.keep_alive_time = time::Instant::now();
            }
            ws::Message::Text(text) => {
                if let Err(err) = self.on_message(&text, ctx) {
                    warn!("on message error = {:?}", err);
                    ctx.stop()
                }
            }
            ws::Message::Binary(bin) => {
                use flate2::read::GzDecoder;
                use std::io::Read;

                info!("received binary from client, try decompress");
                let mut decoder = GzDecoder::new(bin.as_ref());
                let mut text = String::new();
                if let Err(err) = decoder.read_to_string(&mut text) {
                    warn!("binary decompression failure: {:?}", err);
                    ctx.stop();
                    return;
                }
                if let Err(err) = self.on_message(&text, ctx) {
                    warn!("on message error = {:?}", err);
                    ctx.stop();
                }
            }
            ws::Message::Close(_) => {
                info!("received closed from client, stop client session");
                ctx.stop();
            }
        }
    }
}

impl RoomClientSession {
    fn on_message(&mut self, text: &String, ctx: &mut <Self as Actor>::Context) -> Fallible<()> {
        info!("on client message: {}", text);
        let client_request =
            serde_json::from_str::<ClientRequests>(text.as_str()).context("client packet error")?;

        let room_packet = room::MsgRoomClientRequest {
            client_id: self.client_id,
            client_request,
        };

        self.room_addr
            .as_ref()
            .ok_or(failure::err_msg("not in room yet"))?
            .send(room_packet)
            .into_actor(self)
            .then(|res, act, ctx| {
                info!("processed client packet");
                fut::ok(())
            })
            .wait(ctx);

        Ok(())
    }
}

// messages from room
impl Handler<room::ClientEvents> for RoomClientSession {
    type Result = MessageResult<room::ClientEvents>;

    fn handle(&mut self, msg: room::ClientEvents, ctx: &mut Self::Context) -> Self::Result {
        info!("received msg event: {:?}", msg);

        match msg {
            room::ClientEvents::Packet(packet) => match serde_json::to_string(&packet) {
                Err(e) => {
                    info!("serialize response failure: {:?}", e);
                    ctx.stop();
                }
                Ok(json_text) => {
                    if json_text.len() <= 128 {
                        ctx.text(json_text)
                    } else {
                        use flate2::{write::GzEncoder, Compression};
                        use std::io::Write;
                        let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
                        if encoder.write_all(json_text.as_bytes()).is_err() {
                            ctx.text(json_text);
                        } else if let Ok(v) = encoder.finish() {
                            ctx.binary(v);
                        } else {
                            ctx.text(json_text);
                        }
                    }
                }
            },
            room::ClientEvents::Destroy => {
                info!(
                    "client received destropy command: room = {}, client = {}",
                    self.room_key, self.client_id
                );
                ctx.stop();
            }
        }

        MessageResult(())
    }
}
