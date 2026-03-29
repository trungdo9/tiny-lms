import { PrismaService } from '../../common/prisma.service';
import { CreateActivityDto, UpdateActivityDto } from './dto/activity.dto';
export declare class ActivitiesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, lessonId: string, dto: CreateActivityDto): Promise<{
        quiz: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            courseId: string;
            isPublished: boolean;
            availableFrom: Date | null;
            sectionId: string;
            timeLimitMinutes: number | null;
            maxAttempts: number | null;
            passScore: import("@prisma/client-runtime-utils").Decimal | null;
            showResult: string;
            showCorrectAnswer: boolean;
            showExplanation: boolean;
            shuffleQuestions: boolean;
            shuffleAnswers: boolean;
            paginationMode: string;
            questionsPerPage: number;
            allowBackNavigation: boolean;
            availableUntil: Date | null;
            showLeaderboard: boolean;
            activityId: string;
        } | null;
        flashCardDeck: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            isPublished: boolean;
            activityId: string;
            shuffleCards: boolean;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        orderIndex: number;
        isPublished: boolean;
        activityType: string;
        contentUrl: string | null;
        contentType: string | null;
        lessonId: string;
    }>;
    findByLesson(lessonId: string): Promise<({
        quiz: ({
            _count: {
                questions: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            courseId: string;
            isPublished: boolean;
            availableFrom: Date | null;
            sectionId: string;
            timeLimitMinutes: number | null;
            maxAttempts: number | null;
            passScore: import("@prisma/client-runtime-utils").Decimal | null;
            showResult: string;
            showCorrectAnswer: boolean;
            showExplanation: boolean;
            shuffleQuestions: boolean;
            shuffleAnswers: boolean;
            paginationMode: string;
            questionsPerPage: number;
            allowBackNavigation: boolean;
            availableUntil: Date | null;
            showLeaderboard: boolean;
            activityId: string;
        }) | null;
        flashCardDeck: ({
            _count: {
                cards: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            isPublished: boolean;
            activityId: string;
            shuffleCards: boolean;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        orderIndex: number;
        isPublished: boolean;
        activityType: string;
        contentUrl: string | null;
        contentType: string | null;
        lessonId: string;
    })[]>;
    findById(activityId: string): Promise<{
        quiz: ({
            questions: {
                id: string;
                orderIndex: number;
                bankId: string | null;
                pickCount: number | null;
                difficultyFilter: string | null;
                tagFilter: string[];
                scoreOverride: import("@prisma/client-runtime-utils").Decimal | null;
                quizId: string;
                questionId: string | null;
            }[];
            _count: {
                attempts: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            courseId: string;
            isPublished: boolean;
            availableFrom: Date | null;
            sectionId: string;
            timeLimitMinutes: number | null;
            maxAttempts: number | null;
            passScore: import("@prisma/client-runtime-utils").Decimal | null;
            showResult: string;
            showCorrectAnswer: boolean;
            showExplanation: boolean;
            shuffleQuestions: boolean;
            shuffleAnswers: boolean;
            paginationMode: string;
            questionsPerPage: number;
            allowBackNavigation: boolean;
            availableUntil: Date | null;
            showLeaderboard: boolean;
            activityId: string;
        }) | null;
        flashCardDeck: ({
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
            _count: {
                studySessions: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            isPublished: boolean;
            activityId: string;
            shuffleCards: boolean;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        orderIndex: number;
        isPublished: boolean;
        activityType: string;
        contentUrl: string | null;
        contentType: string | null;
        lessonId: string;
    }>;
    update(userId: string, activityId: string, dto: UpdateActivityDto): Promise<{
        quiz: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            courseId: string;
            isPublished: boolean;
            availableFrom: Date | null;
            sectionId: string;
            timeLimitMinutes: number | null;
            maxAttempts: number | null;
            passScore: import("@prisma/client-runtime-utils").Decimal | null;
            showResult: string;
            showCorrectAnswer: boolean;
            showExplanation: boolean;
            shuffleQuestions: boolean;
            shuffleAnswers: boolean;
            paginationMode: string;
            questionsPerPage: number;
            allowBackNavigation: boolean;
            availableUntil: Date | null;
            showLeaderboard: boolean;
            activityId: string;
        } | null;
        flashCardDeck: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            isPublished: boolean;
            activityId: string;
            shuffleCards: boolean;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        orderIndex: number;
        isPublished: boolean;
        activityType: string;
        contentUrl: string | null;
        contentType: string | null;
        lessonId: string;
    }>;
    delete(userId: string, activityId: string): Promise<{
        success: boolean;
    }>;
    reorder(userId: string, lessonId: string, activityIds: string[]): Promise<{
        success: boolean;
    }>;
}
