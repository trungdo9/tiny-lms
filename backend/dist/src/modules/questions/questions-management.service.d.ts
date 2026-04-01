import { PrismaService } from '../../common/prisma.service';
import { CreateOptionDto, CloneQuestionDto, MoveQuestionDto } from './dto/question.dto';
export declare class QuestionsManagementService {
    private prisma;
    constructor(prisma: PrismaService);
    clone(id: string, userId: string, userRole: string, dto: CloneQuestionDto): Promise<{
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
    move(id: string, userId: string, userRole: string, dto: MoveQuestionDto): Promise<{
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
    addOptions(questionId: string, userId: string, userRole: string, options: CreateOptionDto[]): Promise<import("@prisma/client").Prisma.BatchPayload>;
    updateOptions(questionId: string, userId: string, userRole: string, options: CreateOptionDto[]): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
