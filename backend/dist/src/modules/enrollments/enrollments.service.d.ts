import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma.service';
export declare class EnrollmentsService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    enroll(courseId: string, userId: string): Promise<{
        id: string;
        courseId: string;
        enrolledAt: Date;
        completedAt: Date | null;
        userId: string;
    }>;
    checkEnrollment(courseId: string, userId: string): Promise<{
        isEnrolled: boolean;
        enrollment?: undefined;
    } | {
        isEnrolled: boolean;
        enrollment: {
            course: {
                slug: string;
                title: string;
            };
        } & {
            id: string;
            courseId: string;
            enrolledAt: Date;
            completedAt: Date | null;
            userId: string;
        };
    }>;
    findByUser(userId: string): Promise<({
        course: {
            id: string;
            slug: string;
            instructor: {
                id: string;
                fullName: string | null;
                avatarUrl: string | null;
            };
            title: string;
            description: string | null;
            thumbnailUrl: string | null;
            level: string;
        };
    } & {
        id: string;
        courseId: string;
        enrolledAt: Date;
        completedAt: Date | null;
        userId: string;
    })[]>;
    findByCourse(courseId: string, userId: string): Promise<({
        user: {
            id: string;
            fullName: string | null;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        courseId: string;
        enrolledAt: Date;
        completedAt: Date | null;
        userId: string;
    })[]>;
    unenroll(courseId: string, userId: string): Promise<{
        success: boolean;
    }>;
    bulkEnroll(courseId: string, userIds: string[]): Promise<{
        enrolled: number;
        skipped: number;
    }>;
}
