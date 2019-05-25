use juniper::{FieldError, FieldResult, RootNode};

use crate::db::{dao::ApiDao, model};

pub struct GraphContext {
    pub auth_token: String,
    pub session: Option<model::Session>,
    pub dao: ApiDao,
}

impl juniper::Context for GraphContext {}

impl GraphContext {
    pub fn new(auth_token: String, session: Option<model::Session>, dao: ApiDao) -> Self {
        Self {
            auth_token,
            session,
            dao,
        }
    }

    pub fn session_ref(&self) -> FieldResult<&model::Session> {
        self.session.as_ref()
            .ok_or(FieldError::new("Session not found", 
            graphql_value!({"session": "not_found"})))
    }
}
