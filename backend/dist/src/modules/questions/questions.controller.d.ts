import { QuestionsService } from './questions.service';
import { QuestionsManagementService } from './questions-management.service';
import { CreateQuestionDto, UpdateQuestionDto, CreateOptionDto, BulkCreateQuestionDto, ListQuestionsQueryDto, CloneQuestionDto, MoveQuestionDto } from './dto/question.dto';
export declare class QuestionsController {
    private service;
    private management;
    constructor(service: QuestionsService, management: QuestionsManagementService);
    uploadImage(file: Express.Multer.File): {
        url: string;
    };
    findAll(bankId: string, req: any, query: ListQuestionsQueryDto): Promise<{
        data: ({
            options: {
                id: string;
                content: string;
                createdAt: Date;
                orderIndex: number | null;
                questionId: string;
                isCorrect: boolean;
                matchKey: string | null;
                matchValue: string | null;
            }[];
            _count: {
                quizQuestions: number;
            };
        } & {
            id: string;
            bankId: string;
            type: string;
            content: string;
            explanation: string | null;
            mediaUrl: string | null;
            mediaType: string | null;
            difficulty: string;
            defaultScore: import("@prisma/client-runtime-utils").Decimal;
            tags: string[];
            createdAt: Date;
            updatedAt: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, req: any): Promise<{
        options: {
            id: string;
            content: string;
            createdAt: Date;
            orderIndex: number | null;
            questionId: string;
            isCorrect: boolean;
            matchKey: string | null;
            matchValue: string | null;
        }[];
        _count: {
            quizQuestions: number;
        };
        id: string;
        bankId: string;
        type: string;
        content: string;
        explanation: string | null;
        mediaUrl: string | null;
        mediaType: string | null;
        difficulty: string;
        defaultScore: import("@prisma/client-runtime-utils").Decimal;
        tags: string[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(bankId: string, req: any, dto: CreateQuestionDto): Promise<{
        options: {
            id: string;
            content: string;
            createdAt: Date;
            orderIndex: number | null;
            questionId: string;
            isCorrect: boolean;
            matchKey: string | null;
            matchValue: string | null;
        }[];
    } & {
        id: string;
        bankId: string;
        type: string;
        content: string;
        explanation: string | null;
        mediaUrl: string | null;
        mediaType: string | null;
        difficulty: string;
        defaultScore: import("@prisma/client-runtime-utils").Decimal;
        tags: string[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    bulkCreate(bankId: string, req: any, dto: BulkCreateQuestionDto): Promise<{
        count: number;
        questions: {
            id: string;
            bankId: string;
            type: string;
            content: string;
            explanation: string | null;
            mediaUrl: string | null;
            mediaType: string | null;
            difficulty: string;
            defaultScore: import("@prisma/client-runtime-utils").Decimal;
            tags: string[];
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    update(id: string, req: any, dto: UpdateQuestionDto): Promise<{
        options: {
            id: string;
            content: string;
            createdAt: Date;
            orderIndex: number | null;
            questionId: string;
            isCorrect: boolean;
            matchKey: string | null;
            matchValue: string | null;
        }[];
    } & {
        id: string;
        bankId: string;
        type: string;
        content: string;
        explanation: string | null;
        mediaUrl: string | null;
        mediaType: string | null;
        difficulty: string;
        defaultScore: import("@prisma/client-runtime-utils").Decimal;
        tags: string[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string, req: any): Promise<{
        success: boolean;
    }>;
    clone(id: string, req: any, dto: CloneQuestionDto): Promise<{
        options: {
            id: string;
            content: string;
            createdAt: Date;
            orderIndex: number | null;
            questionId: string;
            isCorrect: boolean;
            matchKey: string | null;
            matchValue: string | null;
        }[];
    } & {
        id: string;
        bankId: string;
        type: string;
        content: string;
        explanation: string | null;
        mediaUrl: string | null;
        mediaType: string | null;
        difficulty: string;
        defaultScore: import("@prisma/client-runtime-utils").Decimal;
        tags: string[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    move(id: string, req: any, dto: MoveQuestionDto): Promise<{
        options: {
            id: string;
            content: string;
            createdAt: Date;
            orderIndex: number | null;
            questionId: string;
            isCorrect: boolean;
            matchKey: string | null;
            matchValue: string | null;
        }[];
    } & {
        id: string;
        bankId: string;
        type: string;
        content: string;
        explanation: string | null;
        mediaUrl: string | null;
        mediaType: string | null;
        difficulty: string;
        defaultScore: import("@prisma/client-runtime-utils").Decimal;
        tags: string[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    addOptions(id: string, req: any, options: CreateOptionDto[]): Promise<import("@prisma/client").Prisma.BatchPayload>;
    updateOptions(id: string, req: any, options: CreateOptionDto[]): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
