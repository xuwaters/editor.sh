use failure::Fallible;

#[macro_use]
extern crate serde_derive;
#[macro_use]
extern crate lazy_static;

mod app;
mod language;

fn main() -> Fallible<()> {
    app::launch()
}
