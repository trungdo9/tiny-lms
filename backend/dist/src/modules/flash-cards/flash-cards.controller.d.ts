import { FlashCardsService } from './flash-cards.service';
import { CreateDeckDto, UpdateDeckDto, CreateCardDto, UpdateCardDto, CompleteSessionDto } from './dto/flash-card.dto';
export declare class LessonFlashCardsController {
    private service;
    constructor(service: FlashCardsService);
    findByLesson(lessonId: string): Promise<({
        cards: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderIndex: number;
            front: string;
            back: string;
            hint: string | null;
            imageUrl: string | null;
            deckId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        isPublished: boolean;
        activityId: string;
        shuffleCards: boolean;
    }) | null>;
    create(req: any, lessonId: string, dto: CreateDeckDto): Promise<{
        cards: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderIndex: number;
            front: string;
            back: string;
            hint: string | null;
            imageUrl: string | null;
            deckId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        isPublished: boolean;
        activityId: string;
        shuffleCards: boolean;
    }>;
    update(req: any, lessonId: string, dto: UpdateDeckDto): Promise<{
        cards: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderIndex: number;
            front: string;
            back: string;
            hint: string | null;
            imageUrl: string | null;
            deckId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        isPublished: boolean;
        activityId: string;
        shuffleCards: boolean;
    }>;
    delete(req: any, lessonId: string): Promise<{
        success: boolean;
    }>;
}
export declare class FlashCardsController {
    private service;
    constructor(service: FlashCardsService);
    findAll(req: any): Promise<{
        id: string;
        title: string;
        description: string | null;
        is_published: boolean;
        card_count: number;
        lesson_title: string;
        lesson_id: string;
        course_id: string;
        created_at: Date;
    }[]>;
    getCards(deckId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderIndex: number;
        front: string;
        back: string;
        hint: string | null;
        imageUrl: string | null;
        deckId: string;
    }[]>;
    addCard(req: any, deckId: string, dto: CreateCardDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderIndex: number;
        front: string;
        back: string;
        hint: string | null;
        imageUrl: string | null;
        deckId: string;
    }>;
    updateCard(req: any, cardId: string, dto: UpdateCardDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderIndex: number;
        front: string;
        back: string;
        hint: string | null;
        imageUrl: string | null;
        deckId: string;
    }>;
    deleteCard(req: any, cardId: string): Promise<{
        success: boolean;
    }>;
    reorderCards(req: any, deckId: string, body: {
        cardIds: string[];
    }): Promise<{
        success: boolean;
    }>;
    startSession(req: any, deckId: string): Promise<{
        sessionId: string;
        totalCards: number;
        cards: {
            id: string;
            front: string;
            hint: string | null;
        }[];
    }>;
    getHistory(req: any, deckId: string): Promise<{
        id: string;
        createdAt: Date;
        deckId: string;
        completedAt: Date | null;
        userId: string;
        timeSpentSecs: number | null;
        knownCards: number;
        totalCards: number;
        unknownCards: number;
    }[]>;
}
export declare class FlashCardsSessionController {
    private service;
    constructor(service: FlashCardsService);
    complete(req: any, sessionId: string, dto: CompleteSessionDto): Promise<{
        id: string;
        createdAt: Date;
        deckId: string;
        completedAt: Date | null;
        userId: string;
        timeSpentSecs: number | null;
        knownCards: number;
        totalCards: number;
        unknownCards: number;
    }>;
}
