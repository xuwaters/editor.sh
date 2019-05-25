
DROP INDEX IF EXISTS sessions_user_id;
DROP INDEX IF EXISTS sessions_session_key;
DROP TRIGGER IF EXISTS set_updated_at ON sessions;
DROP TABLE IF EXISTS sessions;
