-- Migration: 004_allow_dropper_class
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_class_check;
ALTER TABLE users ADD CONSTRAINT users_class_check CHECK (class IN (11, 12, 13));
