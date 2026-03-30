import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto, ReorderLessonsDto } from './dto/lesson.dto';
export declare class LessonsController {
    private lessonsService;
    constructor(lessonsService: LessonsService);
    findBySection(sectionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        orderIndex: number;
        courseId: string;
        type: string;
        content: string | null;
        videoUrl: string | null;
        videoProvider: string | null;
        pdfUrl: string | null;
        durationMins: number | null;
        isPreview: boolean;
        isPublished: boolean;
        availableAfterDays: number | null;
        availableFrom: Date | null;
        sectionId: string;
        prerequisiteLessonId: string | null;
    }[]>;
    findOne(id: string): Promise<{
        section: {
            id: string;
            title: string;
            courseId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        orderIndex: number;
        courseId: string;
        type: string;
        content: string | null;
        videoUrl: string | null;
        videoProvider: string | null;
        pdfUrl: string | null;
        durationMins: number | null;
        isPreview: boolean;
        isPublished: boolean;
        availableAfterDays: number | null;
        availableFrom: Date | null;
        sectionId: string;
        prerequisiteLessonId: string | null;
    }>;
    findOneForLearning(id: string, req: any): Promise<{
        userProgress: {
            id: string;
            updatedAt: Date;
            courseId: string;
            lessonId: string;
            completedAt: Date | null;
            userId: string;
            isCompleted: boolean;
            lastPosition: number;
        } | null;
        section: {
            id: string;
            title: string;
            courseId: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        orderIndex: number;
        courseId: string;
        type: string;
        content: string | null;
        videoUrl: string | null;
        videoProvider: string | null;
        pdfUrl: string | null;
        durationMins: number | null;
        isPreview: boolean;
        isPublished: boolean;
        availableAfterDays: number | null;
        availableFrom: Date | null;
        sectionId: string;
        prerequisiteLessonId: string | null;
    }>;
    create(sectionId: string, dto: CreateLessonDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        orderIndex: number;
        courseId: string;
        type: string;
        content: string | null;
        videoUrl: string | null;
        videoProvider: string | null;
        pdfUrl: string | null;
        durationMins: number | null;
        isPreview: boolean;
        isPublished: boolean;
        availableAfterDays: number | null;
        availableFrom: Date | null;
        sectionId: string;
        prerequisiteLessonId: string | null;
    }>;
    update(id: string, dto: UpdateLessonDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        orderIndex: number;
        courseId: string;
        type: string;
        content: string | null;
        videoUrl: string | null;
        videoProvider: string | null;
        pdfUrl: string | null;
        durationMins: number | null;
        isPreview: boolean;
        isPublished: boolean;
        availableAfterDays: number | null;
        availableFrom: Date | null;
        sectionId: string;
        prerequisiteLessonId: string | null;
    }>;
    delete(id: string, req: any): Promise<{
        success: boolean;
    }>;
    reorder(sectionId: string, dto: ReorderLessonsDto, req: any): Promise<{
        success: boolean;
    }>;
}
