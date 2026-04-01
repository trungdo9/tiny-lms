export declare class GenerateQuestionsDto {
    topic: string;
    context?: string;
    types: ('single' | 'multi' | 'true_false' | 'short_answer' | 'essay')[];
    difficulty: string;
    count: number;
}
