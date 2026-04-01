import { PrismaService } from '../../common/prisma.service';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto, CloneCourseDto, UpdateCategoryDto } from './dto/course.dto';
import { Prisma } from '@prisma/client';
export declare class CoursesService {
    private prisma;
    constructor(prisma: PrismaService);
    canManageCourse(courseId: string, userId: string, userRole: string): Promise<boolean>;
    create(dto: CreateCourseDto, instructorId: string): Promise<{
        id: string;
        title: string;
        slug: string;
        description: string | null;
        thumbnailUrl: string | null;
        level: string;
        status: string;
        isFree: boolean;
        price: Prisma.Decimal | null;
        lessonCount: number;
        averageRating: number | null;
        totalReviews: number;
        createdAt: Date;
        updatedAt: Date;
        instructorId: string;
        categoryId: string | null;
    }>;
    findAll(query: CourseQueryDto): Promise<{
        data: {
            lessonCount: number;
            sectionCount: number;
            enrollmentCount: number;
            _count: undefined;
            category: {
                id: string;
                slug: string;
                name: string;
            } | null;
            instructor: {
                id: string;
                fullName: string | null;
                avatarUrl: string | null;
            };
            id: string;
            title: string;
            slug: string;
            description: string | null;
            thumbnailUrl: string | null;
            level: string;
            status: string;
            isFree: boolean;
            price: Prisma.Decimal | null;
            averageRating: number | null;
            totalReviews: number;
            createdAt: Date;
            updatedAt: Date;
            instructorId: string;
            categoryId: string | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(idOrSlug: string): Promise<{
        category: {
            id: string;
            slug: string;
            name: string;
        } | null;
        instructor: {
            id: string;
            fullName: string | null;
            avatarUrl: string | null;
        };
        sections: ({
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
        })[];
    } & {
        id: string;
        title: string;
        slug: string;
        description: string | null;
        thumbnailUrl: string | null;
        level: string;
        status: string;
        isFree: boolean;
        price: Prisma.Decimal | null;
        lessonCount: number;
        averageRating: number | null;
        totalReviews: number;
        createdAt: Date;
        updatedAt: Date;
        instructorId: string;
        categoryId: string | null;
    }>;
    findMyCourses(userId: string): Promise<({
        instructor: {
            id: string;
            fullName: string | null;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        title: string;
        slug: string;
        description: string | null;
        thumbnailUrl: string | null;
        level: string;
        status: string;
        isFree: boolean;
        price: Prisma.Decimal | null;
        lessonCount: number;
        averageRating: number | null;
        totalReviews: number;
        createdAt: Date;
        updatedAt: Date;
        instructorId: string;
        categoryId: string | null;
    })[]>;
    findInstructorCourses(userId: string, userRole?: string, filters?: {
        search?: string;
        status?: string;
    }): Promise<{
        sectionCount: number;
        enrollmentCount: number;
        _count: undefined;
        category: {
            id: string;
            slug: string;
            name: string;
        } | null;
        id: string;
        title: string;
        slug: string;
        description: string | null;
        thumbnailUrl: string | null;
        level: string;
        status: string;
        isFree: boolean;
        price: Prisma.Decimal | null;
        lessonCount: number;
        averageRating: number | null;
        totalReviews: number;
        createdAt: Date;
        updatedAt: Date;
        instructorId: string;
        categoryId: string | null;
    }[]>;
    update(id: string, dto: UpdateCourseDto, userId: string, userRole?: string): Promise<{
        id: string;
        title: string;
        slug: string;
        description: string | null;
        thumbnailUrl: string | null;
        level: string;
        status: string;
        isFree: boolean;
        price: Prisma.Decimal | null;
        lessonCount: number;
        averageRating: number | null;
        totalReviews: number;
        createdAt: Date;
        updatedAt: Date;
        instructorId: string;
        categoryId: string | null;
    }>;
    delete(id: string, userId: string, userRole?: string): Promise<{
        success: boolean;
    }>;
    getCategories(): Promise<({
        _count: {
            courses: number;
        };
        parent: {
            id: string;
            slug: string;
            name: string;
        } | null;
    } & {
        id: string;
        slug: string;
        createdAt: Date;
        name: string;
        parentId: string | null;
    })[]>;
    getCategoryById(id: string): Promise<{
        _count: {
            courses: number;
        };
        parent: {
            id: string;
            name: string;
        } | null;
        children: {
            id: string;
            slug: string;
            name: string;
        }[];
    } & {
        id: string;
        slug: string;
        createdAt: Date;
        name: string;
        parentId: string | null;
    }>;
    createCategory(name: string, slug?: string, parentId?: string): Promise<{
        id: string;
        slug: string;
        createdAt: Date;
        name: string;
        parentId: string | null;
    }>;
    updateCategory(id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        slug: string;
        createdAt: Date;
        name: string;
        parentId: string | null;
    }>;
    deleteCategory(id: string): Promise<{
        success: boolean;
    }>;
    clone(courseId: string, userId: string, dto: CloneCourseDto, userRole?: string): Promise<{
        message: string;
        id: string;
        title: string;
        slug: string;
        description: string | null;
        thumbnailUrl: string | null;
        level: string;
        status: string;
        isFree: boolean;
        price: Prisma.Decimal | null;
        lessonCount: number;
        averageRating: number | null;
        totalReviews: number;
        createdAt: Date;
        updatedAt: Date;
        instructorId: string;
        categoryId: string | null;
    }>;
    private cloneAllQuizzes;
    private importQuestionsFromQuizzes;
    private generateSlug;
}
