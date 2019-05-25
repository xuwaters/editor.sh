use github_rs::client::{Executor, Github};
use juniper::{FieldError, FieldResult};
use oauth2;

use crate::{app, db, graphql::ctx::GraphContext};

pub struct UserQueryRoot;

graphql_object!(UserQueryRoot: GraphContext |&self| {
    field current(&executor) -> FieldResult<ApiUser> {
        query_user(&executor)
    }
    field oauth_url(&executor, req: ApiReqUserOAuthQueryUrl) -> FieldResult<ApiUserOAuthUrl> {
        query_user_oauth_url(&executor, req)
    }
});

pub struct UserMutationRoot;

graphql_object!(UserMutationRoot: GraphContext |&self| {
    field register(&executor, req: ApiReqUserRegister) -> FieldResult<ApiLoggedInUser> {
        mutation_user_register(executor, req)
    }
    field login(&executor, req: ApiReqUserLogin) -> FieldResult<ApiLoggedInUser> {
        mutation_user_login(executor, req)
    }
    field logout(&executor) -> FieldResult<i32> as "returns user id" {
        mutation_user_logout(executor)
    }
    field oauth_login(&executor, req: ApiReqUserOAuthLogin) -> FieldResult<ApiLoggedInUser> {
        mutation_user_oauth_login(executor, req)
    }
});

// response object

#[derive(GraphQLObject, Debug)]
#[graphql(description = "user info")]
struct ApiUser {
    id: i32,
    email: String,
    name: String,
}

impl From<db::User> for ApiUser {
    fn from(user: db::User) -> Self {
        Self {
            id: user.id,
            email: user.email,
            name: user.name,
        }
    }
}

#[derive(GraphQLObject, Debug)]
#[graphql(description = "session info")]
struct ApiSessionInfo {
    token: String,
}

impl From<db::Session> for ApiSessionInfo {
    fn from(session: db::Session) -> Self {
        Self {
            token: session.auth_token,
        }
    }
}

#[derive(GraphQLObject, Debug)]
#[graphql(description = "logged in user")]
struct ApiLoggedInUser {
    session: ApiSessionInfo,
    user: ApiUser,
}

#[derive(GraphQLObject, Debug)]
#[graphql(description = "oauth login url")]
struct ApiUserOAuthUrl {
    platform: String,
    authorize_url: String,
}

// input object

#[derive(GraphQLInputObject, Debug)]
#[graphql(description = "user register request")]
struct ApiReqUserRegister {
    email: String,
    name: String,
    password: String,
    email_subscription: bool,
}

#[derive(GraphQLInputObject, Debug)]
#[graphql(description = "user login request")]
struct ApiReqUserLogin {
    email: String,
    password: String,
}

#[derive(GraphQLInputObject, Debug)]
#[graphql(description = "user oauth login request")]
struct ApiReqUserOAuthLogin {
    platform: String,
    code: String,
}

#[derive(GraphQLInputObject, Debug)]
#[graphql(description = "user oauth login url query request")]
struct ApiReqUserOAuthQueryUrl {
    platform: String,
}

fn query_user(executor: &juniper::Executor<GraphContext>) -> FieldResult<ApiUser> {
    let ctx = executor.context();
    info!(
        "auth_token = {}, session = {:?}",
        ctx.auth_token, ctx.session
    );

    let dao: &db::ApiDao = &ctx.dao;
    let session = ctx.session_ref()?;
    let user = dao.user.get_session_user(session)?.ok_or(FieldError::new(
        "user not found",
        graphql_value!({"user": "not_found"}),
    ))?;

    Ok(user.into())
}

fn validate_email(email: &str) -> FieldResult<()> {
    if email.trim().is_empty() {
        Err(FieldError::new(
            "Invalid email format",
            graphql_value!({"email": "invalid_format"}),
        ))
    } else {
        Ok(())
    }
}

fn validate_user_name(name: &str) -> FieldResult<()> {
    if name.trim().is_empty() {
        Err(FieldError::new(
            "Invalid name format",
            graphql_value!({"name": "invalid_format"}),
        ))
    } else {
        Ok(())
    }
}

fn validate_user_password(password: &str) -> FieldResult<()> {
    if password.is_empty() || password.len() > 128 {
        Err(FieldError::new(
            "Invalid password format",
            graphql_value!({"password": "invalid_format"}),
        ))
    } else {
        Ok(())
    }
}

fn query_user_oauth_url(
    executor: &juniper::Executor<GraphContext>,
    req: ApiReqUserOAuthQueryUrl,
) -> FieldResult<ApiUserOAuthUrl> {
    if req.platform != "github" {
        Err(FieldError::new(
            "unsupported platform",
            graphql_value!({"platform": "unsupported_platform"}),
        ))
    } else {
        let config = app::config();
        let oauth2_config = oauth2::Config::new(
            config.server.github_client_id.clone(),
            config.server.github_client_secret.clone(),
            &config.server.github_auth_url,
            &config.server.github_token_url,
        )
        .add_scope("user:email");
        // TODO: generate an signed string as state

        let authorize_url = oauth2_config.authorize_url();

        Ok(ApiUserOAuthUrl {
            platform: req.platform,
            authorize_url: authorize_url.into_string(),
        })
    }
}

// mutations

