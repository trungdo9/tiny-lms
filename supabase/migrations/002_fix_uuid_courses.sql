-- Migration: Enable UUID extension and fix all tables
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fix courses table
ALTER TABLE courses ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE courses ALTER COLUMN updated_at SET DEFAULT now();

-- Fix sections table
ALTER TABLE sections ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Fix lessons table
ALTER TABLE lessons ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Fix questions table
ALTER TABLE questions ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Fix question_options table
ALTER TABLE question_options ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Fix question_banks table
ALTER TABLE question_banks ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Fix quizzes table
ALTER TABLE quizzes ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Fix quiz_questions table
ALTER TABLE quiz_questions ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Fix quiz_attempts table
ALTER TABLE quiz_attempts ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Fix quiz_answers table
ALTER TABLE quiz_answers ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Fix enrollments table
ALTER TABLE enrollments ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Fix lesson_progress table
ALTER TABLE lesson_progress ALTER COLUMN id SET DEFAULT uuid_generate_v4();
