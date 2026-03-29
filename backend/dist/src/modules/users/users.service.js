"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../../common/prisma.service");
const supabase_service_1 = require("../../common/supabase.service");
const contact_sync_events_1 = require("../contact-sync/contact-sync.events");
let UsersService = class UsersService {
    prisma;
    supabase;
    eventEmitter;
    constructor(prisma, supabase, eventEmitter) {
        this.prisma = prisma;
        this.supabase = supabase;
        this.eventEmitter = eventEmitter;
    }
    async findById(id) {
        const profile = await this.prisma.profile.findUnique({
            where: { id },
        });
        if (!profile)
            throw new common_1.NotFoundException('User not found');
        return profile;
    }
    async ensureProfile(userId, options = {}) {
        let profile = await this.prisma.profile.findUnique({
            where: { id: userId },
        });
        if (profile) {
            return profile;
        }
        let resolvedEmail = options.email;
        let fullName;
        try {
            const { data, error } = await this.supabase.adminClient.auth.admin.getUserById(userId);
            if (error) {
                throw error;
            }
            resolvedEmail = resolvedEmail ?? data.user?.email ?? undefined;
            const metadata = data.user?.user_metadata;
            fullName = metadata?.full_name?.trim() || undefined;
        }
        catch {
        }
        profile = await this.prisma.profile.upsert({
            where: { id: userId },
            update: {
                email: resolvedEmail,
                ...(fullName ? { fullName } : {}),
                isActive: true,
            },
            create: {
                id: userId,
                email: resolvedEmail,
                ...(fullName ? { fullName } : {}),
                role: 'student',
                isActive: true,
            },
        });
        return profile;
    }
    async getProfile(userId, email) {
        let profile = await this.ensureProfile(userId, { email });
        if (email && profile.email !== email) {
            profile = await this.prisma.profile.update({
                where: { id: userId },
                data: { email },
            });
        }
        return {
            ...profile,
            email: email ?? profile.email,
        };
    }
    async updateProfile(userId, data) {
        const { data: profile, error } = await this.supabase.adminClient
            .from('profiles')
            .update({
            full_name: data.full_name,
            bio: data.bio,
            phone: data.phone,
        })
            .eq('id', userId)
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        this.eventEmitter.emit(contact_sync_events_1.CONTACT_SYNC_EVENTS.PROFILE_UPDATED, { userId });
        return profile;
    }
    async updateAvatar(userId, avatarUrl) {
        return this.prisma.profile.update({
            where: { id: userId },
            data: { avatarUrl },
        });
    }
    async searchUsers(query, page = 1, limit = 20, filters) {
        const skip = (page - 1) * limit;
        const where = query
            ? {
                OR: [
                    { fullName: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                ],
            }
            : {};
        if (filters?.role)
            where.role = filters.role;
        if (filters?.isActive !== undefined)
            where.isActive = filters.isActive;
        const orderBy = filters?.sortBy
            ? { [filters.sortBy]: filters.sortOrder ?? 'asc' }
            : { createdAt: 'desc' };
        const [users, total] = await Promise.all([
            this.prisma.profile.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    avatarUrl: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    lastLoginAt: true,
                },
            }),
            this.prisma.profile.count({ where }),
        ]);
        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async updateUser(id, data) {
        const updateData = {};
        if (data.role)
            updateData.role = data.role;
        if (data.isActive !== undefined)
            updateData.isActive = data.isActive;
        if (data.fullName !== undefined)
            updateData.fullName = data.fullName;
        if (data.bio !== undefined)
            updateData.bio = data.bio;
        if (data.phone !== undefined)
            updateData.phone = data.phone;
        return this.prisma.profile.update({
            where: { id },
            data: updateData,
        });
    }
    async deactivateUser(id) {
        return this.prisma.profile.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async reactivateUser(id) {
        return this.prisma.profile.update({
            where: { id },
            data: { isActive: true },
        });
    }
    async createUser(dto) {
        const { data: authData, error } = await this.supabase.adminClient.auth.admin.createUser({
            email: dto.email,
            password: dto.password,
            email_confirm: true,
        });
        if (error)
            throw new common_1.BadRequestException(error.message);
        try {
            return await this.prisma.profile.create({
                data: {
                    id: authData.user.id,
                    email: dto.email,
                    fullName: dto.fullName,
                    role: dto.role ?? 'student',
                    isActive: true,
                },
            });
        }
        catch {
            await this.supabase.adminClient.auth.admin.deleteUser(authData.user.id);
            throw new common_1.BadRequestException('Failed to create user profile');
        }
    }
    async getUserStats() {
        const [total, students, instructors, admins, inactive] = await Promise.all([
            this.prisma.profile.count(),
            this.prisma.profile.count({ where: { role: 'student' } }),
            this.prisma.profile.count({ where: { role: 'instructor' } }),
            this.prisma.profile.count({ where: { role: 'admin' } }),
            this.prisma.profile.count({ where: { isActive: false } }),
        ]);
        return { total, students, instructors, admins, inactive };
    }
    async resetUserPassword(id, newPassword) {
        const { error } = await this.supabase.adminClient.auth.admin.updateUserById(id, {
            password: newPassword,
        });
        if (error)
            throw new common_1.BadRequestException(error.message);
        return { success: true };
    }
    async getMyActivity(userId, months) {
        const since = new Date();
        since.setMonth(since.getMonth() - months);
        const daily = await this.prisma.$queryRaw `
      SELECT d::date::text AS date, COALESCE(c.count, 0)::int AS count FROM
      generate_series(${since}::date, CURRENT_DATE, '1 day'::interval) d
      LEFT JOIN (
        SELECT completed_at::date AS day, COUNT(*)::int AS count FROM (
          SELECT completed_at FROM lesson_progress
          WHERE user_id = ${userId}::uuid AND is_completed = true AND completed_at >= ${since}
          UNION ALL
          SELECT submitted_at AS completed_at FROM quiz_attempts
          WHERE user_id = ${userId}::uuid AND status = 'submitted' AND submitted_at >= ${since}
        ) actions GROUP BY day
      ) c ON c.day = d::date
      ORDER BY date
    `;
        return { daily };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        supabase_service_1.SupabaseService,
        event_emitter_1.EventEmitter2])
], UsersService);
//# sourceMappingURL=users.service.js.map