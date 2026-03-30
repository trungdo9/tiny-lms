export declare const VALID_QUESTION_TYPES: string[];
export declare const VALID_DIFFICULTIES: ("easy" | "medium" | "hard")[];
export declare class CreateOptionDto {
    content: string;
    isCorrect?: boolean;
    matchKey?: string;
    matchValue?: string;
}
export declare class CreateQuestionDto {
    type: string;
    content: string;
    explanation?: string;
    mediaUrl?: string;
    mediaType?: string;
    difficulty?: string;
    defaultScore?: number;
    tags?: string[];
    options?: CreateOptionDto[];
}
export declare class UpdateQuestionDto {
    content?: string;
    explanation?: string;
    mediaUrl?: string;
    mediaType?: string;
    difficulty?: string;
    defaultScore?: number;
    tags?: string[];
    options?: CreateOptionDto[];
}
export declare class BulkCreateQuestionDto {
    questions: CreateQuestionDto[];
}
export declare class ListQuestionsQueryDto {
    search?: string;
    type?: string;
    difficulty?: string;
    tags?: string;
    page?: number;
    limit?: number;
}
export declare class CloneQuestionDto {
    targetBankId?: string;
}
export declare class MoveQuestionDto {
    targetBankId: string;
}
