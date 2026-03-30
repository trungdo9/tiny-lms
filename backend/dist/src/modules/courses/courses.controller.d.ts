import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto, CloneCourseDto, CreateCategoryDto, UpdateCategoryDto } from './dto/course.dto';
export declare class CoursesController {
    private coursesService;
    constructor(coursesService: CoursesService);
    findAll(query: CourseQueryDto): Promise<{
        data: {
            instructor: any;
            category: any;
            lessonCount: any;
            sectionCount: number;
            enrollmentCount: number;
            id: any;
            title: any;
            slug: any;
            description: any;
            thumbnail_url: any;
            level: any;
            status: any;
            is_free: any;
            price: any;
            lesson_count: any;
            created_at: any;
            updated_at: any;
            instructor_id: any;
            category_id: any;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    } | {
        data: {
            lessonCount: number;
            sectionCount: number;
            enrollmentCount: number;
            _count: undefined;
            category: {
                id: string;
                name: string;
                slug: string;
            } | null;
            instructor: {
                id: string;
                fullName: string | null;
                avatarUrl: string | null;
            };
            id: string;
            slug: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            thumbnailUrl: string | null;
            level: string;
            status: string;
            isFree: boolean;
            price: import("@prisma/client-runtime-utils").Decimal | null;
            averageRating: number | null;
            totalReviews: number;
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
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        thumbnailUrl: string | null;
        level: string;
        status: string;
        isFree: boolean;
        price: import("@prisma/client-runtime-utils").Decimal | null;
        lessonCount: number;
        averageRating: number | null;
        totalReviews: number;
        instructorId: string;
        categoryId: string | null;
    })[]>;
    findInstructorCourses(req: any, search?: string, status?: string): Promise<{
        sectionCount: number;
        enrollmentCount: number;
        _count: undefined;
        category: {
            id: string;
            name: string;
            slug: string;
        } | null;
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        thumbnailUrl: string | null;
        level: string;
        status: string;
        isFree: boolean;
        price: import("@prisma/client-runtime-utils").Decimal | null;
        lessonCount: number;
        averageRating: number | null;
        totalReviews: number;
        instructorId: string;
        categoryId: string | null;
    }[]>;
    getCategories(): Promise<{
        id: any;
        name: any;
        slug: any;
        parentId: any;
        createdAt: any;
        parent: any;
        _count: {
            courses: number;
        };
    }[]>;
    getCategoryById(id: string): Promise<{
        parent: {
            id: string;
            name: string;
        } | null;
        children: {
            id: string;
            name: string;
            slug: string;
        }[];
        _count: {
            courses: number;
        };
    } & {
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        parentId: string | null;
    }>;
    findOne(id: string): Promise<{
        instructor: {
            id: any;
            full_name: any;
            avatar_url: any;
        } | null;
        category: {
            id: any;
            name: any;
            slug: any;
        } | null;
        sections: any[];
        id: any;
        title: any;
        slug: any;
        description: any;
        thumbnail_url: any;
        level: any;
        status: any;
        is_free: any;
        price: any;
        lesson_count: any;
        created_at: any;
        updated_at: any;
        instructor_id: any;
        category_id: any;
    } | ({
        category: {
            id: string;
            name: string;
            slug: string;
        } | null;
        instructor: {
            id: string;
            fullName: string | null;
            avatarUrl: string | null;
        };
        sections: ({
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
        })[];
    } & {
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        thumbnailUrl: string | null;
        level: string;
        status: string;
        isFree: boolean;
        price: import("@prisma/client-runtime-utils").Decimal | null;
        lessonCount: number;
        averageRating: number | null;
        totalReviews: number;
        instructorId: string;
        categoryId: string | null;
    })>;
    create(dto: CreateCourseDto, req: any): Promise<{
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        thumbnailUrl: string | null;
        level: string;
        status: string;
        isFree: boolean;
        price: import("@prisma/client-runtime-utils").Decimal | null;
        lessonCount: number;
        averageRating: number | null;
        totalReviews: number;
        instructorId: string;
        categoryId: string | null;
    }>;
    createCategory(dto: CreateCategoryDto): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        parentId: string | null;
    }>;
    updateCategory(id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        parentId: string | null;
    }>;
    deleteCategory(id: string): Promise<{
        success: boolean;
    }>;
    update(id: string, dto: UpdateCourseDto, req: any): Promise<{
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        thumbnailUrl: string | null;
        level: string;
        status: string;
        isFree: boolean;
        price: import("@prisma/client-runtime-utils").Decimal | null;
        lessonCount: number;
        averageRating: number | null;
        totalReviews: number;
        instructorId: string;
        categoryId: string | null;
    }>;
    delete(id: string, req: any): Promise<{
        success: boolean;
    }>;
    clone(id: string, dto: CloneCourseDto, req: any): Promise<{
        message: string;
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        thumbnailUrl: string | null;
        level: string;
        status: string;
        isFree: boolean;
        price: import("@prisma/client-runtime-utils").Decimal | null;
        lessonCount: number;
        averageRating: number | null;
        totalReviews: number;
        instructorId: string;
        categoryId: string | null;
    }>;
}
