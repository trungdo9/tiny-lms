import { UsersService } from './users.service';
import { PrismaService } from '../../common/prisma.service';
import { SupabaseService } from '../../common/supabase.service';
import { ConfigService } from '@nestjs/config';
declare class UpdateProfileDto {
    fullName?: string;
    bio?: string;
    phone?: string;
}
declare class UpdateUserDto {
    role?: string;
    isActive?: boolean;
    fullName?: string;
    bio?: string;
    phone?: string;
}
declare class UserQueryDto {
    page?: string;
    limit?: string;
    q?: string;
    role?: string;
    isActive?: string;
    sortBy?: string;
    sortOrder?: string;
}
declare class CreateAdminUserDto {
    email: string;
    password: string;
    fullName?: string;
    role?: string;
}
declare class ResetPasswordDto {
    newPassword: string;
}
export declare class UsersController {
    private usersService;
    private prisma;
    private supabase;
    private configService;
    constructor(usersService: UsersService, prisma: PrismaService, supabase: SupabaseService, configService: ConfigService);
    getProfile(req: any): Promise<{
        email: string | null;
        id: string;
        createdAt: Date;
        fullName: string | null;
        avatarUrl: string | null;
        role: string;
        bio: string | null;
        phone: string | null;
        isActive: boolean;
        lastLoginAt: Date | null;
        emailVerified: boolean | null;
        updatedAt: Date;
        departmentId: string | null;
    }>;
    getMyActivity(req: any, months?: string): Promise<{
        daily: {
            date: string;
            count: number;
        }[];
    }>;
    searchUsers(q?: string, role?: string, page?: string, limit?: string): Promise<{
        users: {
            id: string;
            createdAt: Date;
            email: string | null;
            fullName: string | null;
            avatarUrl: string | null;
            role: string;
            isActive: boolean;
            lastLoginAt: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getStudentDashboard(req: any): Promise<{
        stats: {
            totalCourses: number;
            completedCourses: number;
            totalQuizzes: number;
        };
        enrolledCourses: any[];
        recentActivity: {
            id: string;
            quizTitle: string;
            score: import("@prisma/client-runtime-utils").Decimal | null;
            isPassed: boolean | null;
            submittedAt: Date | null;
        }[];
        error?: undefined;
    } | {
        stats: {
            totalCourses: number;
            completedCourses: number;
            totalQuizzes: number;
        };
        enrolledCourses: never[];
        recentActivity: never[];
        error: any;
    }>;
    getEnrolledCourses(req: any): Promise<{
        id: string;
        title: string;
        description: string | null;
        thumbnailUrl: string | null;
        instructorName: string | null;
        totalLessons: number;
        enrolledAt: Date;
    }[]>;
    getQuizHistory(req: any): Promise<{
        id: string;
        quizId: string;
        quizTitle: string;
        courseId: string;
        score: import("@prisma/client-runtime-utils").Decimal | null;
        maxScore: import("@prisma/client-runtime-utils").Decimal | null;
        totalScore: import("@prisma/client-runtime-utils").Decimal | null;
        isPassed: boolean | null;
        status: string;
        startedAt: Date;
        submittedAt: Date | null;
    }[]>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<any>;
    updateAvatar(req: any, file: Express.Multer.File): Promise<{
        avatarUrl: string;
    }>;
    getUserStats(): Promise<{
        total: number;
        students: number;
        instructors: number;
        admins: number;
        inactive: number;
    }>;
    getAllUsers(query: UserQueryDto): Promise<{
        users: {
            id: string;
            createdAt: Date;
            email: string | null;
            fullName: string | null;
            avatarUrl: string | null;
            role: string;
            isActive: boolean;
            lastLoginAt: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    createUser(dto: CreateAdminUserDto): Promise<{
        id: string;
        createdAt: Date;
        email: string | null;
        fullName: string | null;
        avatarUrl: string | null;
        role: string;
        bio: string | null;
        phone: string | null;
        isActive: boolean;
        lastLoginAt: Date | null;
        emailVerified: boolean | null;
        updatedAt: Date;
        departmentId: string | null;
    }>;
    getUserById(id: string): Promise<{
        id: string;
        createdAt: Date;
        email: string | null;
        fullName: string | null;
        avatarUrl: string | null;
        role: string;
        bio: string | null;
        phone: string | null;
        isActive: boolean;
        lastLoginAt: Date | null;
        emailVerified: boolean | null;
        updatedAt: Date;
        departmentId: string | null;
    }>;
    updateUser(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        createdAt: Date;
        email: string | null;
        fullName: string | null;
        avatarUrl: string | null;
        role: string;
        bio: string | null;
        phone: string | null;
        isActive: boolean;
        lastLoginAt: Date | null;
        emailVerified: boolean | null;
        updatedAt: Date;
        departmentId: string | null;
    }>;
    reactivateUser(id: string): Promise<{
        id: string;
        createdAt: Date;
        email: string | null;
        fullName: string | null;
        avatarUrl: string | null;
        role: string;
        bio: string | null;
        phone: string | null;
        isActive: boolean;
        lastLoginAt: Date | null;
        emailVerified: boolean | null;
        updatedAt: Date;
        departmentId: string | null;
    }>;
    resetUserPassword(id: string, dto: ResetPasswordDto): Promise<{
        success: boolean;
    }>;
    deactivateUser(id: string): Promise<{
        id: string;
        createdAt: Date;
        email: string | null;
        fullName: string | null;
        avatarUrl: string | null;
        role: string;
        bio: string | null;
        phone: string | null;
        isActive: boolean;
        lastLoginAt: Date | null;
        emailVerified: boolean | null;
        updatedAt: Date;
        departmentId: string | null;
    }>;
}
export {};
