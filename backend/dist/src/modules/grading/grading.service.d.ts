import { PrismaService } from '../../common/prisma.service';
export declare class GradingService {
    private prisma;
    constructor(prisma: PrismaService);
    getPendingGrading(instructorId: string, quizId?: string): Promise<{
        answers: ({
            question: {
                id: string;
                content: string;
                defaultScore: import("@prisma/client-runtime-utils").Decimal;
            };
        } & {
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
        })[];
        quiz: {
            id: string;
            title: string;
            courseId: string;
        };
        user: {
            id: string;
            fullName: string | null;
        };
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
    gradeAnswer(attemptId: string, answerId: string, instructorId: string, data: {
        score: number;
        feedback?: string;
    }): Promise<{
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
    private recalculateAttempt;
}
