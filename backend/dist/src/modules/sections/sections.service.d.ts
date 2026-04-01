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
            title: string;
            createdAt: Date;
            updatedAt: Date;
            orderIndex: number;
            courseId: string;
            sectionId: string;
            type: string;
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
        }[];
    } & {
        id: string;
        title: string;
        createdAt: Date;
        orderIndex: number;
        courseId: string;
    })[]>;
    findOne(id: string): Promise<{
        lessons: {
            id: string;
            title: string;
            createdAt: Date;
            updatedAt: Date;
            orderIndex: number;
            courseId: string;
            sectionId: string;
            type: string;
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
        }[];
    } & {
        id: string;
        title: string;
        createdAt: Date;
        orderIndex: number;
        courseId: string;
    }>;
    create(courseId: string, dto: CreateSectionDto, userId: string, userRole?: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        orderIndex: number;
        courseId: string;
    }>;
    update(id: string, dto: UpdateSectionDto, userId: string, userRole?: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
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
