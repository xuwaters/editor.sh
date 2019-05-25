mod api_pads;
mod api_user;

use self::api_pads::*;
use self::api_user::*;
use super::ctx::GraphContext;

// QueryRoot
pub struct QueryRoot;

graphql_object!(QueryRoot: GraphContext |&self| {
  field user() -> UserQueryRoot { UserQueryRoot }
  field pads() -> PadsQueryRoot { PadsQueryRoot }
});

// MutationRoot
pub struct MutationRoot;

graphql_object!(MutationRoot: GraphContext |&self| {
  field user() -> UserMutationRoot { UserMutationRoot }
  field pads() -> PadsMutationRoot { PadsMutationRoot }
});

//
pub type GraphSchema = juniper::RootNode<'static, QueryRoot, MutationRoot>;

pub fn create_graph_schema() -> GraphSchema {
    GraphSchema::new(QueryRoot {}, MutationRoot {})
}
