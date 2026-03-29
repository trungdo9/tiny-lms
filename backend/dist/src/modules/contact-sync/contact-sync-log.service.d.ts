import { PrismaService } from '../../common/prisma.service';
export interface ContactSyncLogDto {
    userId?: string;
    email: string;
    provider: string;
    operation: string;
    trigger: string;
    status?: string;
    errorMessage?: string;
    payload?: any;
    externalId?: string;
}
export declare class ContactSyncLogService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: ContactSyncLogDto): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        status: string;
        userId: string | null;
        errorMessage: string | null;
        provider: string;
        operation: string;
        trigger: string;
        payload: import("@prisma/client/runtime/client").JsonValue | null;
        externalId: string | null;
    }>;
    markSuccess(id: string, externalId?: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        status: string;
        userId: string | null;
        errorMessage: string | null;
        provider: string;
        operation: string;
        trigger: string;
        payload: import("@prisma/client/runtime/client").JsonValue | null;
        externalId: string | null;
    }>;
    markFailed(id: string, errorMessage: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        status: string;
        userId: string | null;
        errorMessage: string | null;
        provider: string;
        operation: string;
        trigger: string;
        payload: import("@prisma/client/runtime/client").JsonValue | null;
        externalId: string | null;
    }>;
    findAll(params: {
        page?: number;
        limit?: number;
        status?: string;
        provider?: string;
        trigger?: string;
    }): Promise<{
        data: {
            id: string;
            createdAt: Date;
            email: string;
            status: string;
            userId: string | null;
            errorMessage: string | null;
            provider: string;
            operation: string;
            trigger: string;
            payload: import("@prisma/client/runtime/client").JsonValue | null;
            externalId: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getStats(): Promise<{
        total: number;
        success: number;
        failed: number;
        pending: number;
    }>;
}
