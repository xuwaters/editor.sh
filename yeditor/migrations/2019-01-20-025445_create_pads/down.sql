

DROP INDEX IF EXISTS pads_hash;
DROP INDEX IF EXISTS pads_user_id_status;
DROP TRIGGER IF EXISTS set_updated_at ON pads;
DROP TABLE IF EXISTS pads;

