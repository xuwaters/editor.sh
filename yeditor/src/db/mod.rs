use diesel::{pg, prelude::*, r2d2::ConnectionManager};
use failure::{Fallible, ResultExt};
use r2d2::{Pool, PooledConnection};

pub mod dao;
pub mod model;
pub mod pagination;
mod schema;

pub use self::dao::ApiDao;
pub use self::model::*;
pub use self::pagination::*;

pub type DB = pg::Pg;
pub type DBConn = pg::PgConnection;
pub type DBConnManager = ConnectionManager<DBConn>;
pub type DBPool = Pool<DBConnManager>;
pub type DBPooledConn = PooledConnection<DBConnManager>;

pub fn new_pool<Str: Into<String>>(database_url: Str) -> Fallible<DBPool> {
    let manager = DBConnManager::new(database_url);
    let pool = r2d2::Pool::new(manager)?;
    Ok(pool)
}

pub fn get_connection(pool: &DBPool) -> Fallible<DBPooledConn> {
    let connection = pool.get().context("database_connection_failure")?;
    Ok(connection)
}
