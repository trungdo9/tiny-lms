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
}
export declare class BulkCreateQuestionDto {
    questions: CreateQuestionDto[];
}
