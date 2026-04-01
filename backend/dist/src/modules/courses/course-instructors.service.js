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
let CourseInstructorsService = class CourseInstructorsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(courseId) {
        return this.prisma.courseInstructor.findMany({
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CourseInstructorsService);
//# sourceMappingURL=course-instructors.service.js.map