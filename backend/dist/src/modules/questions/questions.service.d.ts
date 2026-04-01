import { PrismaService } from '../../common/prisma.service';
import { CreateQuestionDto, UpdateQuestionDto, ListQuestionsQueryDto } from './dto/question.dto';
export declare class QuestionsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(bankId: string, userId: string, userRole: string, query: ListQuestionsQueryDto): Promise<{
        data: ({
            options: {
                id: string;
                createdAt: Date;
                content: string;
                orderIndex: number | null;
                isCorrect: boolean;
                matchKey: string | null;
                matchValue: string | null;
                questionId: string;
            }[];
            _count: {
                quizQuestions: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            difficulty: string;
            tags: string[];
            bankId: string;
            content: string;
            explanation: string | null;
            mediaUrl: string | null;
            mediaType: string | null;
            defaultScore: import("@prisma/client-runtime-utils").Decimal;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, userId: string, userRole: string): Promise<{
        options: {
            id: string;
            createdAt: Date;
            content: string;
            orderIndex: number | null;
            isCorrect: boolean;
            matchKey: string | null;
            matchValue: string | null;
            questionId: string;
        }[];
        _count: {
            quizQuestions: number;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        difficulty: string;
        tags: string[];
        bankId: string;
        content: string;
        explanation: string | null;
        mediaUrl: string | null;
        mediaType: string | null;
        defaultScore: import("@prisma/client-runtime-utils").Decimal;
    }>;
    create(bankId: string, userId: string, userRole: string, dto: CreateQuestionDto): Promise<{
        options: {
            id: string;
            createdAt: Date;
            content: string;
            orderIndex: number | null;
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
        difficulty: string;
        tags: string[];
        bankId: string;
        content: string;
        explanation: string | null;
        mediaUrl: string | null;
        mediaType: string | null;
        defaultScore: import("@prisma/client-runtime-utils").Decimal;
    }>;
    bulkCreate(bankId: string, userId: string, userRole: string, questions: CreateQuestionDto[]): Promise<{
        count: number;
        questions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            difficulty: string;
            tags: string[];
            bankId: string;
            content: string;
            explanation: string | null;
            mediaUrl: string | null;
            mediaType: string | null;
            defaultScore: import("@prisma/client-runtime-utils").Decimal;
        }[];
    }>;
    update(id: string, userId: string, userRole: string, dto: UpdateQuestionDto): Promise<{
        options: {
            id: string;
            createdAt: Date;
            content: string;
            orderIndex: number | null;
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
        difficulty: string;
        tags: string[];
        bankId: string;
        content: string;
        explanation: string | null;
        mediaUrl: string | null;
        mediaType: string | null;
        defaultScore: import("@prisma/client-runtime-utils").Decimal;
    }>;
    delete(id: string, userId: string, userRole: string): Promise<{
        success: boolean;
    }>;
}
