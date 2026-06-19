CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider     TEXT NOT NULL,
  provider_id  TEXT NOT NULL,
  username     TEXT,
  email        TEXT,
  avatar_url   TEXT,
  tier         TEXT NOT NULL DEFAULT 'guest',
  featured     BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

CREATE TABLE IF NOT EXISTS randomlocke_routes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  zone_name  TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, zone_name)
);
CREATE INDEX IF NOT EXISTS idx_randomlocke_routes_user ON randomlocke_routes(user_id);

-- Single-row table: stores the refreshed global bot token.
-- Seeded manually; updated by TwitchBotDO on each token refresh.
CREATE TABLE IF NOT EXISTS bot_global_token (
  id            SERIAL PRIMARY KEY,
  access_token  TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- EventSub subscription per user (replaces TwitchBotDO)
CREATE TABLE IF NOT EXISTS bot_eventsub_subscriptions (
  user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  subscription_id TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
