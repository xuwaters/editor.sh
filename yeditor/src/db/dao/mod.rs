
use crate::db;

pub mod user;
pub mod pads;

pub struct ApiDao {
    pub user: user::UserDao,
    pub pads: pads::PadsDao,
}

impl ApiDao {
    pub fn new(pool: &db::DBPool) -> Self {
        Self {
            user: user::UserDao::new(pool),
            pads: pads::PadsDao::new(pool),
        }
    }
}
