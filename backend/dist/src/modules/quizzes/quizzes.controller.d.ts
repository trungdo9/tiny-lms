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
                defaultScore: import("@prisma/client-runtime-utils").Decimal;
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
            scoreOverride: import("@prisma/client-runtime-utils").Decimal | null;
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
                defaultScore: import("@prisma/client-runtime-utils").Decimal;
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
            scoreOverride: import("@prisma/client-runtime-utils").Decimal | null;
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
    }>;
    update(id: string, req: any, dto: UpdateQuizDto): Promise<{
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
    }>;
    getQuestions(id: string): Promise<({
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
            defaultScore: import("@prisma/client-runtime-utils").Decimal;
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
        scoreOverride: import("@prisma/client-runtime-utils").Decimal | null;
        quizId: string;
        questionId: string | null;
    })[]>;
    addQuestion(id: string, req: any, dto: AddQuizQuestionDto): Promise<{
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
        scoreOverride: import("@prisma/client-runtime-utils").Decimal | null;
        quizId: string;
        questionId: string | null;
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
