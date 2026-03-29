-- Fix UUID default generation for all tables
-- This script sets gen_random_uuid() as default for UUID columns

-- Courses
ALTER TABLE courses ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Sections
ALTER TABLE sections ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Lessons
ALTER TABLE lessons ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Categories
ALTER TABLE categories ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Enrollments
ALTER TABLE enrollments ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Lesson Progress
ALTER TABLE lesson_progress ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Quizzes
ALTER TABLE quizzes ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Question Banks
ALTER TABLE question_banks ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Questions
ALTER TABLE questions ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Question Options
ALTER TABLE question_options ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Quiz Questions
ALTER TABLE quiz_questions ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Quiz Attempts
ALTER TABLE quiz_attempts ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Attempt Questions
ALTER TABLE attempt_questions ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Quiz Answers
ALTER TABLE quiz_answers ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Flash Card Decks
ALTER TABLE flash_card_decks ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Flash Cards
ALTER TABLE flash_cards ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Flash Card Sessions
ALTER TABLE flash_card_sessions ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Activities
ALTER TABLE activities ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Notifications
ALTER TABLE notifications ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Certificates
ALTER TABLE certificates ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Settings
ALTER TABLE settings ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Email Templates
ALTER TABLE email_templates ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Email Logs
ALTER TABLE email_logs ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Profiles (already has default, but ensuring)
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Also fix parent_id in categories if needed
ALTER TABLE categories ALTER COLUMN parent_id SET DEFAULT gen_random_uuid();

SELECT 'UUID defaults updated successfully!' as result;
