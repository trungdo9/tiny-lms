import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma.service';
import { CertificatesService } from '../certificates/certificates.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateLearningPathDto, UpdateLearningPathDto, AddCourseToPathDto } from './dto/learning-path.dto';
export declare class LearningPathsService {
    private prisma;
    private eventEmitter;
    private certificatesService;
    private notificationsService;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2, certificatesService: CertificatesService, notificationsService: NotificationsService);
    create(dto: CreateLearningPathDto, userId: string): Promise<{
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
    findAll(publishedOnly?: boolean): Promise<({
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
    findOneWithProgress(id: string, userId: string): Promise<{
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
    update(id: string, dto: UpdateLearningPathDto, userId: string, userRole: string): Promise<{
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
    delete(id: string, userId: string, userRole: string): Promise<{
        success: boolean;
    }>;
    findMine(userId: string): Promise<({
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
    enroll(pathId: string, userId: string): Promise<{
        success: boolean;
        enrolled: number;
        skipped: number;
    }>;
    checkAndIssueCertificate(pathId: string, userId: string): Promise<void>;
    addCourse(pathId: string, dto: AddCourseToPathDto, userId: string, userRole: string): Promise<{
        id: string;
        orderIndex: number;
        courseId: string;
        learningPathId: string;
        isRequired: boolean;
    }>;
    removeCourse(pathId: string, courseId: string, userId: string, userRole: string): Promise<{
        success: boolean;
    }>;
    reorderCourses(pathId: string, courseIds: string[], userId: string, userRole: string): Promise<{
        success: boolean;
    }>;
    handlePathCompleted(payload: {
        userId: string;
        pathId: string;
        pathTitle: string;
    }): Promise<void>;
    private verifyOwnership;
}