fn mutation_user_register(
    executor: &juniper::Executor<GraphContext>,
    req: ApiReqUserRegister,
) -> FieldResult<ApiLoggedInUser> {
    let ctx = executor.context();
    info!("user_register req = {:?}, session = {:?}", req, ctx.session);

    return Err(FieldError::new(
        "unsupported register method",
        graphql_value!({"register": "unsupported_register"}),
    ));

    validate_email(req.email.as_str())?;
    validate_user_name(req.name.as_str())?;
    validate_user_password(req.password.as_str())?;

    let dao: &db::ApiDao = &ctx.dao;
    let user = dao.user.create_user(&req.email, &req.name, &req.password)?;
    let session = dao.user.create_user_session(&user)?;
    Ok(ApiLoggedInUser {
        user: user.into(),
        session: session.into(),
    })
}

fn mutation_user_login(
    executor: &juniper::Executor<GraphContext>,
    req: ApiReqUserLogin,
) -> FieldResult<ApiLoggedInUser> {
    let ctx = executor.context();
    info!("user_login req = {:?}, session = {:?}", req, ctx.session);

    return Err(FieldError::new(
        "unsupported login method",
        graphql_value!({"login": "unsupported_login"}),
    ));

    validate_email(req.email.as_str())?;
    validate_user_password(req.password.as_str())?;

    let dao: &db::ApiDao = &ctx.dao;
    let user = dao.user.login_user_by_email(&req.email, &req.password)?;
    let session = dao.user.create_user_session(&user)?;
    Ok(ApiLoggedInUser {
        user: user.into(),
        session: session.into(),
    })
}

fn mutation_user_logout(executor: &juniper::Executor<GraphContext>) -> FieldResult<i32> {
    let ctx = executor.context();
    info!("user_logout req = {:?}, session = {:?}", "", ctx.session);

    match &ctx.session {
        Some(ref sess) => {
            let dao: &db::ApiDao = &ctx.dao;
            dao.user.delete_user_session(sess.id)?;
            Ok(sess.user_id)
        }
        None => Ok(0),
    }
}

fn mutation_user_oauth_login(
    executor: &juniper::Executor<GraphContext>,
    req: ApiReqUserOAuthLogin,
) -> FieldResult<ApiLoggedInUser> {
    let ctx = executor.context();
    info!(
        "user_oauth_login req = {:?}, session = {:?}",
        req, ctx.session
    );

    if req.platform != "github" {
        return Err(FieldError::new(
            "unsupported oauth login platform",
            graphql_value!({"platform": "unsupported_platform"}),
        ));
    }

    if req.code == "" || req.code.len() > 512 {
        return Err(FieldError::new(
            "invalid client code format",
            graphql_value!({"code": "invalid_code_format"}),
        ));
    }

    // query user information via code
    let config = app::config();
    let oauth2_config = oauth2::Config::new(
        config.server.github_client_id.clone(),
        config.server.github_client_secret.clone(),
        &config.server.github_auth_url,
        &config.server.github_token_url,
    )
    .add_scope("user:email");

    let github_token = match oauth2_config.exchange_code(req.code.clone()) {
        Err(err) => {
            info!("exchange code err = {:?}, code = {}", err, req.code);
            return Err(FieldError::new(
                "invalid client code",
                graphql_value!({"code": "invalid_client_code"}),
            ));
        }
        Ok(token) => token,
    };

    info!("client access_token = {:?}", github_token);

    // query user email
    let client = match Github::new(github_token.access_token) {
        Err(err) => {
            info!("create github client err = {:?}", err);
            return Err(FieldError::new(
                "invalid_token",
                graphql_value!({"code": "invalid_token"}),
            ));
        }
        Ok(client) => client,
    };

    let github_user = match client.get().user().execute::<serde_json::Value>() {
        Err(err) => {
            info!("query github user failure: {:?}", err);
            return Err(FieldError::new(
                "invalid_user",
                graphql_value!({"user": "invalid_access_token"}),
            ));
        }
        Ok((headers, status, json)) => match json {
            None => {
                return Err(FieldError::new(
                    "invalid_user",
                    graphql_value!({"user": "invalid_api_response"}),
                ));
            }
            Some(json_value) => json_value,
        },
    };

    info!("got user info = {:?}", github_user);

    // fields of github_user
    //   "avatar_url": String,
    //   "bio": Null,
    //   "blog": String,
    //   "company": Null,
    //   "created_at": String("2018-01-01T00:00:00Z"),
    //   "email": String,
    //   "events_url": String,
    //   "followers": Number,
    //   "followers_url": String,
    //   "following": Number,
    //   "following_url": String,
    //   "gists_url": String,
    //   "gravatar_id": String,
    //   "hireable": Bool,
    //   "html_url": String,
    //   "id": Number,
    //   "location": Null,
    //   "login": String,
    //   "name": String,
    //   "node_id": String,
    //   "organizations_url": String,
    //   "public_gists": Number,
    //   "public_repos": Number,
    //   "received_events_url": String,
    //   "repos_url": String,
    //   "site_admin": Bool,
    //   "starred_url": String,
    //   "subscriptions_url": String,
    //   "type": String,
    //   "updated_at": String,
    //   "url": String

    let user_login_value = &github_user["login"];
    let user_name_value = &github_user["name"];

    let user_name = user_name_value.as_str().unwrap_or("").to_owned();
    // use login instead of email (email may not be availabe)
    let user_login = match user_login_value.as_str() {
        None => {
            info!("login not found in user information");
            return Err(FieldError::new(
                "invalid_login",
                graphql_value!({"user": "invalid_user_login"}),
            ));
        }
        Some(val) => format!("{}@github", val),
    };

    // save or update user information in database
    let dao: &db::ApiDao = &ctx.dao;
    let user = dao
        .user
        .create_user_by_oauth(&user_login, &user_name)?;
    let session = dao.user.create_user_session(&user)?;

    Ok(ApiLoggedInUser {
        user: user.into(),
        session: session.into(),
    })
}
