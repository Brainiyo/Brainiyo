-- Migration: 010_add_integer_questions
-- Run with: node scripts/migrate.js

-- Add q_type column to questions table if not exists
ALTER TABLE questions ADD COLUMN IF NOT EXISTS q_type VARCHAR(20) NOT NULL DEFAULT 'MCQ';

-- Make option columns nullable in questions
ALTER TABLE questions ALTER COLUMN option_a DROP NOT NULL;
ALTER TABLE questions ALTER COLUMN option_b DROP NOT NULL;
ALTER TABLE questions ALTER COLUMN option_c DROP NOT NULL;
ALTER TABLE questions ALTER COLUMN option_d DROP NOT NULL;

-- Drop check constraint on correct_option if it exists and alter to VARCHAR(50)
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_correct_option_check;
ALTER TABLE questions ALTER COLUMN correct_option TYPE VARCHAR(50);

-- Drop check constraint on student_attempts.selected_option if it exists and alter to VARCHAR(50)
ALTER TABLE student_attempts DROP CONSTRAINT IF EXISTS student_attempts_selected_option_check;
ALTER TABLE student_attempts ALTER COLUMN selected_option TYPE VARCHAR(50);

-- Drop check constraint on mock_test_answers.selected_option if it exists and alter to VARCHAR(50)
ALTER TABLE mock_test_answers DROP CONSTRAINT IF EXISTS mock_test_answers_selected_option_check;
ALTER TABLE mock_test_answers ALTER COLUMN selected_option TYPE VARCHAR(50);
