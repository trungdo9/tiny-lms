import { PrismaService } from '../../common/prisma.service';
import { CreateDeckDto, UpdateDeckDto, CreateCardDto, UpdateCardDto, CompleteSessionDto } from './dto/flash-card.dto';
export declare class FlashCardsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findById(deckId: string): Promise<{
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
    findAllByInstructor(userId: string, userRole?: string): Promise<{
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
    createDeck(userId: string, lessonId: string, dto: CreateDeckDto, userRole?: string): Promise<{
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
    updateDeck(userId: string, lessonId: string, dto: UpdateDeckDto, userRole?: string): Promise<{
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
    deleteDeck(userId: string, lessonId: string, userRole?: string): Promise<{
        success: boolean;
    }>;
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
    createCard(userId: string, deckId: string, dto: CreateCardDto, userRole?: string): Promise<{
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
    updateCard(userId: string, cardId: string, dto: UpdateCardDto, userRole?: string): Promise<{
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
    deleteCard(userId: string, cardId: string, userRole?: string): Promise<{
        success: boolean;
    }>;
    reorderCards(userId: string, deckId: string, cardIds: string[], userRole?: string): Promise<{
        success: boolean;
    }>;
    startSession(userId: string, deckId: string): Promise<{
        sessionId: string;
        totalCards: number;
        cards: {
            id: string;
            front: string;
            hint: string | null;
        }[];
    }>;
    completeSession(userId: string, sessionId: string, dto: CompleteSessionDto): Promise<{
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
    getHistory(userId: string, deckId: string): Promise<{
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
