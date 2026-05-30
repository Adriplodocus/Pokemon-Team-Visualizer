CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider     TEXT NOT NULL,
  provider_id  TEXT NOT NULL,
  username     TEXT,
  email        TEXT,
  avatar_url   TEXT,
  tier         TEXT NOT NULL DEFAULT 'guest',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);
