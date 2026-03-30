import { PrismaService } from '../../common/prisma.service';
import { CreateOptionDto, CloneQuestionDto, MoveQuestionDto } from './dto/question.dto';
export declare class QuestionsManagementService {
    private prisma;
    constructor(prisma: PrismaService);
    clone(id: string, userId: string, userRole: string, dto: CloneQuestionDto): Promise<{
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
    move(id: string, userId: string, userRole: string, dto: MoveQuestionDto): Promise<{
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
    addOptions(questionId: string, userId: string, userRole: string, options: CreateOptionDto[]): Promise<import("@prisma/client").Prisma.BatchPayload>;
    updateOptions(questionId: string, userId: string, userRole: string, options: CreateOptionDto[]): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
