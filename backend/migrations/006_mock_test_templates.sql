-- Migration: 006_mock_test_templates

-- EXAM TEMPLATES
CREATE TABLE IF NOT EXISTS exam_templates (
    id               SERIAL PRIMARY KEY,
    title            VARCHAR(200) NOT NULL,
    exam_type        exam_type NOT NULL,
    duration_minutes SMALLINT NOT NULL DEFAULT 180,
    total_questions  SMALLINT NOT NULL,
    max_marks        SMALLINT NOT NULL,
    is_published     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- EXAM TEMPLATE QUESTIONS
CREATE TABLE IF NOT EXISTS exam_template_questions (
    exam_template_id INT NOT NULL REFERENCES exam_templates(id) ON DELETE CASCADE,
    question_id      UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    order_index      SMALLINT NOT NULL DEFAULT 0,
    PRIMARY KEY (exam_template_id, question_id)
);

-- UPDATE MOCK TESTS TO LINK TO TEMPLATES
ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS exam_template_id INT REFERENCES exam_templates(id) ON DELETE SET NULL;
