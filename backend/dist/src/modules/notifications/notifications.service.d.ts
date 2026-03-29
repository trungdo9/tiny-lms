import { PrismaService } from '../../common/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string, page?: number, limit?: number): Promise<{
        notifications: {
            data: import("@prisma/client/runtime/client").JsonValue | null;
            id: string;
            createdAt: Date;
            title: string;
            type: string;
            userId: string;
            message: string | null;
            isRead: boolean;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(id: string, userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    create(data: {
        userId: string;
        type: string;
        title: string;
        message?: string;
        data?: any;
    }): Promise<{
        data: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        title: string;
        type: string;
        userId: string;
        message: string | null;
        isRead: boolean;
    }>;
    notifyQuizResult(userId: string, quizTitle: string, score: number, isPassed: boolean): Promise<{
        data: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        title: string;
        type: string;
        userId: string;
        message: string | null;
        isRead: boolean;
    }>;
    notifyGradingComplete(userId: string, quizTitle: string): Promise<{
        data: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        title: string;
        type: string;
        userId: string;
        message: string | null;
        isRead: boolean;
    }>;
    notifyEnrollment(instructorId: string, courseTitle: string, studentName: string): Promise<{
        data: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        title: string;
        type: string;
        userId: string;
        message: string | null;
        isRead: boolean;
    }>;
    notifyCoursePublished(studentIds: string[], courseTitle: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
