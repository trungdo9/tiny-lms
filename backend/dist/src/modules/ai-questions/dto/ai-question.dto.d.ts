export declare class AIOption {
    content: string;
    isCorrect: boolean;
    matchKey?: string;
    matchValue?: string;
    orderIndex?: number;
}
export declare class AIGeneratedQuestion {
    type: string;
    content: string;
    explanation?: string;
    difficulty: string;
    defaultScore: number;
    options: AIOption[];
    tags: string[];
}
