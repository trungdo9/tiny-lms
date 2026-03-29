type DateString = string;
export declare class CreateQuizDto {
    title: string;
    description?: string;
    timeLimitMinutes?: number;
    maxAttempts?: number;
    passScore?: number;
    showResult?: string;
    showCorrectAnswer?: boolean;
    showExplanation?: boolean;
    shuffleQuestions?: boolean;
    shuffleAnswers?: boolean;
    paginationMode?: string;
    questionsPerPage?: number;
    allowBackNavigation?: boolean;
    isPublished?: boolean;
    availableFrom?: DateString;
    availableUntil?: DateString;
    showLeaderboard?: boolean;
}
export declare class UpdateQuizDto {
    title?: string;
    description?: string;
    timeLimitMinutes?: number;
    maxAttempts?: number;
    passScore?: number;
    showResult?: string;
    showCorrectAnswer?: boolean;
    showExplanation?: boolean;
    shuffleQuestions?: boolean;
    shuffleAnswers?: boolean;
    paginationMode?: string;
    questionsPerPage?: number;
    allowBackNavigation?: boolean;
    isPublished?: boolean;
    availableFrom?: DateString;
    availableUntil?: DateString;
    showLeaderboard?: boolean;
}
export declare class AddQuizQuestionDto {
    questionId?: string;
    bankId?: string;
    pickCount?: number;
    difficultyFilter?: string;
    tagFilter?: string[];
    scoreOverride?: number;
}
export declare class CloneQuizDto {
    targetLessonId: string;
}
export {};
