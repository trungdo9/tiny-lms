import { QuestionsService } from './questions.service';
import { CreateQuestionDto, UpdateQuestionDto, CreateOptionDto, BulkCreateQuestionDto } from './dto/question.dto';
export declare class QuestionsController {
    private service;
    constructor(service: QuestionsService);
    create(bankId: string, req: any, dto: CreateQuestionDto): Promise<{
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
    bulkCreate(bankId: string, req: any, dto: BulkCreateQuestionDto): Promise<{
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
    update(id: string, req: any, dto: UpdateQuestionDto): Promise<{
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
    delete(id: string, req: any): Promise<{
        success: boolean;
    }>;
    addOptions(id: string, req: any, options: CreateOptionDto[]): Promise<import("@prisma/client").Prisma.BatchPayload>;
    updateOptions(id: string, req: any, options: CreateOptionDto[]): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
