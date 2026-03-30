import { PrismaService } from '../../common/prisma.service';
import { CoursesService } from '../courses/courses.service';
import { CreateQuizDto, UpdateQuizDto, AddQuizQuestionDto, CloneQuizDto } from './dto/quiz.dto';
import { Prisma } from '@prisma/client';
export declare class QuizzesService {
    private prisma;
    private coursesService;
    constructor(prisma: PrismaService, coursesService: CoursesService);
    create(userId: string, lessonId: string, dto: CreateQuizDto, userRole?: string): Promise<{
        course: {
            id: string;
            title: string;
        };
        section: {
            id: string;
            title: string;
        };
        _count: {
            questions: number;
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
        passScore: Prisma.Decimal | null;
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
    }>;
    findAll(courseId?: string, sectionId?: string): Promise<({
        course: {
            id: string;
            title: string;
        };
        section: {
            id: string;
            title: string;
        };
        _count: {
            questions: number;
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
        passScore: Prisma.Decimal | null;
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
    })[]>;
    findByLesson(lessonId: string, userId?: string, userRole?: string): Promise<({
        course: {
            id: string;
            title: string;
        };
        section: {
            id: string;
            title: string;
        };
        questions: ({
            bank: {
                id: string;
                title: string;
            } | null;
            question: ({
                options: {
                    id: string;
                    createdAt: Date;
                    orderIndex: number | null;
                    content: string;
                    isCorrect: boolean;
                    matchKey: string | null;
                    matchValue: string | null;
                    questionId: string;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                type: string;
                content: string;
                explanation: string | null;
                mediaUrl: string | null;
                mediaType: string | null;
                difficulty: string;
                defaultScore: Prisma.Decimal;
                tags: string[];
                bankId: string;
            }) | null;
        } & {
            id: string;
            orderIndex: number;
            bankId: string | null;
            pickCount: number | null;
            difficultyFilter: string | null;
            tagFilter: string[];
            scoreOverride: Prisma.Decimal | null;
            quizId: string;
            questionId: string | null;
        })[];
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
        passScore: Prisma.Decimal | null;
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
    }) | null>;
    findById(id: string): Promise<{
        course: {
            id: string;
            title: string;
        };
        section: {
            id: string;
            title: string;
        };
        questions: ({
            bank: {
                id: string;
                title: string;
            } | null;
            question: ({
                options: {
                    id: string;
                    createdAt: Date;
                    orderIndex: number | null;
                    content: string;
                    isCorrect: boolean;
                    matchKey: string | null;
                    matchValue: string | null;
                    questionId: string;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                type: string;
                content: string;
                explanation: string | null;
                mediaUrl: string | null;
                mediaType: string | null;
                difficulty: string;
                defaultScore: Prisma.Decimal;
                tags: string[];
                bankId: string;
            }) | null;
        } & {
            id: string;
            orderIndex: number;
            bankId: string | null;
            pickCount: number | null;
            difficultyFilter: string | null;
            tagFilter: string[];
            scoreOverride: Prisma.Decimal | null;
            quizId: string;
            questionId: string | null;
        })[];
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
        passScore: Prisma.Decimal | null;
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
    }>;
    update(id: string, userId: string, dto: UpdateQuizDto, userRole?: string): Promise<{
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
        passScore: Prisma.Decimal | null;
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
    }>;
    delete(id: string, userId: string, userRole?: string): Promise<{
        success: boolean;
    }>;
    clone(quizId: string, userId: string, dto: CloneQuizDto, userRole?: string): Promise<{
        course: {
            id: string;
            title: string;
        };
        section: {
            id: string;
            title: string;
        };
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
        passScore: Prisma.Decimal | null;
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
    }>;
    addQuestion(id: string, userId: string, dto: AddQuizQuestionDto, userRole?: string): Promise<{
        bank: {
            id: string;
            title: string;
        } | null;
        question: {
            id: string;
            type: string;
            content: string;
        } | null;
    } & {
        id: string;
        orderIndex: number;
        bankId: string | null;
        pickCount: number | null;
        difficultyFilter: string | null;
        tagFilter: string[];
        scoreOverride: Prisma.Decimal | null;
        quizId: string;
        questionId: string | null;
    }>;
    removeQuestion(quizId: string, quizQuestionId: string, userId: string, userRole?: string): Promise<{
        success: boolean;
    }>;
    getQuestions(quizId: string): Promise<({
        bank: {
            id: string;
            title: string;
        } | null;
        question: ({
            options: {
                id: string;
                createdAt: Date;
                orderIndex: number | null;
                content: string;
                isCorrect: boolean;
                matchKey: string | null;
                matchValue: string | null;
                questionId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            content: string;
            explanation: string | null;
            mediaUrl: string | null;
            mediaType: string | null;
            difficulty: string;
            defaultScore: Prisma.Decimal;
            tags: string[];
            bankId: string;
        }) | null;
    } & {
        id: string;
        orderIndex: number;
        bankId: string | null;
        pickCount: number | null;
        difficultyFilter: string | null;
        tagFilter: string[];
        scoreOverride: Prisma.Decimal | null;
        quizId: string;
        questionId: string | null;
    })[]>;
    getLeaderboard(id: string, limit?: number): Promise<{
        rank: number;
        userId: string;
        userName: string;
        avatarUrl: string | null;
        score: Prisma.Decimal | null;
        maxScore: Prisma.Decimal | null;
        percentage: Prisma.Decimal | null;
        isPassed: boolean | null;
        submittedAt: Date | null;
        timeSpentSecs: number | null;
    }[]>;
}
