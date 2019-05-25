
CREATE TABLE user_settings (
    user_id INTEGER NOT NULL PRIMARY KEY REFERENCES users (id),
    lang VARCHAR(64) NOT NULL DEFAULT '',
    api_key VARCHAR(255) NOT NULL DEFAULT '',
    email_subscription BOOLEAN NOT NULL DEFAULT TRUE,
    cfg_pads_private BOOLEAN NOT NULL DEFAULT TRUE,
    cfg_code_execution BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SELECT diesel_manage_updated_at('user_settings');
