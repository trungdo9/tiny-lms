import { ActivitiesService } from './activities.service';
import { CreateActivityDto, UpdateActivityDto, ReorderActivitiesDto } from './dto/activity.dto';
export declare class LessonActivitiesController {
    private service;
    constructor(service: ActivitiesService);
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
    create(req: any, lessonId: string, dto: CreateActivityDto): Promise<{
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
    reorder(req: any, lessonId: string, body: ReorderActivitiesDto): Promise<{
        success: boolean;
    }>;
}
export declare class ActivitiesController {
    private service;
    constructor(service: ActivitiesService);
    findById(id: string): Promise<{
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
    update(req: any, id: string, dto: UpdateActivityDto): Promise<{
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
    delete(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
