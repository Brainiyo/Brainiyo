-- Migration: 011_fix_mock_test_answers_cascade
-- Alter mock_test_answers table to cascade delete when a question is deleted

ALTER TABLE mock_test_answers
DROP CONSTRAINT IF EXISTS mock_test_answers_question_id_fkey,
ADD CONSTRAINT mock_test_answers_question_id_fkey
  FOREIGN KEY (question_id)
  REFERENCES questions(id)
  ON DELETE CASCADE;
