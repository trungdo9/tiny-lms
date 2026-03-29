import { PrismaService } from '../../../common/prisma.service';
export interface EmailLogDto {
    templateSlug?: string;
    to: string;
    subject: string;
    body?: string;
    status?: 'pending' | 'sent' | 'failed';
    errorMessage?: string;
    messageId?: string;
}
export declare class EmailLogsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(params: {
        page?: number;
        limit?: number;
        status?: string;
        templateSlug?: string;
    }): Promise<{
        data: {
            id: string;
            createdAt: Date;
            status: string;
            subject: string;
            body: string | null;
            to: string;
            templateSlug: string | null;
            errorMessage: string | null;
            messageId: string | null;
            sentAt: Date | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    create(data: EmailLogDto): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        subject: string;
        body: string | null;
        to: string;
        templateSlug: string | null;
        errorMessage: string | null;
        messageId: string | null;
        sentAt: Date | null;
    }>;
    markAsSent(id: string, messageId: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        subject: string;
        body: string | null;
        to: string;
        templateSlug: string | null;
        errorMessage: string | null;
        messageId: string | null;
        sentAt: Date | null;
    }>;
    markAsFailed(id: string, errorMessage: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        subject: string;
        body: string | null;
        to: string;
        templateSlug: string | null;
        errorMessage: string | null;
        messageId: string | null;
        sentAt: Date | null;
    }>;
    getStats(): Promise<{
        total: number;
        sent: number;
        failed: number;
        pending: number;
    }>;
}
