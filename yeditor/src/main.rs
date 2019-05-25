
#[macro_use]
extern crate serde_derive;
#[macro_use]
extern crate diesel;
#[macro_use]
extern crate diesel_migrations;
#[macro_use]
extern crate juniper;
#[macro_use]
extern crate log;
#[macro_use]
extern crate failure;
#[macro_use]
extern crate lazy_static;

pub mod app;
pub mod db;
pub mod graphql;
pub mod room;

fn main() -> failure::Fallible<()> {
    app::launch()
}
