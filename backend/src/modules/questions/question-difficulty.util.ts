import { BadRequestException } from '@nestjs/common';

export const CANONICAL_QUESTION_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type CanonicalQuestionDifficulty = (typeof CANONICAL_QUESTION_DIFFICULTIES)[number];

export const QUESTION_DIFFICULTY_ALIAS_MAP: Record<string, CanonicalQuestionDifficulty> = {
  easy: 'easy',
  beginner: 'easy',
  basic: 'easy',

  medium: 'medium',
  intermediate: 'medium',
  normal: 'medium',
  avg: 'medium',
  average: 'medium',

  hard: 'hard',
  advanced: 'hard',
  difficult: 'hard',
};

export function normalizeQuestionDifficulty(
  input?: string | null,
  options?: { defaultValue?: CanonicalQuestionDifficulty; fieldName?: string },
): CanonicalQuestionDifficulty {
  const defaultValue = options?.defaultValue;
  const fieldName = options?.fieldName || 'difficulty';

  if (input === undefined || input === null) {
    if (defaultValue) return defaultValue;
    throw new BadRequestException(`Unsupported ${fieldName}: value is required. Allowed values: easy, medium, hard`);
  }

  const normalizedInput = String(input).trim().toLowerCase();
  if (!normalizedInput) {
    if (defaultValue) return defaultValue;
    throw new BadRequestException(`Unsupported ${fieldName}: value is required. Allowed values: easy, medium, hard`);
  }

  const canonical = QUESTION_DIFFICULTY_ALIAS_MAP[normalizedInput];
  if (!canonical) {
    throw new BadRequestException(
      `Unsupported ${fieldName}: ${input}. Allowed values: easy, medium, hard. Supported aliases: beginner/basic → easy; intermediate/normal/avg/average → medium; advanced/difficult → hard`,
    );
  }

  return canonical;
}

export function normalizeQuestionDifficultyList(input?: string | null): CanonicalQuestionDifficulty[] | undefined {
  if (!input) return undefined;

  return input
    .split(',')
    .map((value) => normalizeQuestionDifficulty(value, { fieldName: 'difficulty filter' }))
    .filter((value, index, list) => list.indexOf(value) === index);
}

export function normalizeOptionalQuestionDifficulty(
  input?: string | null,
  fieldName: string = 'difficulty',
): CanonicalQuestionDifficulty | undefined {
  if (input === undefined || input === null) return undefined;
  return normalizeQuestionDifficulty(input, { fieldName });
}

export function isCanonicalQuestionDifficulty(value?: string | null): value is CanonicalQuestionDifficulty {
  if (!value) return false;
  return (CANONICAL_QUESTION_DIFFICULTIES as readonly string[]).includes(value);
}
