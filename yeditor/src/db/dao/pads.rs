use base_x;
use diesel::debug_query;
use diesel::prelude::*;
use failure::{Fallible, ResultExt};
use std::{cmp, str};
use uuid::Uuid;

use crate::db::{self, model::*, schema::*, Paginate};

pub struct PadsDao {
    pool: db::DBPool,
}

impl PadsDao {
    pub fn new(pool: &db::DBPool) -> Self {
        Self { pool: pool.clone() }
    }

    pub fn query_all(
        &self,
        user_id: i32,
        pagination: &Pagination,
        filters: &PadFilter,
    ) -> Fallible<PaginatedData<Pad>> {
        let conn = db::get_connection(&self.pool)?;

        let page_size = cmp::max(1, cmp::min(pagination.page_size, 25));

        let mut query = pads::table.into_boxed();
        query = query.filter(pads::user_id.eq(user_id));

        if let Some(days) = filters.days.as_ref() {
            let days_value: i32 = days.parse().unwrap_or(0);
            if days_value > 0 {
                use diesel::dsl::*;
                query = query.filter(pads::created_at.ge(now - days_value.days()));
            }
        }

        if let Some(status) = filters.status.as_ref() {
            if status.len() > 0 {
                query = query.filter(pads::status.eq(status));
            }
        }

        if let Some(search) = filters.search.as_ref() {
            if search.len() > 0 && !search.contains("%") && !search.contains("?") {
                let title_pat = format!("%{}%", search);
                let creator_pat = title_pat.clone();
                let criteria = pads::title
                    .like(title_pat)
                    .or(pads::creator.like(creator_pat));
                query = query.filter(criteria);
            }
        }

        let query = query
            .select(pads::all_columns)
            .order(pads::created_at.desc())
            .paginate(pagination.page_index as i64)
            .page_size(page_size as i64);

        debug!(
            "query_all_pads = {}",
            debug_query::<db::DB, _>(&query).to_string()
        );

        let (data, total) = query
            .load_and_count::<db::Pad>(&conn)
            .context("query_all_pads_failure")?;

        Ok(PaginatedData {
            page_index: pagination.page_index,
            page_size: page_size,
            total: total as i32,
            data: data,
        })
    }

    pub fn query_pad_count(&self, user_id: i32) -> Fallible<i32> {
        let conn = db::get_connection(&self.pool)?;

        let pads_count: i64 = pads::table
            .filter(pads::user_id.eq(user_id))
            .count()
            .get_result(&conn)
            .context("query_pads_count_failure")?;

        Ok(pads_count as i32)
    }

    pub fn create_pad(
        &self,
        user_id: i32,
        title: Option<String>,
        language: Option<String>,
    ) -> Fallible<Pad> {
        let conn = db::get_connection(&self.pool)?;

        let hash = Self::generate_pad_hash();
        let hash_title: String = hash.chars().take(6).collect();
        let title_str = title.unwrap_or(format!("untitled - {}", hash_title));
        let language_str = language.unwrap_or("plaintext".into());
        let status = PadStatus::Unused;

        let new_pad = NewPad {
            hash: hash,
            user_id: user_id,
            title: title_str.into(),
            status: status.as_str().into(),
            creator: "".into(),
            language: language_str.into(),
        };

        let pad = diesel::insert_into(pads::table)
            .values(new_pad)
            .get_result(&conn)
            .context("create_pad_failure")?;

        Ok(pad)
    }

    fn generate_pad_hash() -> String {
        let hash_uuid = Uuid::new_v4();
        let data = base_x::encode(BASE62_ALPHABETS, hash_uuid.as_bytes());
        data
    }
}

const BASE62_ALPHABETS: &'static str =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const PAD_STATUS_UNUSED: &'static str = "unused";
const PAD_STATUS_PROCESSING: &'static str = "processing";
const PAD_STATUS_ENDED: &'static str = "ended";

pub enum PadStatus {
    Unused,
    Processing,
    Ended,
}

impl str::FromStr for PadStatus {
    type Err = &'static str;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            PAD_STATUS_UNUSED => Ok(PadStatus::Unused),
            PAD_STATUS_PROCESSING => Ok(PadStatus::Processing),
            PAD_STATUS_ENDED => Ok(PadStatus::Ended),
            _ => Err("unknown status"),
        }
    }
}

impl PadStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            PadStatus::Unused => PAD_STATUS_UNUSED,
            PadStatus::Processing => PAD_STATUS_PROCESSING,
            PadStatus::Ended => PAD_STATUS_ENDED,
        }
    }
}

// pad contents

impl PadsDao {
    pub fn query_pad_by_hash(&self, pad_hash: &str) -> Fallible<Option<Pad>> {
        let conn = db::get_connection(&self.pool)?;
        let pad = pads::table
            .filter(pads::hash.eq(pad_hash))
            .first::<Pad>(&conn)
            .optional()?;

        Ok(pad)
    }

    pub fn query_pad_content(&self, pad_id: i32) -> Fallible<Option<PadContent>> {
        let conn = db::get_connection(&self.pool)?;

        let content = pad_contents::table
            .find(pad_id)
            .first::<PadContent>(&conn)
            .optional()?;

        Ok(content)
    }

    pub fn save_pad_content(&self, content: NewPadContent) -> Fallible<()> {
        let conn = db::get_connection(&self.pool)?;
        let code = &content.code;

        diesel::insert_into(pad_contents::table)
            .values(&content)
            .on_conflict(pad_contents::pad_id)
            .do_update()
            .set(pad_contents::code.eq(code))
            .execute(&conn)?;

        Ok(())
    }

    pub fn update_pad(&self, pad_id: i32, changeset: PadChangeset) -> Fallible<()> {
        let conn = db::get_connection(&self.pool)?;
        diesel::update(pads::table)
            .filter(pads::id.eq(pad_id))
            .set(changeset)
            .execute(&conn)?;
        Ok(())
    }
}
