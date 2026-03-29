-- Migration: add_course_instructors_backfill
-- Apply via: Supabase Dashboard → SQL Editor  OR  run via psql

-- Backfill existing courses: insert primary instructor rows from courses.instructor_id
INSERT INTO public.course_instructors (id, course_id, profile_id, role, added_at, added_by)
SELECT
  gen_random_uuid(),
  id,
  instructor_id,
  'primary',
  created_at,
  instructor_id
FROM public.courses
ON CONFLICT (course_id, profile_id) DO NOTHING;
