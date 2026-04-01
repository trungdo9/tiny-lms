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
            title: string;
            isPublished: boolean;
            createdAt: Date;
            updatedAt: Date;
            courseId: string;
            sectionId: string;
            activityId: string;
            description: string | null;
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
            availableFrom: Date | null;
            availableUntil: Date | null;
            showLeaderboard: boolean;
        }) | null;
        flashCardDeck: ({
            _count: {
                cards: number;
            };
        } & {
            id: string;
            title: string;
            isPublished: boolean;
            createdAt: Date;
            updatedAt: Date;
            activityId: string;
            description: string | null;
            shuffleCards: boolean;
        }) | null;
    } & {
        id: string;
        lessonId: string;
        activityType: string;
        title: string;
        orderIndex: number;
        isPublished: boolean;
        contentUrl: string | null;
        contentType: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    create(req: any, lessonId: string, dto: CreateActivityDto): Promise<{
        quiz: {
            id: string;
            title: string;
            isPublished: boolean;
            createdAt: Date;
            updatedAt: Date;
            courseId: string;
            sectionId: string;
            activityId: string;
            description: string | null;
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
            availableFrom: Date | null;
            availableUntil: Date | null;
            showLeaderboard: boolean;
        } | null;
        flashCardDeck: {
            id: string;
            title: string;
            isPublished: boolean;
            createdAt: Date;
            updatedAt: Date;
            activityId: string;
            description: string | null;
            shuffleCards: boolean;
        } | null;
    } & {
        id: string;
        lessonId: string;
        activityType: string;
        title: string;
        orderIndex: number;
        isPublished: boolean;
        contentUrl: string | null;
        contentType: string | null;
        createdAt: Date;
        updatedAt: Date;
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
                quizId: string;
                questionId: string | null;
                bankId: string | null;
                pickCount: number | null;
                difficultyFilter: string | null;
                tagFilter: string[];
                scoreOverride: import("@prisma/client-runtime-utils").Decimal | null;
            }[];
            _count: {
                attempts: number;
            };
        } & {
            id: string;
            title: string;
            isPublished: boolean;
            createdAt: Date;
            updatedAt: Date;
            courseId: string;
            sectionId: string;
            activityId: string;
            description: string | null;
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
            availableFrom: Date | null;
            availableUntil: Date | null;
            showLeaderboard: boolean;
        }) | null;
        flashCardDeck: ({
            cards: {
                id: string;
                orderIndex: number;
                createdAt: Date;
                updatedAt: Date;
                deckId: string;
                front: string;
                back: string;
                hint: string | null;
                imageUrl: string | null;
            }[];
            _count: {
                studySessions: number;
            };
        } & {
            id: string;
            title: string;
            isPublished: boolean;
            createdAt: Date;
            updatedAt: Date;
            activityId: string;
            description: string | null;
            shuffleCards: boolean;
        }) | null;
    } & {
        id: string;
        lessonId: string;
        activityType: string;
        title: string;
        orderIndex: number;
        isPublished: boolean;
        contentUrl: string | null;
        contentType: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(req: any, id: string, dto: UpdateActivityDto): Promise<{
        quiz: {
            id: string;
            title: string;
            isPublished: boolean;
            createdAt: Date;
            updatedAt: Date;
            courseId: string;
            sectionId: string;
            activityId: string;
            description: string | null;
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
            availableFrom: Date | null;
            availableUntil: Date | null;
            showLeaderboard: boolean;
        } | null;
        flashCardDeck: {
            id: string;
            title: string;
            isPublished: boolean;
            createdAt: Date;
            updatedAt: Date;
            activityId: string;
            description: string | null;
            shuffleCards: boolean;
        } | null;
    } & {
        id: string;
        lessonId: string;
        activityType: string;
        title: string;
        orderIndex: number;
        isPublished: boolean;
        contentUrl: string | null;
        contentType: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
