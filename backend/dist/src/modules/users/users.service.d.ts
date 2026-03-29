import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma.service';
import { SupabaseService } from '../../common/supabase.service';
export declare class UsersService {
    private prisma;
    private supabase;
    private eventEmitter;
    constructor(prisma: PrismaService, supabase: SupabaseService, eventEmitter: EventEmitter2);
    findById(id: string): Promise<{
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
    private ensureProfile;
    getProfile(userId: string, email?: string): Promise<{
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
    updateProfile(userId: string, data: {
        full_name?: string;
        bio?: string;
        phone?: string;
    }): Promise<any>;
    updateAvatar(userId: string, avatarUrl: string): Promise<{
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
    searchUsers(query: string, page?: number, limit?: number, filters?: {
        role?: string;
        isActive?: boolean;
        sortBy?: 'createdAt' | 'fullName' | 'email';
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
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
    updateUser(id: string, data: {
        role?: string;
        isActive?: boolean;
        fullName?: string;
        bio?: string;
        phone?: string;
    }): Promise<{
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
    createUser(dto: {
        email: string;
        password: string;
        fullName?: string;
        role?: string;
    }): Promise<{
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
    getUserStats(): Promise<{
        total: number;
        students: number;
        instructors: number;
        admins: number;
        inactive: number;
    }>;
    resetUserPassword(id: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    getMyActivity(userId: string, months: number): Promise<{
        daily: {
            date: string;
            count: number;
        }[];
    }>;
}
