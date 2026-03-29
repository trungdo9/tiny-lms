import { LearningPathsService } from './learning-paths.service';
import { CreateLearningPathDto, UpdateLearningPathDto, AddCourseToPathDto, ReorderPathCoursesDto } from './dto/learning-path.dto';
export declare class LearningPathsController {
    private service;
    constructor(service: LearningPathsService);
    findAll(all?: string): Promise<({
        courses: ({
            course: {
                id: string;
                slug: string;
                title: string;
                thumbnailUrl: string | null;
                level: string;
            };
        } & {
            id: string;
            orderIndex: number;
            courseId: string;
            learningPathId: string;
            isRequired: boolean;
        })[];
        creator: {
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
        isPublished: boolean;
        createdBy: string;
    })[]>;
    findMine(req: any): Promise<({
        _count: {
            courses: number;
            enrollments: number;
        };
    } & {
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        thumbnailUrl: string | null;
        isPublished: boolean;
        createdBy: string;
    })[]>;
    findOne(id: string): Promise<{
        courses: ({
            course: {
                id: string;
                slug: string;
                title: string;
                description: string | null;
                thumbnailUrl: string | null;
                level: string;
                lessonCount: number;
            };
        } & {
            id: string;
            orderIndex: number;
            courseId: string;
            learningPathId: string;
            isRequired: boolean;
        })[];
        creator: {
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
        isPublished: boolean;
        createdBy: string;
    }>;
    findOneWithProgress(id: string, req: any): Promise<{
        courses: {
            isEnrolled: boolean;
            completionPercentage: number;
            course: {
                id: string;
                slug: string;
                title: string;
                description: string | null;
                thumbnailUrl: string | null;
                level: string;
                lessonCount: number;
            };
            id: string;
            orderIndex: number;
            courseId: string;
            learningPathId: string;
            isRequired: boolean;
        }[];
        overallProgress: number;
        creator: {
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
        isPublished: boolean;
        createdBy: string;
    }>;
    create(dto: CreateLearningPathDto, req: any): Promise<{
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        thumbnailUrl: string | null;
        isPublished: boolean;
        createdBy: string;
    }>;
    update(id: string, dto: UpdateLearningPathDto, req: any): Promise<{
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        thumbnailUrl: string | null;
        isPublished: boolean;
        createdBy: string;
    }>;
    delete(id: string, req: any): Promise<{
        success: boolean;
    }>;
    enroll(id: string, req: any): Promise<{
        success: boolean;
        enrolled: number;
        skipped: number;
    }>;
    addCourse(id: string, dto: AddCourseToPathDto, req: any): Promise<{
        id: string;
        orderIndex: number;
        courseId: string;
        learningPathId: string;
        isRequired: boolean;
    }>;
    removeCourse(id: string, courseId: string, req: any): Promise<{
        success: boolean;
    }>;
    reorderCourses(id: string, dto: ReorderPathCoursesDto, req: any): Promise<{
        success: boolean;
    }>;
}
