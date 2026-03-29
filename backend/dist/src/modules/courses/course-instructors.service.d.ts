import { PrismaService } from '../../common/prisma.service';
import { SupabaseService } from '../../common/supabase.service';
import { AssignInstructorDto, UpdateInstructorRoleDto } from './dto/course-instructor.dto';
export declare class CourseInstructorsService {
    private prisma;
    private supabaseService;
    constructor(prisma: PrismaService, supabaseService: SupabaseService);
    private shouldUseSupabaseFallback;
    list(courseId: string): Promise<{
        id: any;
        role: any;
        addedAt: any;
        profile: any;
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
        role: string;
        courseId: string;
        profileId: string;
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
        role: string;
        courseId: string;
        profileId: string;
        addedAt: Date;
        addedBy: string;
    }>;
}
