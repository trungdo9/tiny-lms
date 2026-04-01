import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto, CloneCourseDto, CreateCategoryDto, UpdateCategoryDto } from './dto/course.dto';
export declare class CoursesController {
    private coursesService;
    constructor(coursesService: CoursesService);
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
            price: import("@prisma/client-runtime-utils").Decimal | null;
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
    findMyCourses(req: any): Promise<({
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
        price: import("@prisma/client-runtime-utils").Decimal | null;
        lessonCount: number;
        averageRating: number | null;
        totalReviews: number;
        createdAt: Date;
        updatedAt: Date;
        instructorId: string;
        categoryId: string | null;
    })[]>;
    findInstructorCourses(req: any, search?: string, status?: string): Promise<{
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
        price: import("@prisma/client-runtime-utils").Decimal | null;
        lessonCount: number;
        averageRating: number | null;
        totalReviews: number;
        createdAt: Date;
        updatedAt: Date;
        instructorId: string;
        categoryId: string | null;
    }[]>;
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
    findOne(id: string): Promise<{
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
        price: import("@prisma/client-runtime-utils").Decimal | null;
        lessonCount: number;
        averageRating: number | null;
        totalReviews: number;
        createdAt: Date;
        updatedAt: Date;
        instructorId: string;
        categoryId: string | null;
    }>;
    create(dto: CreateCourseDto, req: any): Promise<{
        id: string;
        title: string;
        slug: string;
        description: string | null;
        thumbnailUrl: string | null;
        level: string;
        status: string;
        isFree: boolean;
        price: import("@prisma/client-runtime-utils").Decimal | null;
        lessonCount: number;
        averageRating: number | null;
        totalReviews: number;
        createdAt: Date;
        updatedAt: Date;
        instructorId: string;
        categoryId: string | null;
    }>;
    createCategory(dto: CreateCategoryDto): Promise<{
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
    update(id: string, dto: UpdateCourseDto, req: any): Promise<{
        id: string;
        title: string;
        slug: string;
        description: string | null;
        thumbnailUrl: string | null;
        level: string;
        status: string;
        isFree: boolean;
        price: import("@prisma/client-runtime-utils").Decimal | null;
        lessonCount: number;
        averageRating: number | null;
        totalReviews: number;
        createdAt: Date;
        updatedAt: Date;
        instructorId: string;
        categoryId: string | null;
    }>;
    delete(id: string, req: any): Promise<{
        success: boolean;
    }>;
    clone(id: string, dto: CloneCourseDto, req: any): Promise<{
        message: string;
        id: string;
        title: string;
        slug: string;
        description: string | null;
        thumbnailUrl: string | null;
        level: string;
        status: string;
        isFree: boolean;
        price: import("@prisma/client-runtime-utils").Decimal | null;
        lessonCount: number;
        averageRating: number | null;
        totalReviews: number;
        createdAt: Date;
        updatedAt: Date;
        instructorId: string;
        categoryId: string | null;
    }>;
}
