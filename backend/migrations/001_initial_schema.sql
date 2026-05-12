-- Migration: 001_initial_schema
-- Run with: npm run migrate

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ENUMS
DO $$ BEGIN
  CREATE TYPE exam_type        AS ENUM ('NEET', 'JEE', 'BOTH');
  CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
  CREATE TYPE question_source  AS ENUM ('NCERT', 'PYQ', 'NEW');
  CREATE TYPE plan_type        AS ENUM ('free', 'pro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(100)        NOT NULL,
    phone         VARCHAR(15),
    email         VARCHAR(255) UNIQUE,
    class         SMALLINT            NOT NULL CHECK (class IN (11, 12)),
    target_exam   exam_type           NOT NULL,
    password_hash TEXT                NOT NULL,
    otp_secret    TEXT,
    is_verified   BOOLEAN             NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- SUBJECTS
CREATE TABLE IF NOT EXISTS subjects (
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    exam_type exam_type    NOT NULL,
    icon_url  TEXT,
    UNIQUE (name, exam_type)
);

-- CHAPTERS
CREATE TABLE IF NOT EXISTS chapters (
    id          SERIAL PRIMARY KEY,
    subject_id  INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name        VARCHAR(150) NOT NULL,
    order_index SMALLINT     NOT NULL DEFAULT 0,
    UNIQUE (subject_id, name)
);

-- TOPICS
CREATE TABLE IF NOT EXISTS topics (
    id         SERIAL PRIMARY KEY,
    chapter_id INT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    name       VARCHAR(150) NOT NULL,
    UNIQUE (chapter_id, name)
);

-- QUESTIONS
CREATE TABLE IF NOT EXISTS questions (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id         INT              NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    body             TEXT             NOT NULL,
    option_a         TEXT             NOT NULL,
    option_b         TEXT             NOT NULL,
    option_c         TEXT             NOT NULL,
    option_d         TEXT             NOT NULL,
    correct_option   CHAR(1)          NOT NULL CHECK (correct_option IN ('A','B','C','D')),
    difficulty       difficulty_level NOT NULL DEFAULT 'medium',
    source           question_source  NOT NULL DEFAULT 'NEW',
    explanation_text TEXT,
    image_url        TEXT,
    is_active        BOOLEAN          NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_questions_topic      ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(topic_id, difficulty);

-- STUDENT ATTEMPTS
CREATE TABLE IF NOT EXISTS student_attempts (
    id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id            UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id        UUID        NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option    CHAR(1)     CHECK (selected_option IN ('A','B','C','D')),
    is_correct         BOOLEAN     NOT NULL,
    time_taken_seconds SMALLINT    NOT NULL DEFAULT 0,
    attempted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_attempts_user     ON student_attempts(user_id, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_question ON student_attempts(question_id);

-- STUDENT TOPIC STATS
CREATE TABLE IF NOT EXISTS student_topic_stats (
    user_id           UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id          INT          NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    total_attempts    INT          NOT NULL DEFAULT 0,
    correct_attempts  INT          NOT NULL DEFAULT 0,
    accuracy_percent  NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    last_attempted_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, topic_id)
);

-- TRIGGER: auto-update topic stats
CREATE OR REPLACE FUNCTION update_topic_stats()
RETURNS TRIGGER AS $$
DECLARE v_topic_id INT;
BEGIN
    SELECT topic_id INTO v_topic_id FROM questions WHERE id = NEW.question_id;
    INSERT INTO student_topic_stats
        (user_id, topic_id, total_attempts, correct_attempts, accuracy_percent, last_attempted_at)
    VALUES (
        NEW.user_id, v_topic_id, 1,
        CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
        CASE WHEN NEW.is_correct THEN 100.00 ELSE 0.00 END,
        NEW.attempted_at
    )
    ON CONFLICT (user_id, topic_id) DO UPDATE SET
        total_attempts   = student_topic_stats.total_attempts + 1,
        correct_attempts = student_topic_stats.correct_attempts
                           + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
        accuracy_percent = ROUND(
            ((student_topic_stats.correct_attempts
              + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END)::NUMERIC
             / (student_topic_stats.total_attempts + 1)) * 100, 2),
        last_attempted_at = NEW.attempted_at;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_topic_stats ON student_attempts;
CREATE TRIGGER trg_update_topic_stats
AFTER INSERT ON student_attempts
FOR EACH ROW EXECUTE FUNCTION update_topic_stats();

-- SPACED REPETITION QUEUE
CREATE TABLE IF NOT EXISTS spaced_repetition_queue (
    id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id        UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id    UUID         NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    next_review_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    interval_days  NUMERIC(6,2) NOT NULL DEFAULT 1,
    ease_factor    NUMERIC(4,2) NOT NULL DEFAULT 2.50,
    repetitions    SMALLINT     NOT NULL DEFAULT 0,
    UNIQUE (user_id, question_id)
);
CREATE INDEX IF NOT EXISTS idx_srq_user_due ON spaced_repetition_queue(user_id, next_review_at);

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan                plan_type   NOT NULL DEFAULT 'free',
    started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMPTZ,
    razorpay_order_id   VARCHAR(100) UNIQUE,
    razorpay_payment_id VARCHAR(100),
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id, is_active);

-- MOCK TESTS
CREATE TABLE IF NOT EXISTS mock_tests (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exam_type       exam_type   NOT NULL,
    total_questions SMALLINT    NOT NULL,
    score           SMALLINT,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS mock_test_answers (
    id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    mock_test_id    UUID    NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
    question_id     UUID    NOT NULL REFERENCES questions(id),
    selected_option CHAR(1) CHECK (selected_option IN ('A','B','C','D')),
    is_correct      BOOLEAN NOT NULL
);
