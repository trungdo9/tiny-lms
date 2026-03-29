import { EnrollmentsService } from './enrollments.service';
export declare class EnrollmentsController {
    private enrollmentsService;
    constructor(enrollmentsService: EnrollmentsService);
    enroll(courseId: string, req: any): Promise<{
        id: string;
        courseId: string;
        enrolledAt: Date;
        completedAt: Date | null;
        userId: string;
    }>;
    checkEnrollment(courseId: string, req: any): Promise<{
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
    findByUser(req: any): Promise<({
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
    findByCourse(courseId: string, req: any): Promise<({
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
    unenroll(courseId: string, req: any): Promise<{
        success: boolean;
    }>;
    bulkEnroll(body: {
        courseId: string;
        userIds: string[];
    }): Promise<{
        enrolled: number;
        skipped: number;
    }>;
}
