use super::room;

use actix::prelude::*;
use failure::Fallible;
use std::collections::HashMap;

#[derive(Clone)]
pub struct RoomInfo {
    pub id: u32,
    pub addr: Addr<room::Room>,
    pub room_key: String,
}

pub struct RoomManager {
    rooms: HashMap<String, RoomInfo>,
    next_room_id: u32,
}

impl RoomManager {
    pub fn new() -> Self {
        RoomManager {
            rooms: HashMap::new(),
            next_room_id: 1,
        }
    }

    pub fn next_room_id(&mut self) -> u32 {
        self.next_room_id += 1;
        self.next_room_id
    }
}

// System Service
impl Default for RoomManager {
    fn default() -> Self {
        RoomManager::new()
    }
}

impl SystemService for RoomManager {
    fn service_started(&mut self, ctx: &mut Context<Self>) {
        info!("RoomManager Service started");
    }
}

impl Supervised for RoomManager {
    fn restarting(&mut self, ctx: &mut <Self as Actor>::Context) {
        info!("RoomManager Service restarting");
    }
}

// Actor

impl Actor for RoomManager {
    type Context = Context<Self>;
}

// Messages
#[derive(Debug)]
pub struct MsgGetOrCreateRoom {
    pub room_key: String,
}

impl MsgGetOrCreateRoom {
    pub fn new(room_key: String) -> Self {
        Self { room_key }
    }
}

impl Message for MsgGetOrCreateRoom {
    type Result = Fallible<RoomInfo>;
}

#[derive(Debug)]
pub struct MsgListRooms {}

impl Message for MsgListRooms {
    type Result = Fallible<Vec<RoomInfo>>;
}

#[derive(Message)]
pub struct MsgDestroyRoom {
    pub room_key: String,
}

// Get or create room
impl Handler<MsgGetOrCreateRoom> for RoomManager {
    type Result = MessageResult<MsgGetOrCreateRoom>;

    fn handle(&mut self, msg: MsgGetOrCreateRoom, ctx: &mut Self::Context) -> Self::Result {
        let room_option = self.rooms.get(&msg.room_key);
        let listener = ctx.address().recipient();
        match room_option {
            None => {
                let room_addr = room::Room::new(&msg.room_key, listener).start();
                let room_info = RoomInfo {
                    id: self.next_room_id(),
                    room_key: msg.room_key.clone(),
                    addr: room_addr,
                };
                self.rooms.insert(msg.room_key, room_info.clone());
                MessageResult(Ok(room_info.clone()))
            }
            Some(room) => MessageResult(Ok(room.clone())),
        }
    }
}

// Room is already destroyed
impl Handler<room::RoomEvents> for RoomManager {
    type Result = MessageResult<room::RoomEvents>;

    fn handle(&mut self, msg: room::RoomEvents, ctx: &mut Self::Context) -> Self::Result {
        info!("received room event: {:?}", msg);
        match msg {
            room::RoomEvents::Closed(room_key) => {
                self.rooms.remove(&room_key);
            }
        }
        MessageResult(())
    }
}
