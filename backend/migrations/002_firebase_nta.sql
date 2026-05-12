-- Migration: 002_firebase_and_nta_updates
-- Run AFTER 001_initial_schema.sql

-- ── Users: add firebase_uid + last_login ──────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) UNIQUE,
  ADD COLUMN IF NOT EXISTS last_login   TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- ── Mock test answers: add nta_score column ───────────────────────
ALTER TABLE mock_test_answers
  ADD COLUMN IF NOT EXISTS nta_score NUMERIC(6, 4) NOT NULL DEFAULT 0;

-- ── Users: relax NOT NULL on password_hash (Firebase users have no password) ──
ALTER TABLE users ALTER COLUMN password_hash SET DEFAULT '';
UPDATE users SET password_hash = '' WHERE password_hash IS NULL;
