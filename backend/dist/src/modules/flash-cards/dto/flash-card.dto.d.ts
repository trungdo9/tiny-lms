export declare class CreateDeckDto {
    title: string;
    description?: string;
    shuffleCards?: boolean;
    isPublished?: boolean;
}
export declare class UpdateDeckDto {
    title?: string;
    description?: string;
    shuffleCards?: boolean;
    isPublished?: boolean;
}
export declare class CreateCardDto {
    front: string;
    back: string;
    hint?: string;
    imageUrl?: string;
    orderIndex?: number;
}
export declare class UpdateCardDto {
    front?: string;
    back?: string;
    hint?: string;
    imageUrl?: string;
    orderIndex?: number;
}
export declare class CompleteSessionDto {
    knownCards: number;
    timeSpentSecs?: number;
}
