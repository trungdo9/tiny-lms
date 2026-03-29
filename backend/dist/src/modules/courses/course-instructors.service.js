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
exports.CourseInstructorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const supabase_service_1 = require("../../common/supabase.service");
let CourseInstructorsService = class CourseInstructorsService {
    prisma;
    supabaseService;
    constructor(prisma, supabaseService) {
        this.prisma = prisma;
        this.supabaseService = supabaseService;
    }
    shouldUseSupabaseFallback(error) {
        return ['ENETUNREACH', 'P1001'].includes(error?.code)
            || /ENETUNREACH|Can't reach database server|connect ENETUNREACH/i.test(String(error?.message || ''));
    }
    async list(courseId) {
        try {
            const rows = await this.prisma.courseInstructor.findMany({
                where: { courseId },
                select: {
                    id: true,
                    role: true,
                    addedAt: true,
                    profile: {
                        select: { id: true, email: true, fullName: true, avatarUrl: true },
                    },
                },
                orderBy: [{ role: 'desc' }, { addedAt: 'asc' }],
            });
            return rows;
        }
        catch (error) {
            if (!this.shouldUseSupabaseFallback(error))
                throw error;
            const { data: instructors, error: instructorsError } = await this.supabaseService.adminClient
                .from('course_instructors')
                .select('id,role,added_at,profile_id')
                .eq('course_id', courseId)
                .order('role', { ascending: false })
                .order('added_at', { ascending: true });
            if (instructorsError)
                throw instructorsError;
            const profileIds = [...new Set((instructors || []).map((row) => row.profile_id).filter(Boolean))];
            const { data: profiles, error: profilesError } = profileIds.length
                ? await this.supabaseService.adminClient
                    .from('profiles')
                    .select('id,email,full_name,avatar_url')
                    .in('id', profileIds)
                : { data: [], error: null };
            if (profilesError)
                throw profilesError;
            const profileMap = new Map((profiles || []).map((profile) => [
                profile.id,
                {
                    id: profile.id,
                    email: profile.email,
                    fullName: profile.full_name,
                    avatarUrl: profile.avatar_url,
                },
            ]));
            return (instructors || []).map((row) => ({
                id: row.id,
                role: row.role,
                addedAt: row.added_at,
                profile: row.profile_id ? profileMap.get(row.profile_id) || null : null,
            }));
        }
    }
    async assign(courseId, dto, actorId, actorRole) {
        if (actorRole !== 'admin') {
            const actorMembership = await this.prisma.courseInstructor.findFirst({
                where: { courseId, profileId: actorId, role: 'primary' },
            });
            if (!actorMembership) {
                throw new common_1.ForbiddenException('Only the primary instructor or admin can assign instructors');
            }
        }
        const target = await this.prisma.profile.findUnique({ where: { id: dto.userId } });
        if (!target)
            throw new common_1.NotFoundException('User not found');
        const existing = await this.prisma.courseInstructor.findFirst({
            where: { courseId, profileId: dto.userId },
        });
        if (existing)
            throw new common_1.ConflictException('User is already an instructor for this course');
        return this.prisma.courseInstructor.create({
            data: {
                courseId,
                profileId: dto.userId,
                role: dto.role ?? 'co_instructor',
                addedBy: actorId,
            },
            include: {
                profile: { select: { id: true, email: true, fullName: true, avatarUrl: true } },
            },
        });
    }
    async remove(courseId, targetUserId, actorId, actorRole) {
        const target = await this.prisma.courseInstructor.findFirst({
            where: { courseId, profileId: targetUserId },
        });
        if (!target)
            throw new common_1.NotFoundException('Instructor not found on this course');
        if (actorRole !== 'admin') {
            const actorIsPrimary = await this.prisma.courseInstructor.findFirst({
                where: { courseId, profileId: actorId, role: 'primary' },
            });
            if (!actorIsPrimary) {
                throw new common_1.ForbiddenException('Only the primary instructor or admin can remove instructors');
            }
        }
        if (target.role === 'primary') {
            const primaryCount = await this.prisma.courseInstructor.count({
                where: { courseId, role: 'primary' },
            });
            if (primaryCount <= 1) {
                throw new common_1.BadRequestException('Cannot remove the only primary instructor. Assign a new primary first.');
            }
        }
        await this.prisma.courseInstructor.delete({ where: { id: target.id } });
        return { success: true };
    }
    async updateRole(courseId, targetUserId, dto, actorRole) {
        if (actorRole !== 'admin') {
            throw new common_1.ForbiddenException('Only admin can change instructor roles');
        }
        const target = await this.prisma.courseInstructor.findFirst({
            where: { courseId, profileId: targetUserId },
        });
        if (!target)
            throw new common_1.NotFoundException('Instructor not found on this course');
        return this.prisma.courseInstructor.update({
            where: { id: target.id },
            data: { role: dto.role },
            include: {
                profile: { select: { id: true, email: true, fullName: true, avatarUrl: true } },
            },
        });
    }
};
exports.CourseInstructorsService = CourseInstructorsService;
exports.CourseInstructorsService = CourseInstructorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        supabase_service_1.SupabaseService])
], CourseInstructorsService);
//# sourceMappingURL=course-instructors.service.js.map