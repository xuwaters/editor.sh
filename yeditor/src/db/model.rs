use chrono::prelude::*;
use diesel::prelude::*;

use super::schema::*;

/// Pagination request
#[derive(Debug)]
pub struct Pagination {
    pub page_index: i32,
    pub page_size: i32,
}

/// Pagination result
pub struct PaginatedData<T> {
    pub page_index: i32,
    pub page_size: i32,
    pub total: i32,
    pub data: Vec<T>,
}

#[derive(Debug, Queryable)]
pub struct User {
    pub id: i32,
    pub email: String,
    pub name: String,
    pub password_hash: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Insertable)]
#[table_name = "users"]
pub struct NewUser {
    pub email: String,
    pub name: String,
    pub password_hash: String,
}

#[derive(Debug, Queryable)]
pub struct Session {
    pub id: i32,
    pub auth_token: String,
    pub user_id: i32,
    pub data: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Insertable)]
#[table_name = "sessions"]
pub struct NewSession {
    pub auth_token: String,
    pub user_id: i32,
    pub data: Option<String>,
}

#[derive(Debug, Queryable)]
pub struct Pad {
    pub id: i32,
    pub hash: String,
    pub user_id: i32,
    pub title: String,
    pub status: String,
    pub creator: String,
    pub language: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug)]
pub struct PadFilter {
    pub search: Option<String>,
    pub status: Option<String>,
    pub days: Option<String>,
}

#[derive(Debug, Insertable)]
#[table_name = "pads"]
pub struct NewPad {
    pub hash: String,
    pub user_id: i32,
    pub title: String,
    pub status: String,
    pub creator: String,
    pub language: String,
}

#[derive(Debug, AsChangeset)]
#[table_name = "pads"]
pub struct PadChangeset {
    pub title: Option<String>,
    pub status: Option<String>,
    pub language: Option<String>,
}

#[derive(Debug, Queryable)]
pub struct PadContent {
    pub pad_id: i32,
    pub code: String,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Insertable)]
#[table_name = "pad_contents"]
pub struct NewPadContent {
    pub pad_id: i32,
    pub code: String,
}
