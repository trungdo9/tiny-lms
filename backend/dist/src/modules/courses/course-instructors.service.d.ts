import { PrismaService } from '../../common/prisma.service';
import { AssignInstructorDto, UpdateInstructorRoleDto } from './dto/course-instructor.dto';
export declare class CourseInstructorsService {
    private prisma;
    constructor(prisma: PrismaService);
    list(courseId: string): Promise<{
        id: string;
        role: string;
        addedAt: Date;
        profile: {
            id: string;
            email: string | null;
            fullName: string | null;
            avatarUrl: string | null;
        };
    }[]>;
    assign(courseId: string, dto: AssignInstructorDto, actorId: string, actorRole: string): Promise<{
        profile: {
            id: string;
            email: string | null;
            fullName: string | null;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        courseId: string;
        profileId: string;
        role: string;
        addedAt: Date;
        addedBy: string;
    }>;
    remove(courseId: string, targetUserId: string, actorId: string, actorRole: string): Promise<{
        success: boolean;
    }>;
    updateRole(courseId: string, targetUserId: string, dto: UpdateInstructorRoleDto, actorRole: string): Promise<{
        profile: {
            id: string;
            email: string | null;
            fullName: string | null;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        courseId: string;
        profileId: string;
        role: string;
        addedAt: Date;
        addedBy: string;
    }>;
}
