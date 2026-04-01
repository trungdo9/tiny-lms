import { CourseInstructorsService } from './course-instructors.service';
import { AssignInstructorDto, UpdateInstructorRoleDto } from './dto/course-instructor.dto';
export declare class CourseInstructorsController {
    private service;
    constructor(service: CourseInstructorsService);
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
    assign(courseId: string, dto: AssignInstructorDto, req: any): Promise<{
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
    remove(courseId: string, userId: string, req: any): Promise<{
        success: boolean;
    }>;
    updateRole(courseId: string, userId: string, dto: UpdateInstructorRoleDto, req: any): Promise<{
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
