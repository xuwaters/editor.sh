
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    auth_token VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    data VARCHAR,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SELECT diesel_manage_updated_at('sessions');

CREATE UNIQUE INDEX sessions_auth_token ON sessions (auth_token);
CREATE INDEX sessions_user_id ON sessions (user_id);
