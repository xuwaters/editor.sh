table! {
    pad_contents (pad_id) {
        pad_id -> Int4,
        code -> Text,
        updated_at -> Timestamp,
    }
}

table! {
    pads (id) {
        id -> Int4,
        hash -> Varchar,
        user_id -> Int4,
        title -> Varchar,
        status -> Varchar,
        creator -> Varchar,
        language -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

table! {
    sessions (id) {
        id -> Int4,
        auth_token -> Varchar,
        user_id -> Int4,
        data -> Nullable<Varchar>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

table! {
    user_settings (user_id) {
        user_id -> Int4,
        lang -> Varchar,
        api_key -> Varchar,
        email_subscription -> Bool,
        cfg_pads_private -> Bool,
        cfg_code_execution -> Bool,
        updated_at -> Timestamp,
    }
}

table! {
    users (id) {
        id -> Int4,
        email -> Varchar,
        name -> Varchar,
        password_hash -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

joinable!(pad_contents -> pads (pad_id));
joinable!(sessions -> users (user_id));
joinable!(user_settings -> users (user_id));

allow_tables_to_appear_in_same_query!(
    pad_contents,
    pads,
    sessions,
    user_settings,
    users,
);
