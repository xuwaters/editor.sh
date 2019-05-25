use diesel::prelude::*;
use failure::{Fallible, ResultExt};

use crate::db::{self, model::*, schema::*};

pub struct UserDao {
    pool: db::DBPool,
}

impl UserDao {
    pub fn new(pool: &db::DBPool) -> Self {
        Self { pool: pool.clone() }
    }

    pub fn get_session_by_auth_token(&self, auth_token: &String) -> Fallible<Option<Session>> {
        if auth_token.trim().is_empty() {
            return Ok(None);
        }
        let conn = db::get_connection(&self.pool)?;
        let user_session = sessions::table
            .filter(sessions::auth_token.eq(auth_token))
            .select(sessions::all_columns)
            .first::<Session>(&conn)
            .optional()?;
        Ok(user_session)
    }

    pub fn get_session_user(&self, session: &Session) -> Fallible<Option<User>> {
        let conn = db::get_connection(&self.pool)?;
        let user_id = session.user_id;
        let user = users::table.find(user_id).first::<User>(&conn).optional()?;
        Ok(user)
    }

    fn make_password_hash(password: &String) -> Fallible<String> {
        let hash = bcrypt::hash(password.as_str(), 4)?;
        Ok(hash)
    }

    fn verify_password_hash(password: &String, password_hash: &String) -> Fallible<bool> {
        let verified = bcrypt::verify(password.as_str(), password_hash.as_str())?;
        Ok(verified)
    }

    pub fn create_user(&self, email: &String, name: &String, password: &String) -> Fallible<User> {
        let conn = db::get_connection(&self.pool)?;
        let new_user = NewUser {
            email: email.to_owned(),
            name: name.to_owned(),
            password_hash: Self::make_password_hash(password).context("password_hash_failure")?,
        };
        let user = diesel::insert_into(users::table)
            .values(new_user)
            .get_result::<User>(&conn)
            .context("create_user_failure")?;
        Ok(user)
    }

    pub fn create_user_by_oauth(&self, email: &String, name: &String) -> Fallible<User> {
        // create if not exists
        let conn = db::get_connection(&self.pool)?;
        let user_result = users::table
            .filter(users::email.eq(email))
            .first::<User>(&conn);

        match user_result {
            Ok(user) => {
                return Ok(user);
            }
            Err(diesel::NotFound) => {
                // need to create one
                let new_user = NewUser {
                    email: email.to_owned(),
                    name: name.to_owned(),
                    password_hash: "".to_owned(),
                };
                let user_created = diesel::insert_into(users::table)
                    .values(new_user)
                    .get_result::<User>(&conn)
                    .context("create_user_failure")?;
                return Ok(user_created);
            }
            Err(err) => {
                info!("query user err = {:?}", err);
                return Err(format_err!("query_user_failure"));
            }
        }
    }

    fn generate_auth_token() -> String {
        uuid::Uuid::new_v4().to_string().replace("-", "")
    }

    pub fn create_user_session(&self, user: &User) -> Fallible<Session> {
        let conn = db::get_connection(&self.pool)?;
        let new_session = NewSession {
            auth_token: Self::generate_auth_token(),
            user_id: user.id,
            data: Some("{}".to_owned()),
        };
        let session = diesel::insert_into(sessions::table)
            .values(new_session)
            .get_result::<Session>(&conn)
            .context("create_user_session_failure")?;
        Ok(session)
    }

    pub fn delete_user_session(&self, session_id: i32) -> Fallible<usize> {
        let conn = db::get_connection(&self.pool)?;
        let rows = diesel::delete(sessions::table.filter(sessions::id.eq(session_id)))
            .execute(&conn)
            .context("delete_session_failure")?;
        Ok(rows)
    }

    pub fn login_user_by_email(&self, email: &String, password: &String) -> Fallible<User> {
        let conn = db::get_connection(&self.pool)?;
        let user = users::table
            .filter(users::email.eq(email))
            .first::<User>(&conn)
            .context("user_login_failure")?;

        let verified = Self::verify_password_hash(password, &user.password_hash)?;
        if verified {
            Ok(user)
        } else {
            Err(format_err!("invalid_password"))
        }
    }
}
