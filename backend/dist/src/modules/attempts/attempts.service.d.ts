import { PrismaService } from '../../common/prisma.service';
import { SaveAnswerDto } from './dto/attempt.dto';
export declare class AttemptsService {
    private prisma;
    constructor(prisma: PrismaService);
    start(quizId: string, userId: string): Promise<{
        attemptQuestions: {
            question: {
                options: any[];
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
            };
            id: string;
            orderIndex: number;
            questionId: string;
            optionsOrder: string[];
            pageNumber: number;
            score: import("@prisma/client-runtime-utils").Decimal | null;
            isFlagged: boolean;
            attemptId: string;
        }[];
        quiz: {
            questions: ({
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
        };
        answers: {
            id: string;
            isCorrect: boolean | null;
            questionId: string;
            attemptId: string;
            selectedOptions: string[];
            textAnswer: string | null;
            orderAnswer: string[];
            matchAnswer: import("@prisma/client/runtime/client").JsonValue | null;
            scoreEarned: import("@prisma/client-runtime-utils").Decimal | null;
            savedAt: Date;
            attemptQuestionId: string;
        }[];
        id: string;
        createdAt: Date;
        status: string;
        quizId: string;
        userId: string;
        attemptNumber: number;
        currentPage: number;
        startedAt: Date;
        submittedAt: Date | null;
        expiresAt: Date | null;
        timeSpentSecs: number | null;
        totalScore: import("@prisma/client-runtime-utils").Decimal | null;
        maxScore: import("@prisma/client-runtime-utils").Decimal | null;
        percentage: import("@prisma/client-runtime-utils").Decimal | null;
        isPassed: boolean | null;
    }>;
    getAttempt(id: string, userId: string): Promise<{
        attemptQuestions: {
            question: {
                options: any[];
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
            };
            id: string;
            orderIndex: number;
            questionId: string;
            optionsOrder: string[];
            pageNumber: number;
            score: import("@prisma/client-runtime-utils").Decimal | null;
            isFlagged: boolean;
            attemptId: string;
        }[];
        quiz: {
            questions: ({
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
        };
        answers: {
            id: string;
            isCorrect: boolean | null;
            questionId: string;
            attemptId: string;
            selectedOptions: string[];
            textAnswer: string | null;
            orderAnswer: string[];
            matchAnswer: import("@prisma/client/runtime/client").JsonValue | null;
            scoreEarned: import("@prisma/client-runtime-utils").Decimal | null;
            savedAt: Date;
            attemptQuestionId: string;
        }[];
        id: string;
        createdAt: Date;
        status: string;
        quizId: string;
        userId: string;
        attemptNumber: number;
        currentPage: number;
        startedAt: Date;
        submittedAt: Date | null;
        expiresAt: Date | null;
        timeSpentSecs: number | null;
        totalScore: import("@prisma/client-runtime-utils").Decimal | null;
        maxScore: import("@prisma/client-runtime-utils").Decimal | null;
        percentage: import("@prisma/client-runtime-utils").Decimal | null;
        isPassed: boolean | null;
    }>;
    getPage(attemptId: string, page: number, userId: string): Promise<{
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
                explanation: string | null | undefined;
                options: {
                    id: any;
                    content: any;
                    isCorrect: any;
                }[];
            };
            answer: {
                id: string;
                isCorrect: boolean | null;
                questionId: string;
                attemptId: string;
                selectedOptions: string[];
                textAnswer: string | null;
                orderAnswer: string[];
                matchAnswer: import("@prisma/client/runtime/client").JsonValue | null;
                scoreEarned: import("@prisma/client-runtime-utils").Decimal | null;
                savedAt: Date;
                attemptQuestionId: string;
            } | undefined;
        }[];
    }>;
    saveAnswer(attemptId: string, userId: string, dto: SaveAnswerDto): Promise<{
        id: string;
        isCorrect: boolean | null;
        questionId: string;
        attemptId: string;
        selectedOptions: string[];
        textAnswer: string | null;
        orderAnswer: string[];
        matchAnswer: import("@prisma/client/runtime/client").JsonValue | null;
        scoreEarned: import("@prisma/client-runtime-utils").Decimal | null;
        savedAt: Date;
        attemptQuestionId: string;
    }>;
    submit(attemptId: string, userId: string): Promise<{
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
            };
        } & {
            id: string;
            orderIndex: number;
            questionId: string;
            optionsOrder: string[];
            pageNumber: number;
            score: import("@prisma/client-runtime-utils").Decimal | null;
            isFlagged: boolean;
            attemptId: string;
        })[];
        answers: {
            id: string;
            isCorrect: boolean | null;
            questionId: string;
            attemptId: string;
            selectedOptions: string[];
            textAnswer: string | null;
            orderAnswer: string[];
            matchAnswer: import("@prisma/client/runtime/client").JsonValue | null;
            scoreEarned: import("@prisma/client-runtime-utils").Decimal | null;
            savedAt: Date;
            attemptQuestionId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        status: string;
        quizId: string;
        userId: string;
        attemptNumber: number;
        currentPage: number;
        startedAt: Date;
        submittedAt: Date | null;
        expiresAt: Date | null;
        timeSpentSecs: number | null;
        totalScore: import("@prisma/client-runtime-utils").Decimal | null;
        maxScore: import("@prisma/client-runtime-utils").Decimal | null;
        percentage: import("@prisma/client-runtime-utils").Decimal | null;
        isPassed: boolean | null;
    }>;
    getResult(attemptId: string, userId: string): Promise<{
        attemptQuestions: {
            question: {
                options: any[];
                explanation: string | null | undefined;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                type: string;
                content: string;
                mediaUrl: string | null;
                mediaType: string | null;
                difficulty: string;
                defaultScore: import("@prisma/client-runtime-utils").Decimal;
                tags: string[];
                bankId: string;
            };
            id: string;
            orderIndex: number;
            questionId: string;
            optionsOrder: string[];
            pageNumber: number;
            score: import("@prisma/client-runtime-utils").Decimal | null;
            isFlagged: boolean;
            attemptId: string;
        }[];
        quiz: {
            questions: ({
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
        };
        answers: {
            id: string;
            isCorrect: boolean | null;
            questionId: string;
            attemptId: string;
            selectedOptions: string[];
            textAnswer: string | null;
            orderAnswer: string[];
            matchAnswer: import("@prisma/client/runtime/client").JsonValue | null;
            scoreEarned: import("@prisma/client-runtime-utils").Decimal | null;
            savedAt: Date;
            attemptQuestionId: string;
        }[];
        id: string;
        createdAt: Date;
        status: string;
        quizId: string;
        userId: string;
        attemptNumber: number;
        currentPage: number;
        startedAt: Date;
        submittedAt: Date | null;
        expiresAt: Date | null;
        timeSpentSecs: number | null;
        totalScore: import("@prisma/client-runtime-utils").Decimal | null;
        maxScore: import("@prisma/client-runtime-utils").Decimal | null;
        percentage: import("@prisma/client-runtime-utils").Decimal | null;
        isPassed: boolean | null;
    }>;
    getUserAttempts(quizId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        quizId: string;
        userId: string;
        attemptNumber: number;
        currentPage: number;
        startedAt: Date;
        submittedAt: Date | null;
        expiresAt: Date | null;
        timeSpentSecs: number | null;
        totalScore: import("@prisma/client-runtime-utils").Decimal | null;
        maxScore: import("@prisma/client-runtime-utils").Decimal | null;
        percentage: import("@prisma/client-runtime-utils").Decimal | null;
        isPassed: boolean | null;
    }[]>;
    toggleFlag(attemptId: string, questionId: string, userId: string): Promise<{
        id: string;
        orderIndex: number;
        questionId: string;
        optionsOrder: string[];
        pageNumber: number;
        score: import("@prisma/client-runtime-utils").Decimal | null;
        isFlagged: boolean;
        attemptId: string;
    }>;
    getAllQuestions(attemptId: string, userId: string): Promise<{
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
