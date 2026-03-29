import { ProgressService } from './progress.service';
declare class SavePositionDto {
    position: number;
}
export declare class ProgressController {
    private progressService;
    constructor(progressService: ProgressService);
    markComplete(lessonId: string, req: any): Promise<{
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
    savePosition(lessonId: string, dto: SavePositionDto, req: any): Promise<{
        id: string;
        updatedAt: Date;
        courseId: string;
        lessonId: string;
        completedAt: Date | null;
        userId: string;
        isCompleted: boolean;
        lastPosition: number;
    }>;
    getCourseProgress(courseId: string, req: any): Promise<{
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
    getLessonProgress(lessonId: string, req: any): Promise<{
        isCompleted: boolean;
        lastPosition: number;
        completedAt?: undefined;
    } | {
        isCompleted: boolean;
        lastPosition: number;
        completedAt: Date | null;
    }>;
}
export {};
