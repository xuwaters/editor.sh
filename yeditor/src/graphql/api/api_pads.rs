use crate::{app, db, graphql::ctx::GraphContext};
use chrono::{DateTime, NaiveDateTime, Utc};
use juniper::{FieldError, FieldResult};

pub struct PadsQueryRoot;

graphql_object!(PadsQueryRoot: GraphContext |&self| {
    field all(&executor, req: ApiReqPadsQueryAll) -> FieldResult<ApiRespPadsQueryAll> {
        query_all(&executor, req)
    }
});

pub struct PadsMutationRoot;

graphql_object!(PadsMutationRoot: GraphContext |&self| {
    field create(&executor, req: ApiReqPadsCreate) -> FieldResult<ApiRespPadsCreate> {
        create_pad(&executor, req)
    }
});

#[derive(GraphQLInputObject, Debug)]
#[graphql(description = "pad create params")]
struct ApiReqPadsCreate {
    title: Option<String>,
    language: Option<String>,
}

#[derive(GraphQLObject, Debug)]
#[graphql(description = "pad create response")]
struct ApiRespPadsCreate {
    pad: ApiPad,
}

#[derive(GraphQLInputObject, Debug)]
#[graphql(description = "pads filter")]
struct ApiReqPadsFilter {
    search: Option<String>,
    status: Option<String>,
    days: Option<String>,
}

impl Into<db::PadFilter> for ApiReqPadsFilter {
    fn into(self) -> db::PadFilter {
        db::PadFilter {
            search: self.search,
            status: self.status,
            days: self.days,
        }
    }
}

#[derive(GraphQLInputObject, Debug)]
#[graphql(description = "pads query all request")]
struct ApiReqPadsQueryAll {
    page_index: i32,
    page_size: i32,
    filters: ApiReqPadsFilter,
}

#[derive(GraphQLObject, Debug)]
#[graphql(description = "pad")]
struct ApiPad {
    id: i32,
    hash: String,
    title: String,
    status: String,
    creator: String,
    language: String,
    create_time: DateTime<Utc>,
    update_time: DateTime<Utc>,
}

impl From<db::Pad> for ApiPad {
    fn from(pad: db::Pad) -> Self {
        Self {
            id: pad.id,
            hash: pad.hash,
            title: pad.title,
            status: pad.status,
            creator: pad.creator,
            language: pad.language,
            create_time: DateTime::from_utc(pad.created_at, Utc),
            update_time: DateTime::from_utc(pad.updated_at, Utc),
        }
    }
}

#[derive(GraphQLObject, Debug)]
struct ApiRespPadsQueryAll {
    page_index: i32,
    page_size: i32,
    total: i32,
    pads: Vec<ApiPad>,
}

impl From<db::PaginatedData<db::Pad>> for ApiRespPadsQueryAll {
    fn from(data: db::PaginatedData<db::Pad>) -> Self {
        Self {
            page_index: data.page_index,
            page_size: data.page_size,
            total: data.total,
            pads: data.data.into_iter().map(|item| item.into()).collect(),
        }
    }
}

fn query_all(
    executor: &juniper::Executor<GraphContext>,
    req: ApiReqPadsQueryAll,
) -> FieldResult<ApiRespPadsQueryAll> {
    let ctx = executor.context();
    let session = ctx.session_ref()?;
    let dao: &db::ApiDao = &ctx.dao;

    let pagination = db::Pagination {
        page_index: req.page_index,
        page_size: req.page_size,
    };
    let filters: db::PadFilter = req.filters.into();
    debug!(
        "pads.query_all pagination = {:?}, filters = {:?}",
        pagination, filters
    );

    let data = dao.pads.query_all(session.user_id, &pagination, &filters)?;

    Ok(data.into())
}

fn create_pad(
    executor: &juniper::Executor<GraphContext>,
    req: ApiReqPadsCreate,
) -> FieldResult<ApiRespPadsCreate> {
    let ctx = executor.context();
    let user_id = ctx.session_ref().map(|s| s.user_id).unwrap_or(0);
    let dao: &db::ApiDao = &ctx.dao;

    debug!("create_pad user_id = {}, req = {:?}", user_id, req);

    let curr_pads_count = dao.pads.query_pad_count(user_id).map_err(|e| {
        debug!("query pad count err = {:?}", e);
        FieldError::new(
            "query pads count failure",
            graphql_value!({"pad": "query_pads_count_failure"}),
        )
    })?;

    let config: &app::config::Config = app::config();
    let pad_limit = config.room.max_pads_per_user as i32;
    debug!(
        "pad count = {}, pad limit = {}, user_id = {}",
        curr_pads_count, pad_limit, user_id
    );

    if pad_limit > 0 && (curr_pads_count < 0 || curr_pads_count >= pad_limit) {
        return Err(FieldError::new(
            "pads limit exceeded",
            graphql_value!({"pad": "pads_limit_exceeded"}),
        ));
    }

    let pad = dao
        .pads
        .create_pad(user_id, req.title, req.language)
        .map_err(|e| {
            FieldError::new(
                "create pad failure",
                graphql_value!({ "pad": "create_pad_failure" }),
            )
        })?;

    Ok(ApiRespPadsCreate { pad: pad.into() })
}
