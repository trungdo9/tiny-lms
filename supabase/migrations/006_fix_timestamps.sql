-- Fix timestamp columns with default values

-- Courses
ALTER TABLE courses ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE courses ALTER COLUMN updated_at SET DEFAULT now();

-- Sections
ALTER TABLE sections ALTER COLUMN created_at SET DEFAULT now();

-- Lessons
ALTER TABLE lessons ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE lessons ALTER COLUMN updated_at SET DEFAULT now();

-- Categories
ALTER TABLE categories ALTER COLUMN created_at SET DEFAULT now();

-- Enrollments
ALTER TABLE enrollments ALTER COLUMN enrolled_at SET DEFAULT now();

-- Lesson Progress
ALTER TABLE lesson_progress ALTER COLUMN updated_at SET DEFAULT now();

-- Quizzes
ALTER TABLE quizzes ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE quizzes ALTER COLUMN updated_at SET DEFAULT now();

-- Question Banks
ALTER TABLE question_banks ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE question_banks ALTER COLUMN updated_at SET DEFAULT now();

-- Questions
ALTER TABLE questions ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE questions ALTER COLUMN updated_at SET DEFAULT now();

-- Question Options
ALTER TABLE question_options ALTER COLUMN created_at SET DEFAULT now();

-- Quiz Questions
ALTER TABLE quiz_questions ALTER COLUMN created_at SET DEFAULT now();

-- Quiz Attempts
ALTER TABLE quiz_attempts ALTER COLUMN created_at SET DEFAULT now();

-- Attempt Questions
ALTER TABLE attempt_questions ALTER COLUMN created_at SET DEFAULT now();

-- Quiz Answers
ALTER TABLE quiz_answers ALTER COLUMN saved_at SET DEFAULT now();

-- Flash Card Decks
ALTER TABLE flash_card_decks ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE flash_card_decks ALTER COLUMN updated_at SET DEFAULT now();

-- Flash Cards
ALTER TABLE flash_cards ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE flash_cards ALTER COLUMN updated_at SET DEFAULT now();

-- Flash Card Sessions
ALTER TABLE flash_card_sessions ALTER COLUMN created_at SET DEFAULT now();

-- Activities
ALTER TABLE activities ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE activities ALTER COLUMN updated_at SET DEFAULT now();

-- Notifications
ALTER TABLE notifications ALTER COLUMN created_at SET DEFAULT now();

-- Certificates
ALTER TABLE certificates ALTER COLUMN issued_at SET DEFAULT now();

-- Settings
ALTER TABLE settings ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE settings ALTER COLUMN updated_at SET DEFAULT now();

-- Email Templates
ALTER TABLE email_templates ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE email_templates ALTER COLUMN updated_at SET DEFAULT now();

-- Email Logs
ALTER TABLE email_logs ALTER COLUMN created_at SET DEFAULT now();

-- Profiles
ALTER TABLE profiles ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE profiles ALTER COLUMN updated_at SET DEFAULT now();

SELECT 'Timestamp defaults updated successfully!' as result;
