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
        title: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        sectionId: string;
        isPublished: boolean;
        availableFrom: Date | null;
        activityId: string;
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
        title: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        sectionId: string;
        isPublished: boolean;
        availableFrom: Date | null;
        activityId: string;
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
        _count: {
            attempts: number;
        };
        questions: ({
            question: ({
                options: {
                    id: string;
                    createdAt: Date;
                    orderIndex: number | null;
                    content: string;
                    questionId: string;
                    isCorrect: boolean;
                    matchKey: string | null;
                    matchValue: string | null;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                type: string;
                content: string;
                bankId: string;
                explanation: string | null;
                mediaUrl: string | null;
                mediaType: string | null;
                difficulty: string;
                defaultScore: Prisma.Decimal;
                tags: string[];
            }) | null;
            bank: {
                id: string;
                title: string;
            } | null;
        } & {
            id: string;
            orderIndex: number;
            quizId: string;
            questionId: string | null;
            bankId: string | null;
            pickCount: number | null;
            difficultyFilter: string | null;
            tagFilter: string[];
            scoreOverride: Prisma.Decimal | null;
        })[];
    } & {
        id: string;
        title: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        sectionId: string;
        isPublished: boolean;
        availableFrom: Date | null;
        activityId: string;
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
        _count: {
            attempts: number;
        };
        questions: ({
            question: ({
                options: {
                    id: string;
                    createdAt: Date;
                    orderIndex: number | null;
                    content: string;
                    questionId: string;
                    isCorrect: boolean;
                    matchKey: string | null;
                    matchValue: string | null;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                type: string;
                content: string;
                bankId: string;
                explanation: string | null;
                mediaUrl: string | null;
                mediaType: string | null;
                difficulty: string;
                defaultScore: Prisma.Decimal;
                tags: string[];
            }) | null;
            bank: {
                id: string;
                title: string;
            } | null;
        } & {
            id: string;
            orderIndex: number;
            quizId: string;
            questionId: string | null;
            bankId: string | null;
            pickCount: number | null;
            difficultyFilter: string | null;
            tagFilter: string[];
            scoreOverride: Prisma.Decimal | null;
        })[];
    } & {
        id: string;
        title: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        sectionId: string;
        isPublished: boolean;
        availableFrom: Date | null;
        activityId: string;
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
    }>;
    update(id: string, userId: string, dto: UpdateQuizDto, userRole?: string): Promise<{
        _count: {
            questions: number;
        };
    } & {
        id: string;
        title: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        sectionId: string;
        isPublished: boolean;
        availableFrom: Date | null;
        activityId: string;
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
        title: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        sectionId: string;
        isPublished: boolean;
        availableFrom: Date | null;
        activityId: string;
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
    }>;
    addQuestion(id: string, userId: string, dto: AddQuizQuestionDto, userRole?: string): Promise<{
        question: {
            id: string;
            type: string;
            content: string;
        } | null;
        bank: {
            id: string;
            title: string;
        } | null;
    } & {
        id: string;
        orderIndex: number;
        quizId: string;
        questionId: string | null;
        bankId: string | null;
        pickCount: number | null;
        difficultyFilter: string | null;
        tagFilter: string[];
        scoreOverride: Prisma.Decimal | null;
    }>;
    removeQuestion(quizId: string, quizQuestionId: string, userId: string, userRole?: string): Promise<{
        success: boolean;
    }>;
    getQuestions(quizId: string): Promise<({
        question: ({
            options: {
                id: string;
                createdAt: Date;
                orderIndex: number | null;
                content: string;
                questionId: string;
                isCorrect: boolean;
                matchKey: string | null;
                matchValue: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            content: string;
            bankId: string;
            explanation: string | null;
            mediaUrl: string | null;
            mediaType: string | null;
            difficulty: string;
            defaultScore: Prisma.Decimal;
            tags: string[];
        }) | null;
        bank: {
            id: string;
            title: string;
        } | null;
    } & {
        id: string;
        orderIndex: number;
        quizId: string;
        questionId: string | null;
        bankId: string | null;
        pickCount: number | null;
        difficultyFilter: string | null;
        tagFilter: string[];
        scoreOverride: Prisma.Decimal | null;
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
