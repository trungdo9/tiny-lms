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
exports.LearningPathsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../../common/prisma.service");
const certificates_service_1 = require("../certificates/certificates.service");
const notifications_service_1 = require("../notifications/notifications.service");
let LearningPathsService = class LearningPathsService {
    prisma;
    eventEmitter;
    certificatesService;
    notificationsService;
    constructor(prisma, eventEmitter, certificatesService, notificationsService) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
        this.certificatesService = certificatesService;
        this.notificationsService = notificationsService;
    }
    async create(dto, userId) {
        const slug = dto.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            + '-' + Date.now().toString(36);
        return this.prisma.learningPath.create({
            data: {
                title: dto.title,
                slug,
                description: dto.description,
                thumbnailUrl: dto.thumbnailUrl,
                createdBy: userId,
            },
        });
    }
    async findAll(publishedOnly = true) {
        const where = publishedOnly ? { isPublished: true } : {};
        return this.prisma.learningPath.findMany({
            where,
            include: {
                creator: { select: { id: true, fullName: true, avatarUrl: true } },
                courses: {
                    include: {
                        course: {
                            select: { id: true, title: true, slug: true, thumbnailUrl: true, level: true },
                        },
                    },
                    orderBy: { orderIndex: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const path = await this.prisma.learningPath.findUnique({
            where: { id },
            include: {
                creator: { select: { id: true, fullName: true, avatarUrl: true } },
                courses: {
                    include: {
                        course: {
                            select: {
                                id: true, title: true, slug: true, thumbnailUrl: true,
                                level: true, description: true, lessonCount: true,
                            },
                        },
                    },
                    orderBy: { orderIndex: 'asc' },
                },
            },
        });
        if (!path)
            throw new common_1.NotFoundException('Learning path not found');
        return path;
    }
    async findOneWithProgress(id, userId) {
        const path = await this.findOne(id);
        const courseProgress = await Promise.all(path.courses.map(async (pc) => {
            const enrollment = await this.prisma.enrollment.findUnique({
                where: { userId_courseId: { userId, courseId: pc.courseId } },
            });
            if (!enrollment) {
                return { ...pc, isEnrolled: false, completionPercentage: 0 };
            }
            const [totalLessons, completedLessons] = await Promise.all([
                this.prisma.lesson.count({ where: { courseId: pc.courseId, isPublished: true } }),
                this.prisma.lessonProgress.count({
                    where: { courseId: pc.courseId, userId, isCompleted: true },
                }),
            ]);
            return {
                ...pc,
                isEnrolled: true,
                completionPercentage: totalLessons > 0
                    ? Math.round((completedLessons / totalLessons) * 100) : 0,
            };
        }));
        const requiredCourses = courseProgress.filter((c) => c.isRequired);
        const completedRequired = requiredCourses.filter((c) => c.completionPercentage === 100).length;
        const overallProgress = requiredCourses.length > 0
            ? Math.round((completedRequired / requiredCourses.length) * 100) : 0;
        return { ...path, courses: courseProgress, overallProgress };
    }
    async update(id, dto, userId, userRole) {
        await this.verifyOwnership(id, userId, userRole);
        const data = {};
        if (dto.title !== undefined)
            data.title = dto.title;
        if (dto.description !== undefined)
            data.description = dto.description;
        if (dto.thumbnailUrl !== undefined)
            data.thumbnailUrl = dto.thumbnailUrl;
        if (dto.isPublished !== undefined)
            data.isPublished = dto.isPublished;
        return this.prisma.learningPath.update({ where: { id }, data });
    }
    async delete(id, userId, userRole) {
        await this.verifyOwnership(id, userId, userRole);
        await this.prisma.learningPath.delete({ where: { id } });
        return { success: true };
    }
    async findMine(userId) {
        return this.prisma.learningPath.findMany({
            where: { createdBy: userId },
            include: {
                _count: { select: { courses: true, enrollments: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async enroll(pathId, userId) {
        const path = await this.prisma.learningPath.findUnique({
            where: { id: pathId },
            include: { courses: { select: { courseId: true } } },
        });
        if (!path)
            throw new common_1.NotFoundException('Learning path not found');
        if (!path.isPublished)
            throw new common_1.ForbiddenException('Learning path is not published');
        const existing = await this.prisma.learningPathEnrollment.findUnique({
            where: { learningPathId_studentId: { learningPathId: pathId, studentId: userId } },
        });
        if (!existing) {
            await this.prisma.learningPathEnrollment.create({
                data: { learningPathId: pathId, studentId: userId },
            });
        }
        let enrolled = 0, skipped = 0;
        for (const { courseId } of path.courses) {
            const courseEnrollment = await this.prisma.enrollment.findUnique({
                where: { userId_courseId: { userId, courseId } },
            });
            if (!courseEnrollment) {
                await this.prisma.enrollment.create({ data: { userId, courseId } });
                enrolled++;
            }
            else {
                skipped++;
            }
        }
        if (path.courses.length === 0) {
            await this.checkAndIssueCertificate(pathId, userId);
        }
        return { success: true, enrolled, skipped };
    }
    async checkAndIssueCertificate(pathId, userId) {
        const enrollment = await this.prisma.learningPathEnrollment.findUnique({
            where: { learningPathId_studentId: { learningPathId: pathId, studentId: userId } },
        });
        if (!enrollment || enrollment.completedAt)
            return;
        const path = await this.prisma.learningPath.findUnique({
            where: { id: pathId },
            include: { courses: { select: { courseId: true } } },
        });
        if (!path || path.courses.length === 0)
            return;
        const allCompleted = await Promise.all(path.courses.map(async ({ courseId }) => {
            const cert = await this.prisma.certificate.findUnique({
                where: { userId_courseId: { userId, courseId } },
            });
            return cert != null;
        }));
        if (allCompleted.every(Boolean)) {
            await this.prisma.learningPathEnrollment.update({
                where: { learningPathId_studentId: { learningPathId: pathId, studentId: userId } },
                data: { completedAt: new Date() },
            });
            try {
                await this.certificatesService.issuePathCertificate(userId, pathId);
                this.eventEmitter.emit('learning_path.completed', {
                    userId, pathId, pathTitle: path.title,
                });
            }
            catch {
            }
        }
    }
    async addCourse(pathId, dto, userId, userRole) {
        await this.verifyOwnership(pathId, userId, userRole);
        if (userRole === 'instructor') {
            const course = await this.prisma.course.findUnique({
                where: { id: dto.courseId },
                select: { instructorId: true },
            });
            if (!course)
                throw new common_1.NotFoundException('Course not found');
            if (course.instructorId !== userId) {
                throw new common_1.ForbiddenException('You can only add your own courses to a learning path');
            }
        }
        const last = await this.prisma.learningPathCourse.findFirst({
            where: { learningPathId: pathId },
            orderBy: { orderIndex: 'desc' },
            select: { orderIndex: true },
        });
        return this.prisma.learningPathCourse.create({
            data: {
                learningPathId: pathId,
                courseId: dto.courseId,
                orderIndex: last ? last.orderIndex + 1 : 0,
                isRequired: dto.isRequired ?? true,
            },
        });
    }
    async removeCourse(pathId, courseId, userId, userRole) {
        await this.verifyOwnership(pathId, userId, userRole);
        await this.prisma.learningPathCourse.delete({
            where: { learningPathId_courseId: { learningPathId: pathId, courseId } },
        });
        return { success: true };
    }
    async reorderCourses(pathId, courseIds, userId, userRole) {
        await this.verifyOwnership(pathId, userId, userRole);
        await this.prisma.$transaction(courseIds.map((courseId, index) => this.prisma.learningPathCourse.update({
            where: { learningPathId_courseId: { learningPathId: pathId, courseId } },
            data: { orderIndex: index },
        })));
        return { success: true };
    }
    async handlePathCompleted(payload) {
        try {
            await this.notificationsService.create({
                userId: payload.userId,
                type: 'path_completed',
                title: `You completed: ${payload.pathTitle}`,
                message: 'Congratulations on completing your learning path!',
            });
        }
        catch {
        }
    }
    async verifyOwnership(pathId, userId, userRole) {
        if (userRole === 'admin')
            return;
        const path = await this.prisma.learningPath.findUnique({
            where: { id: pathId },
            select: { createdBy: true },
        });
        if (!path)
            throw new common_1.NotFoundException('Learning path not found');
        if (path.createdBy !== userId) {
            throw new common_1.ForbiddenException('You can only manage your own learning paths');
        }
    }
};
exports.LearningPathsService = LearningPathsService;
__decorate([
    (0, event_emitter_1.OnEvent)('learning_path.completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LearningPathsService.prototype, "handlePathCompleted", null);
exports.LearningPathsService = LearningPathsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2,
        certificates_service_1.CertificatesService,
        notifications_service_1.NotificationsService])
], LearningPathsService);
//# sourceMappingURL=learning-paths.service.js.map