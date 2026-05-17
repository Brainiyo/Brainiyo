-- Migration: 005_add_class_to_curriculum
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS class_level SMALLINT CHECK (class_level IN (11, 12));
-- Default existing chapters to Class 11 if not set
UPDATE chapters SET class_level = 11 WHERE class_level IS NULL;
