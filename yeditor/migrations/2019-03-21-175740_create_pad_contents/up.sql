
CREATE TABLE pad_contents (
    pad_id INTEGER NOT NULL PRIMARY KEY REFERENCES pads(id),
    code TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SELECT diesel_manage_updated_at('pad_contents');
