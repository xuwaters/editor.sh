

CREATE TABLE pads (
    id SERIAL PRIMARY KEY,
    hash VARCHAR(64) NOT NULL,
    user_id INTEGER NOT NULL DEFAULT 0,
    title VARCHAR(255) NOT NULL DEFAULT '',
    status VARCHAR(32) NOT NULL DEFAULT '',
    creator VARCHAR(128) NOT NULL DEFAULT '',
    language VARCHAR(64) NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SELECT diesel_manage_updated_at('pads');
CREATE UNIQUE INDEX pads_hash ON pads (hash);
CREATE INDEX pads_user_id_status ON pads(user_id, status);
