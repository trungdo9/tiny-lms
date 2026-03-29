import { PrismaService } from '../../common/prisma.service';
import { CreateQuestionDto, UpdateQuestionDto, CreateOptionDto } from './dto/question.dto';
export declare class QuestionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(bankId: string, userId: string, userRole: string, dto: CreateQuestionDto): Promise<{
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
    }>;
    bulkCreate(bankId: string, userId: string, userRole: string, questions: CreateQuestionDto[]): Promise<{
        count: number;
        questions: {
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
        }[];
    }>;
    update(id: string, userId: string, userRole: string, dto: UpdateQuestionDto): Promise<{
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
    }>;
    delete(id: string, userId: string, userRole: string): Promise<{
        success: boolean;
    }>;
    addOptions(questionId: string, userId: string, userRole: string, options: CreateOptionDto[]): Promise<import("@prisma/client").Prisma.BatchPayload>;
    updateOptions(questionId: string, userId: string, userRole: string, options: CreateOptionDto[]): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
