-- Migration: 012_update_admin_roles
-- Only allow 'brainiyoofficial@gmail.com' and 'shreyanshg2005@gmail.com' as admins.
-- Promote them if they exist, and demote any other users with role 'admin'.

UPDATE users
SET role = 'admin'
WHERE email IN ('brainiyoofficial@gmail.com', 'shreyanshg2005@gmail.com');

UPDATE users
SET role = 'student'
WHERE email NOT IN ('brainiyoofficial@gmail.com', 'shreyanshg2005@gmail.com') AND role = 'admin';
