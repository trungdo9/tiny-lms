-- Migration: quiz_enforce_lesson_section_hierarchy
-- Apply via: Supabase Dashboard → SQL Editor

-- Step 1: Add sectionId column to quizzes table
ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS section_id UUID;

-- Step 2: Make lesson_id NOT NULL logic
-- First update any existing quizzes without lesson_id (set to NULL → needs manual fix)
-- NOTE: Run this query first to check: SELECT id, lesson_id FROM quizzes WHERE lesson_id IS NULL;

-- Step 3: Add section_id FK constraint
ALTER TABLE public.quizzes
  ADD CONSTRAINT quizzes_section_id_fkey
  FOREIGN KEY (section_id) REFERENCES public.sections(id)
  ON UPDATE CASCADE ON DELETE RESTRICT;

-- Step 4: Make course_id NOT NULL (should have no nulls already, verify first)
-- SELECT id FROM quizzes WHERE course_id IS NULL;
ALTER TABLE public.quizzes
  ALTER COLUMN course_id SET NOT NULL;

-- Step 5: Add unique constraint → 1 lesson = 1 quiz max
ALTER TABLE public.quizzes
  ADD CONSTRAINT quizzes_lesson_id_key UNIQUE (lesson_id);

-- Step 6: Make lesson_id NOT NULL (verify no nulls first)
-- SELECT id FROM quizzes WHERE lesson_id IS NULL;
ALTER TABLE public.quizzes
  ALTER COLUMN lesson_id SET NOT NULL;

-- Step 7: Make section_id NOT NULL (after data fix)
ALTER TABLE public.quizzes
  ALTER COLUMN section_id SET NOT NULL;

-- Optional: Create partial index for enforcement at activity level
-- This prevents race conditions in concurrent requests
CREATE INDEX IF NOT EXISTS idx_activities_lesson_quiz
  ON public.activities(lesson_id)
  WHERE activity_type = 'quiz';
