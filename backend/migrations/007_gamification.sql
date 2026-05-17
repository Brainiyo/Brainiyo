-- Migration: 007_gamification

ALTER TABLE users ADD COLUMN IF NOT EXISTS xp_points INT NOT NULL DEFAULT 0;

-- Create an index to make leaderboard queries faster
CREATE INDEX IF NOT EXISTS idx_users_xp ON users(target_exam, xp_points DESC);
