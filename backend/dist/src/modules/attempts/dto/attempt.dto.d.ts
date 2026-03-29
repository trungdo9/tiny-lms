export declare class SaveAnswerDto {
    questionId: string;
    selectedOptions?: string[];
    textAnswer?: string;
    orderAnswer?: string[];
    matchAnswer?: Record<string, string>;
}
export declare class SubmitAttemptDto {
    submit?: boolean;
}
