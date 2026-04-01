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
        courseId: string;
        sectionId: string;
        activityId: string;
        title: string;
        description: string | null;
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
        isPublished: boolean;
        availableFrom: Date | null;
        availableUntil: Date | null;
        showLeaderboard: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findMine(userId: string, search?: string): Promise<({
        course: {
            id: string;
            title: string;
        };
        _count: {
            questions: number;
        };
    } & {
        id: string;
        courseId: string;
        sectionId: string;
        activityId: string;
        title: string;
        description: string | null;
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
        isPublished: boolean;
        availableFrom: Date | null;
        availableUntil: Date | null;
        showLeaderboard: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
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
        courseId: string;
        sectionId: string;
        activityId: string;
        title: string;
        description: string | null;
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
        isPublished: boolean;
        availableFrom: Date | null;
        availableUntil: Date | null;
        showLeaderboard: boolean;
        createdAt: Date;
        updatedAt: Date;
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
            question: ({
                options: {
                    id: string;
                    createdAt: Date;
                    content: string;
                    orderIndex: number | null;
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
        _count: {
            attempts: number;
        };
    } & {
        id: string;
        courseId: string;
        sectionId: string;
        activityId: string;
        title: string;
        description: string | null;
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
        isPublished: boolean;
        availableFrom: Date | null;
        availableUntil: Date | null;
        showLeaderboard: boolean;
        createdAt: Date;
        updatedAt: Date;
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
            question: ({
                options: {
                    id: string;
                    createdAt: Date;
                    content: string;
                    orderIndex: number | null;
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
        _count: {
            attempts: number;
        };
    } & {
        id: string;
        courseId: string;
        sectionId: string;
        activityId: string;
        title: string;
        description: string | null;
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
        isPublished: boolean;
        availableFrom: Date | null;
        availableUntil: Date | null;
        showLeaderboard: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, userId: string, dto: UpdateQuizDto, userRole?: string): Promise<{
        _count: {
            questions: number;
        };
    } & {
        id: string;
        courseId: string;
        sectionId: string;
        activityId: string;
        title: string;
        description: string | null;
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
        isPublished: boolean;
        availableFrom: Date | null;
        availableUntil: Date | null;
        showLeaderboard: boolean;
        createdAt: Date;
        updatedAt: Date;
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
        courseId: string;
        sectionId: string;
        activityId: string;
        title: string;
        description: string | null;
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
        isPublished: boolean;
        availableFrom: Date | null;
        availableUntil: Date | null;
        showLeaderboard: boolean;
        createdAt: Date;
        updatedAt: Date;
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
                content: string;
                orderIndex: number | null;
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
