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
        courseId: string;
        sectionId: string;
        activityId: string;
        title: string;
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
        isPublished: boolean;
        availableFrom: Date | null;
        availableUntil: Date | null;
        showLeaderboard: boolean;
        createdAt: Date;
        updatedAt: Date;
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
        passScore: import("@prisma/client-runtime-utils").Decimal | null;
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
}
export declare class QuizzesController {
    private service;
    constructor(service: QuizzesService);
    findMine(req: any, search?: string): Promise<({
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
        passScore: import("@prisma/client-runtime-utils").Decimal | null;
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
        passScore: import("@prisma/client-runtime-utils").Decimal | null;
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
        passScore: import("@prisma/client-runtime-utils").Decimal | null;
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
    update(id: string, req: any, dto: UpdateQuizDto): Promise<{
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
        passScore: import("@prisma/client-runtime-utils").Decimal | null;
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
        courseId: string;
        sectionId: string;
        activityId: string;
        title: string;
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
        isPublished: boolean;
        availableFrom: Date | null;
        availableUntil: Date | null;
        showLeaderboard: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getQuestions(id: string): Promise<({
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
