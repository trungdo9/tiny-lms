import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto, ReorderLessonsDto } from './dto/lesson.dto';
export declare class LessonsController {
    private lessonsService;
    constructor(lessonsService: LessonsService);
    findBySection(sectionId: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        orderIndex: number;
        courseId: string;
        sectionId: string;
        content: string | null;
        videoUrl: string | null;
        videoProvider: string | null;
        pdfUrl: string | null;
        durationMins: number | null;
        isPreview: boolean;
        isPublished: boolean;
        prerequisiteLessonId: string | null;
        availableAfterDays: number | null;
        availableFrom: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        section: {
            id: string;
            title: string;
            courseId: string;
        };
    } & {
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        orderIndex: number;
        courseId: string;
        sectionId: string;
        content: string | null;
        videoUrl: string | null;
        videoProvider: string | null;
        pdfUrl: string | null;
        durationMins: number | null;
        isPreview: boolean;
        isPublished: boolean;
        prerequisiteLessonId: string | null;
        availableAfterDays: number | null;
        availableFrom: Date | null;
    }>;
    findOneForLearning(id: string, req: any): Promise<{
        userProgress: {
            id: string;
            updatedAt: Date;
            courseId: string;
            userId: string;
            lessonId: string;
            completedAt: Date | null;
            isCompleted: boolean;
            lastPosition: number;
        } | null;
        section: {
            id: string;
            title: string;
            courseId: string;
        };
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        orderIndex: number;
        courseId: string;
        sectionId: string;
        content: string | null;
        videoUrl: string | null;
        videoProvider: string | null;
        pdfUrl: string | null;
        durationMins: number | null;
        isPreview: boolean;
        isPublished: boolean;
        prerequisiteLessonId: string | null;
        availableAfterDays: number | null;
        availableFrom: Date | null;
    }>;
    create(sectionId: string, dto: CreateLessonDto, req: any): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        orderIndex: number;
        courseId: string;
        sectionId: string;
        content: string | null;
        videoUrl: string | null;
        videoProvider: string | null;
        pdfUrl: string | null;
        durationMins: number | null;
        isPreview: boolean;
        isPublished: boolean;
        prerequisiteLessonId: string | null;
        availableAfterDays: number | null;
        availableFrom: Date | null;
    }>;
    update(id: string, dto: UpdateLessonDto, req: any): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        orderIndex: number;
        courseId: string;
        sectionId: string;
        content: string | null;
        videoUrl: string | null;
        videoProvider: string | null;
        pdfUrl: string | null;
        durationMins: number | null;
        isPreview: boolean;
        isPublished: boolean;
        prerequisiteLessonId: string | null;
        availableAfterDays: number | null;
        availableFrom: Date | null;
    }>;
    delete(id: string, req: any): Promise<{
        success: boolean;
    }>;
    reorder(sectionId: string, dto: ReorderLessonsDto, req: any): Promise<{
        success: boolean;
    }>;
}
