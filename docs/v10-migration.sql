DROP TABLE IF EXISTS decision_logs;
DROP TABLE IF EXISTS learning_sessions;
DROP TABLE IF EXISTS cognitive_units;
DROP TABLE IF EXISTS content_raw;
CREATE TABLE content_raw (id SERIAL PRIMARY KEY, source TEXT, url TEXT, title TEXT, content TEXT, category TEXT, status TEXT, ingested_at TIMESTAMP, processed_at TIMESTAMP);
CREATE TABLE cognitive_units (id SERIAL PRIMARY KEY, user_id TEXT, type TEXT, key_concept TEXT, structured_data JSONB, source_url TEXT, created_at TIMESTAMP);
CREATE TABLE learning_sessions (id SERIAL PRIMARY KEY, user_id TEXT, flow TEXT, duration_sec INTEGER, cards_completed INTEGER, created_at TIMESTAMP);
CREATE TABLE decision_logs (id SERIAL PRIMARY KEY, user_id TEXT, recommendation TEXT, user_action TEXT, feedback TEXT, autonomy_level TEXT, created_at TIMESTAMP);
