-- Migration: Normalize question difficulty values
-- Date: 2026-03-30
-- Description: Normalize all question difficulty and difficultyFilter values to canonical forms (easy, medium, hard)

-- ============================================
-- Step 1: Normalize questions.difficulty
-- ============================================

-- First, let's see what distinct values exist (for documentation/audit)
-- SELECT DISTINCT difficulty FROM questions;

-- Normalize questions.difficulty using the alias map:
-- easy: easy, beginner, basic
-- medium: medium, intermediate, normal, avg, average
-- hard: hard, advanced, difficult

UPDATE questions
SET difficulty = 'easy'
WHERE LOWER(TRIM(difficulty)) IN ('easy', 'beginner', 'basic');

UPDATE questions
SET difficulty = 'medium'
WHERE LOWER(TRIM(difficulty)) IN ('medium', 'intermediate', 'normal', 'avg', 'average');

UPDATE questions
SET difficulty = 'hard'
WHERE LOWER(TRIM(difficulty)) IN ('hard', 'advanced', 'difficult');

-- Set any remaining non-canonical values (NULL, empty, or unknown) to 'medium' as default
UPDATE questions
SET difficulty = 'medium'
WHERE difficulty IS NULL
   OR TRIM(difficulty) = ''
   OR LOWER(TRIM(difficulty)) NOT IN ('easy', 'medium', 'hard');

-- ============================================
-- Step 2: Normalize quiz_questions.difficulty_filter
-- ============================================

-- First, let's see what distinct values exist (for documentation/audit)
-- SELECT DISTINCT difficulty_filter FROM quiz_questions WHERE difficulty_filter IS NOT NULL;

-- Normalize difficultyFilter using the same alias map
UPDATE quiz_questions
SET difficulty_filter = 'easy'
WHERE LOWER(TRIM(difficulty_filter)) IN ('easy', 'beginner', 'basic');

UPDATE quiz_questions
SET difficulty_filter = 'medium'
WHERE LOWER(TRIM(difficulty_filter)) IN ('medium', 'intermediate', 'normal', 'avg', 'average');

UPDATE quiz_questions
SET difficulty_filter = 'hard'
WHERE LOWER(TRIM(difficulty_filter)) IN ('hard', 'advanced', 'difficult');

-- Set any remaining non-canonical values to NULL (meaning no filter)
UPDATE quiz_questions
SET difficulty_filter = NULL
WHERE difficulty_filter IS NOT NULL
  AND LOWER(TRIM(difficulty_filter)) NOT IN ('easy', 'medium', 'hard')
  AND LOWER(TRIM(difficulty_filter)) NOT IN ('beginner', 'basic', 'intermediate', 'normal', 'avg', 'average', 'advanced', 'difficult');

-- ============================================
-- Step 3: Verification queries (run manually to confirm)
-- ============================================
-- SELECT DISTINCT difficulty FROM questions;
-- SELECT DISTINCT difficulty_filter FROM quiz_questions WHERE difficulty_filter IS NOT NULL;