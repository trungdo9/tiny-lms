import { PrismaService } from '../../common/prisma.service';
import { CoursesService } from '../courses/courses.service';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto';
export declare class SectionsService {
    private prisma;
    private coursesService;
    constructor(prisma: PrismaService, coursesService: CoursesService);
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
    create(courseId: string, dto: CreateSectionDto, userId: string, userRole?: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        orderIndex: number;
        courseId: string;
    }>;
    update(id: string, dto: UpdateSectionDto, userId: string, userRole?: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        orderIndex: number;
        courseId: string;
    }>;
    delete(id: string, userId: string, userRole?: string): Promise<{
        success: boolean;
    }>;
    reorder(courseId: string, sectionIds: string[], userId: string, userRole?: string): Promise<{
        success: boolean;
    }>;
    private verifyCourseAccess;
}
