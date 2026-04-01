import { PrismaService } from '../../common/prisma.service';
import { CoursesService } from '../courses/courses.service';
import { CreateActivityDto, UpdateActivityDto } from './dto/activity.dto';
export declare class ActivitiesService {
    private prisma;
    private coursesService;
    constructor(prisma: PrismaService, coursesService: CoursesService);
    create(userId: string, lessonId: string, dto: CreateActivityDto, userRole?: string): Promise<{
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
        activityType: string;
        title: string;
        orderIndex: number;
        isPublished: boolean;
        contentUrl: string | null;
        contentType: string | null;
        createdAt: Date;
        updatedAt: Date;
        lessonId: string;
    }>;
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
        activityType: string;
        title: string;
        orderIndex: number;
        isPublished: boolean;
        contentUrl: string | null;
        contentType: string | null;
        createdAt: Date;
        updatedAt: Date;
        lessonId: string;
    })[]>;
    findById(activityId: string): Promise<{
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
        activityType: string;
        title: string;
        orderIndex: number;
        isPublished: boolean;
        contentUrl: string | null;
        contentType: string | null;
        createdAt: Date;
        updatedAt: Date;
        lessonId: string;
    }>;
    update(userId: string, activityId: string, dto: UpdateActivityDto, userRole?: string): Promise<{
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
        activityType: string;
        title: string;
        orderIndex: number;
        isPublished: boolean;
        contentUrl: string | null;
        contentType: string | null;
        createdAt: Date;
        updatedAt: Date;
        lessonId: string;
    }>;
    delete(userId: string, activityId: string, userRole?: string): Promise<{
        success: boolean;
    }>;
    reorder(userId: string, lessonId: string, activityIds: string[], userRole?: string): Promise<{
        success: boolean;
    }>;
}
