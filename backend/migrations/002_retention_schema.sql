-- Migration: Retention & Streak System

-- 1. Update Users Table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active_date DATE,
ADD COLUMN IF NOT EXISTS fcm_token TEXT,
ADD COLUMN IF NOT EXISTS streak_freeze_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"quietHours": {"start": "23:00", "end": "07:00"}, "pushEnabled": true}';

-- 2. Daily Activity Table
CREATE TABLE IF NOT EXISTS daily_activity (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    questions_attempted INT DEFAULT 0,
    minutes_spent INT DEFAULT 0,
    PRIMARY KEY (user_id, date)
);

-- 3. In-App Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for notification performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;
