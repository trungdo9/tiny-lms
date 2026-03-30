import { SectionsService } from './sections.service';
import { CreateSectionDto, UpdateSectionDto, ReorderSectionsDto } from './dto/section.dto';
export declare class SectionsController {
    private sectionsService;
    constructor(sectionsService: SectionsService);
    findByCourse(courseId: string): Promise<({
        lessons: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        title: string;
        orderIndex: number;
        courseId: string;
    })[]>;
    findOne(id: string): Promise<{
        lessons: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        title: string;
        orderIndex: number;
        courseId: string;
    }>;
    create(courseId: string, dto: CreateSectionDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        orderIndex: number;
        courseId: string;
    }>;
    update(id: string, dto: UpdateSectionDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        orderIndex: number;
        courseId: string;
    }>;
    delete(id: string, req: any): Promise<{
        success: boolean;
    }>;
    reorder(courseId: string, dto: ReorderSectionsDto, req: any): Promise<{
        success: boolean;
    }>;
}
