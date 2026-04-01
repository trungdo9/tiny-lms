import { AttemptsService } from './attempts.service';
import { SaveAnswerDto } from './dto/attempt.dto';
export declare class AttemptsController {
    private service;
    constructor(service: AttemptsService);
    start(quizId: string, req: any): Promise<{
        attemptQuestions: {
            question: {
                options: any[];
                id: string;
                createdAt: Date;
                updatedAt: Date;
                bankId: string;
                type: string;
                content: string;
                explanation: string | null;
                mediaUrl: string | null;
                mediaType: string | null;
                difficulty: string;
                defaultScore: import("@prisma/client-runtime-utils").Decimal;
                tags: string[];
            };
            id: string;
            orderIndex: number;
            attemptId: string;
            questionId: string;
            optionsOrder: string[];
            pageNumber: number;
            score: import("@prisma/client-runtime-utils").Decimal | null;
            isFlagged: boolean;
        }[];
        quiz: {
            questions: ({
                question: ({
                    options: {
                        id: string;
                        createdAt: Date;
                        orderIndex: number | null;
                        questionId: string;
                        content: string;
                        isCorrect: boolean;
                        matchKey: string | null;
                        matchValue: string | null;
                    }[];
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    bankId: string;
                    type: string;
                    content: string;
                    explanation: string | null;
                    mediaUrl: string | null;
                    mediaType: string | null;
                    difficulty: string;
                    defaultScore: import("@prisma/client-runtime-utils").Decimal;
                    tags: string[];
                }) | null;
            } & {
                id: string;
                quizId: string;
                orderIndex: number;
                questionId: string | null;
                bankId: string | null;
                pickCount: number | null;
                difficultyFilter: string | null;
                tagFilter: string[];
                scoreOverride: import("@prisma/client-runtime-utils").Decimal | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            activityId: string;
            courseId: string;
            sectionId: string;
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
            updatedAt: Date;
        };
        answers: {
            id: string;
            attemptId: string;
            questionId: string;
            isCorrect: boolean | null;
            attemptQuestionId: string;
            selectedOptions: string[];
            textAnswer: string | null;
            orderAnswer: string[];
            matchAnswer: import("@prisma/client/runtime/client").JsonValue | null;
            scoreEarned: import("@prisma/client-runtime-utils").Decimal | null;
            savedAt: Date;
        }[];
        id: string;
        attemptNumber: number;
        status: string;
        currentPage: number;
        startedAt: Date;
        submittedAt: Date | null;
        expiresAt: Date | null;
        timeSpentSecs: number | null;
        totalScore: import("@prisma/client-runtime-utils").Decimal | null;
        maxScore: import("@prisma/client-runtime-utils").Decimal | null;
        percentage: import("@prisma/client-runtime-utils").Decimal | null;
        isPassed: boolean | null;
        createdAt: Date;
        quizId: string;
        userId: string;
    }>;
    getAttempt(id: string, req: any): Promise<{
        attemptQuestions: {
            question: {
                options: any[];
                id: string;
                createdAt: Date;
                updatedAt: Date;
                bankId: string;
                type: string;
                content: string;
                explanation: string | null;
                mediaUrl: string | null;
                mediaType: string | null;
                difficulty: string;
                defaultScore: import("@prisma/client-runtime-utils").Decimal;
                tags: string[];
            };
            id: string;
            orderIndex: number;
            attemptId: string;
            questionId: string;
            optionsOrder: string[];
            pageNumber: number;
            score: import("@prisma/client-runtime-utils").Decimal | null;
            isFlagged: boolean;
        }[];
        quiz: {
            questions: ({
                question: ({
                    options: {
                        id: string;
                        createdAt: Date;
                        orderIndex: number | null;
                        questionId: string;
                        content: string;
                        isCorrect: boolean;
                        matchKey: string | null;
                        matchValue: string | null;
                    }[];
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    bankId: string;
                    type: string;
                    content: string;
                    explanation: string | null;
                    mediaUrl: string | null;
                    mediaType: string | null;
                    difficulty: string;
                    defaultScore: import("@prisma/client-runtime-utils").Decimal;
                    tags: string[];
                }) | null;
            } & {
                id: string;
                quizId: string;
                orderIndex: number;
                questionId: string | null;
                bankId: string | null;
                pickCount: number | null;
                difficultyFilter: string | null;
                tagFilter: string[];
                scoreOverride: import("@prisma/client-runtime-utils").Decimal | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            activityId: string;
            courseId: string;
            sectionId: string;
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
            updatedAt: Date;
        };
        answers: {
            id: string;
            attemptId: string;
            questionId: string;
            isCorrect: boolean | null;
            attemptQuestionId: string;
            selectedOptions: string[];
            textAnswer: string | null;
            orderAnswer: string[];
            matchAnswer: import("@prisma/client/runtime/client").JsonValue | null;
            scoreEarned: import("@prisma/client-runtime-utils").Decimal | null;
            savedAt: Date;
        }[];
        id: string;
        attemptNumber: number;
        status: string;
        currentPage: number;
        startedAt: Date;
        submittedAt: Date | null;
        expiresAt: Date | null;
        timeSpentSecs: number | null;
        totalScore: import("@prisma/client-runtime-utils").Decimal | null;
        maxScore: import("@prisma/client-runtime-utils").Decimal | null;
        percentage: import("@prisma/client-runtime-utils").Decimal | null;
        isPassed: boolean | null;
        createdAt: Date;
        quizId: string;
        userId: string;
    }>;
    getPage(id: string, page: number, req: any): Promise<{
        attempt: {
            id: string;
            status: string;
            currentPage: number;
            totalPages: number;
            expiresAt: Date | null;
            quiz: {
                title: string;
                timeLimitMinutes: number | null;
                paginationMode: string;
                allowBackNavigation: boolean;
                showCorrectAnswer: boolean;
                showExplanation: boolean;
            };
        };
        questions: {
            id: string;
            questionId: string;
            orderIndex: number;
            isFlagged: boolean;
            isAnswered: boolean;
            question: {
                content: string;
                type: string;
                mediaUrl: string | null;
                explanation: string | null | undefined;
                options: ({
                    id: any;
                    content: any;
                    orderIndex: any;
                    matchValue?: undefined;
                    matchKey?: undefined;
                    isCorrect?: undefined;
                } | {
                    id: any;
                    content: any;
                    orderIndex: any;
                    matchValue: any;
                    matchKey?: undefined;
                    isCorrect?: undefined;
                } | {
                    id: any;
                    content: any;
                    orderIndex: any;
                    matchKey: any;
                    matchValue: any;
                    isCorrect: any;
                })[];
            };
            answer: {
                id: string;
                attemptId: string;
                questionId: string;
                isCorrect: boolean | null;
                attemptQuestionId: string;
                selectedOptions: string[];
                textAnswer: string | null;
                orderAnswer: string[];
                matchAnswer: import("@prisma/client/runtime/client").JsonValue | null;
                scoreEarned: import("@prisma/client-runtime-utils").Decimal | null;
                savedAt: Date;
            } | undefined;
        }[];
    }>;
    saveAnswer(id: string, req: any, dto: SaveAnswerDto): Promise<{
        id: string;
        attemptId: string;
        questionId: string;
        isCorrect: boolean | null;
        attemptQuestionId: string;
        selectedOptions: string[];
        textAnswer: string | null;
        orderAnswer: string[];
        matchAnswer: import("@prisma/client/runtime/client").JsonValue | null;
        scoreEarned: import("@prisma/client-runtime-utils").Decimal | null;
        savedAt: Date;
    }>;
    submit(id: string, req: any): Promise<{
        quiz: {
            id: string;
            title: string;
            showResult: string;
            showCorrectAnswer: boolean;
            showExplanation: boolean;
        };
        attemptQuestions: ({
            question: {
                options: {
                    id: string;
                    createdAt: Date;
                    orderIndex: number | null;
                    questionId: string;
                    content: string;
                    isCorrect: boolean;
                    matchKey: string | null;
                    matchValue: string | null;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                bankId: string;
                type: string;
                content: string;
                explanation: string | null;
                mediaUrl: string | null;
                mediaType: string | null;
                difficulty: string;
                defaultScore: import("@prisma/client-runtime-utils").Decimal;
                tags: string[];
            };
        } & {
            id: string;
            orderIndex: number;
            attemptId: string;
            questionId: string;
            optionsOrder: string[];
            pageNumber: number;
            score: import("@prisma/client-runtime-utils").Decimal | null;
            isFlagged: boolean;
        })[];
        answers: {
            id: string;
            attemptId: string;
            questionId: string;
            isCorrect: boolean | null;
            attemptQuestionId: string;
            selectedOptions: string[];
            textAnswer: string | null;
            orderAnswer: string[];
            matchAnswer: import("@prisma/client/runtime/client").JsonValue | null;
            scoreEarned: import("@prisma/client-runtime-utils").Decimal | null;
            savedAt: Date;
        }[];
    } & {
        id: string;
        attemptNumber: number;
        status: string;
        currentPage: number;
        startedAt: Date;
        submittedAt: Date | null;
        expiresAt: Date | null;
        timeSpentSecs: number | null;
        totalScore: import("@prisma/client-runtime-utils").Decimal | null;
        maxScore: import("@prisma/client-runtime-utils").Decimal | null;
        percentage: import("@prisma/client-runtime-utils").Decimal | null;
        isPassed: boolean | null;
        createdAt: Date;
        quizId: string;
        userId: string;
    }>;
    getResult(id: string, req: any): Promise<{
        attemptQuestions: {
            question: {
                options: any[];
                explanation: string | null | undefined;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                bankId: string;
                type: string;
                content: string;
                mediaUrl: string | null;
                mediaType: string | null;
                difficulty: string;
                defaultScore: import("@prisma/client-runtime-utils").Decimal;
                tags: string[];
            };
            id: string;
            orderIndex: number;
            attemptId: string;
            questionId: string;
            optionsOrder: string[];
            pageNumber: number;
            score: import("@prisma/client-runtime-utils").Decimal | null;
            isFlagged: boolean;
        }[];
        quiz: {
            questions: ({
                question: ({
                    options: {
                        id: string;
                        createdAt: Date;
                        orderIndex: number | null;
                        questionId: string;
                        content: string;
                        isCorrect: boolean;
                        matchKey: string | null;
                        matchValue: string | null;
                    }[];
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    bankId: string;
                    type: string;
                    content: string;
                    explanation: string | null;
                    mediaUrl: string | null;
                    mediaType: string | null;
                    difficulty: string;
                    defaultScore: import("@prisma/client-runtime-utils").Decimal;
                    tags: string[];
                }) | null;
            } & {
                id: string;
                quizId: string;
                orderIndex: number;
                questionId: string | null;
                bankId: string | null;
                pickCount: number | null;
                difficultyFilter: string | null;
                tagFilter: string[];
                scoreOverride: import("@prisma/client-runtime-utils").Decimal | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            activityId: string;
            courseId: string;
            sectionId: string;
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
            updatedAt: Date;
        };
        answers: {
            id: string;
            attemptId: string;
            questionId: string;
            isCorrect: boolean | null;
            attemptQuestionId: string;
            selectedOptions: string[];
            textAnswer: string | null;
            orderAnswer: string[];
            matchAnswer: import("@prisma/client/runtime/client").JsonValue | null;
            scoreEarned: import("@prisma/client-runtime-utils").Decimal | null;
            savedAt: Date;
        }[];
        id: string;
        attemptNumber: number;
        status: string;
        currentPage: number;
        startedAt: Date;
        submittedAt: Date | null;
        expiresAt: Date | null;
        timeSpentSecs: number | null;
        totalScore: import("@prisma/client-runtime-utils").Decimal | null;
        maxScore: import("@prisma/client-runtime-utils").Decimal | null;
        percentage: import("@prisma/client-runtime-utils").Decimal | null;
        isPassed: boolean | null;
        createdAt: Date;
        quizId: string;
        userId: string;
    }>;
    getUserAttempts(quizId: string, req: any): Promise<{
        id: string;
        attemptNumber: number;
        status: string;
        currentPage: number;
        startedAt: Date;
        submittedAt: Date | null;
        expiresAt: Date | null;
        timeSpentSecs: number | null;
        totalScore: import("@prisma/client-runtime-utils").Decimal | null;
        maxScore: import("@prisma/client-runtime-utils").Decimal | null;
        percentage: import("@prisma/client-runtime-utils").Decimal | null;
        isPassed: boolean | null;
        createdAt: Date;
        quizId: string;
        userId: string;
    }[]>;
    toggleFlag(id: string, questionId: string, req: any): Promise<{
        id: string;
        orderIndex: number;
        attemptId: string;
        questionId: string;
        optionsOrder: string[];
        pageNumber: number;
        score: import("@prisma/client-runtime-utils").Decimal | null;
        isFlagged: boolean;
    }>;
    getAllQuestions(id: string, req: any): Promise<{
        id: string;
        questionId: string;
        orderIndex: number;
        pageNumber: number;
        isFlagged: boolean;
        isAnswered: boolean;
        question: {
            id: string;
            type: string;
            content: string;
        };
    }[]>;
}
