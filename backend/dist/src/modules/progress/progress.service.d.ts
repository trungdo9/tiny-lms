import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma.service';
export declare class ProgressService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    markComplete(lessonId: string, userId: string): Promise<{
        id: string;
        updatedAt: Date;
        courseId: string;
        lessonId: string;
        completedAt: Date | null;
        userId: string;
        isCompleted: boolean;
        lastPosition: number;
    } | {
        success: boolean;
        message: string;
    }>;
    savePosition(lessonId: string, position: number, userId: string): Promise<{
        id: string;
        updatedAt: Date;
        courseId: string;
        lessonId: string;
        completedAt: Date | null;
        userId: string;
        isCompleted: boolean;
        lastPosition: number;
    }>;
    getCourseProgress(courseId: string, userId: string): Promise<{
        courseId: string;
        totalLessons: number;
        completedLessons: number;
        completionPercentage: number;
        lessons: {
            id: string;
            updatedAt: Date;
            courseId: string;
            lessonId: string;
            completedAt: Date | null;
            userId: string;
            isCompleted: boolean;
            lastPosition: number;
        }[];
    }>;
    getLessonProgress(lessonId: string, userId: string): Promise<{
        isCompleted: boolean;
        lastPosition: number;
        completedAt?: undefined;
    } | {
        isCompleted: boolean;
        lastPosition: number;
        completedAt: Date | null;
    }>;
    private getLessonWithAccessCheck;
}
