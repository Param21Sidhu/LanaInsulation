-- Referral program tables. Safe to run more than once.
-- Apply with `npm run db:migrate` (reads DATABASE_URL, or .env.local),
-- or paste into the Neon SQL editor.

CREATE TABLE IF NOT EXISTS referrers (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name           TEXT        NOT NULL,
  first_name          TEXT        NOT NULL,          -- shown to referred friends
  email               TEXT        NOT NULL UNIQUE,   -- trimmed + lowercased
  phone               TEXT,                          -- +1XXXXXXXXXX, optional
  referral_code       TEXT        NOT NULL UNIQUE,   -- e.g. WARM-7KQ2DX
  referral_url        TEXT        NOT NULL,
  terms_version       TEXT        NOT NULL,          -- terms version accepted at sign-up
  terms_accepted_at   TIMESTAMPTZ NOT NULL,          -- when they ticked "I agree" and submitted
  referrer_reward_cad INTEGER     NOT NULL,          -- amounts in the accepted terms,
  friend_discount_cad INTEGER     NOT NULL,          --   kept for the record
  landing_views       INTEGER     NOT NULL DEFAULT 0, -- friend landing page loads
  sms_clicks          INTEGER     NOT NULL DEFAULT 0, -- "Text Us" taps, not confirmed sends
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adds the terms columns to a referrers table created before they existed.
-- Earlier rows stay NULL: acceptance records are never backfilled or rewritten.
ALTER TABLE referrers ADD COLUMN IF NOT EXISTS terms_version TEXT;
ALTER TABLE referrers ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE referrers ADD COLUMN IF NOT EXISTS referrer_reward_cad INTEGER;
ALTER TABLE referrers ADD COLUMN IF NOT EXISTS friend_discount_cad INTEGER;

CREATE TABLE IF NOT EXISTS referral_rate_limits (
  key        TEXT        PRIMARY KEY,                -- bucket + hashed client IP
  hits       INTEGER     NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);
