export declare const CANONICAL_QUESTION_DIFFICULTIES: readonly ["easy", "medium", "hard"];
export type CanonicalQuestionDifficulty = (typeof CANONICAL_QUESTION_DIFFICULTIES)[number];
export declare const QUESTION_DIFFICULTY_ALIAS_MAP: Record<string, CanonicalQuestionDifficulty>;
export declare function normalizeQuestionDifficulty(input?: string | null, options?: {
    defaultValue?: CanonicalQuestionDifficulty;
    fieldName?: string;
}): CanonicalQuestionDifficulty;
export declare function normalizeQuestionDifficultyList(input?: string | null): CanonicalQuestionDifficulty[] | undefined;
export declare function normalizeOptionalQuestionDifficulty(input?: string | null, fieldName?: string): CanonicalQuestionDifficulty | undefined;
export declare function isCanonicalQuestionDifficulty(value?: string | null): value is CanonicalQuestionDifficulty;
