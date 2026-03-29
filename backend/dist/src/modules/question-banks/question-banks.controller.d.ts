import { QuestionBanksService } from './question-banks.service';
import { CreateQuestionBankDto, UpdateQuestionBankDto } from './dto/question-bank.dto';
export declare class QuestionBanksController {
    private service;
    constructor(service: QuestionBanksService);
    create(req: any, dto: CreateQuestionBankDto): Promise<{
        course: {
            id: string;
            slug: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            thumbnailUrl: string | null;
            level: string;
            status: string;
            isFree: boolean;
            price: import("@prisma/client-runtime-utils").Decimal | null;
            lessonCount: number;
            averageRating: number | null;
            totalReviews: number;
            instructorId: string;
            categoryId: string | null;
        } | null;
        creator: {
            id: string;
            fullName: string | null;
        };
        _count: {
            questions: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        courseId: string | null;
        createdBy: string;
    }>;
    findAll(req: any, courseId?: string): Promise<({
        course: {
            id: string;
            title: string;
        } | null;
        creator: {
            id: string;
            fullName: string | null;
        };
        _count: {
            questions: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        courseId: string | null;
        createdBy: string;
    })[]>;
    findById(id: string, req: any): Promise<{
        course: {
            id: string;
            title: string;
        } | null;
        questions: ({
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
        })[];
        creator: {
            id: string;
            fullName: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        courseId: string | null;
        createdBy: string;
    }>;
    update(id: string, req: any, dto: UpdateQuestionBankDto): Promise<{
        course: {
            id: string;
            title: string;
        } | null;
        _count: {
            questions: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        courseId: string | null;
        createdBy: string;
    }>;
    delete(id: string, req: any): Promise<{
        success: boolean;
    }>;
    getQuestions(id: string, req: any): Promise<({
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
    })[]>;
}
