-- Rename difficulty value: 'medium' → 'normal'
UPDATE public.questions SET difficulty = 'normal' WHERE difficulty = 'medium';
UPDATE public.quiz_questions SET difficulty_filter = 'normal' WHERE difficulty_filter = 'medium';
