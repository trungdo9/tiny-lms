import { CourseInstructorsService } from './course-instructors.service';
import { AssignInstructorDto, UpdateInstructorRoleDto } from './dto/course-instructor.dto';
export declare class CourseInstructorsController {
    private service;
    constructor(service: CourseInstructorsService);
    list(courseId: string): Promise<{
        id: any;
        role: any;
        addedAt: any;
        profile: any;
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
        role: string;
        courseId: string;
        profileId: string;
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
        role: string;
        courseId: string;
        profileId: string;
        addedAt: Date;
        addedBy: string;
    }>;
}
