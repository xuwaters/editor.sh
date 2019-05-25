//! Modified from https://github.com/diesel-rs/diesel/blob/master/examples/postgres/advanced-blog-cli/src/pagination.rs

use diesel::{
    query_builder::{AstPass, Query, QueryFragment, QueryId},
    query_dsl::methods::LoadQuery,
    sql_types::BigInt,
    QueryResult, RunQueryDsl,
};

use super::{DBConn, DB};

pub trait Paginate: Sized {
    /// page_index: zero based page index
    fn paginate(self, page_index: i64) -> Paginated<Self>;
}

impl<T> Paginate for T {
    fn paginate(self, page_index: i64) -> Paginated<Self> {
        Paginated {
            query: self,
            page_index: page_index,
            page_size: DEFAULT_PAGE_SIZE,
        }
    }
}

const DEFAULT_PAGE_SIZE: i64 = 10;

#[derive(Debug, Clone, Copy, QueryId)]
pub struct Paginated<T> {
    query: T,
    page_index: i64,
    page_size: i64,
}

impl<T> Paginated<T> {
    pub fn page_size(self, page_size: i64) -> Self {
        Paginated { page_size, ..self }
    }

    /// return (records, total)
    pub fn load_and_count<U>(self, conn: &DBConn) -> QueryResult<(Vec<U>, i64)>
    where
        Self: LoadQuery<DBConn, (U, i64)>,
    {
        let results = self.load::<(U, i64)>(conn)?;
        let total = results.get(0).map(|x| x.1).unwrap_or(0);
        let records = results.into_iter().map(|x| x.0).collect();
        Ok((records, total))
    }
}

impl<T: Query> Query for Paginated<T> {
    type SqlType = (T::SqlType, BigInt);
}

impl<T> RunQueryDsl<DBConn> for Paginated<T> {}

impl<T> QueryFragment<DB> for Paginated<T>
where
    T: QueryFragment<DB>,
{
    fn walk_ast(&self, mut out: AstPass<DB>) -> QueryResult<()> {
        out.push_sql("SELECT *, COUNT(*) OVER () FROM (");
        self.query.walk_ast(out.reborrow())?;
        out.push_sql(") t LIMIT ");
        out.push_bind_param::<BigInt, _>(&self.page_size)?;
        out.push_sql(" OFFSET ");
        let offset = self.page_index * self.page_size;
        out.push_bind_param::<BigInt, _>(&offset)?;
        Ok(())
    }
}
