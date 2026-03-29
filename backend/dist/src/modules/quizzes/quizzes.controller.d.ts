import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, UpdateQuizDto, AddQuizQuestionDto, CloneQuizDto } from './dto/quiz.dto';
export declare class LessonQuizzesController {
    private service;
    constructor(service: QuizzesService);
    create(req: any, lessonId: string, dto: CreateQuizDto): Promise<{
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
    }>;
    findByLesson(lessonId: string, req: any): Promise<({
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
                defaultScore: import("@prisma/client-runtime-utils").Decimal;
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
            scoreOverride: import("@prisma/client-runtime-utils").Decimal | null;
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
    }) | null>;
}
export declare class QuizzesController {
    private service;
    constructor(service: QuizzesService);
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
    })[]>;
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
                defaultScore: import("@prisma/client-runtime-utils").Decimal;
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
            scoreOverride: import("@prisma/client-runtime-utils").Decimal | null;
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
    }>;
    update(id: string, req: any, dto: UpdateQuizDto): Promise<{
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
    }>;
    delete(id: string, req: any): Promise<{
        success: boolean;
    }>;
    clone(id: string, req: any, dto: CloneQuizDto): Promise<{
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
    }>;
    getQuestions(id: string): Promise<({
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
            defaultScore: import("@prisma/client-runtime-utils").Decimal;
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
        scoreOverride: import("@prisma/client-runtime-utils").Decimal | null;
    })[]>;
    addQuestion(id: string, req: any, dto: AddQuizQuestionDto): Promise<{
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
        scoreOverride: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    removeQuestion(id: string, quizQuestionId: string, req: any): Promise<{
        success: boolean;
    }>;
    getLeaderboard(id: string, limit?: string): Promise<{
        rank: number;
        userId: string;
        userName: string;
        avatarUrl: string | null;
        score: import("@prisma/client-runtime-utils").Decimal | null;
        maxScore: import("@prisma/client-runtime-utils").Decimal | null;
        percentage: import("@prisma/client-runtime-utils").Decimal | null;
        isPassed: boolean | null;
        submittedAt: Date | null;
        timeSpentSecs: number | null;
    }[]>;
}
