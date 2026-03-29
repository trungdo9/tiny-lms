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
exports.EnrollmentsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../../common/prisma.service");
const contact_sync_events_1 = require("../contact-sync/contact-sync.events");
let EnrollmentsService = class EnrollmentsService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async enroll(courseId, userId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true, title: true, isFree: true, price: true, status: true },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (course.status !== 'published') {
            throw new common_1.BadRequestException('Cannot enroll in an unpublished course');
        }
        if (!course.isFree) {
            throw new common_1.HttpException({
                message: 'Payment required for this course',
                error: 'Payment Required',
                statusCode: common_1.HttpStatus.PAYMENT_REQUIRED,
                courseId,
                amount: course.price,
            }, common_1.HttpStatus.PAYMENT_REQUIRED);
        }
        const existing = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });
        if (existing) {
            throw new common_1.BadRequestException('Already enrolled in this course');
        }
        const enrollment = await this.prisma.enrollment.create({
            data: { userId, courseId },
        });
        this.eventEmitter.emit(contact_sync_events_1.CONTACT_SYNC_EVENTS.ENROLLMENT_CREATED, { userId, courseId });
        return enrollment;
    }
    async checkEnrollment(courseId, userId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
            include: { course: { select: { title: true, slug: true } } },
        });
        if (!enrollment) {
            return { isEnrolled: false };
        }
        return { isEnrolled: true, enrollment };
    }
    async findByUser(userId) {
        return this.prisma.enrollment.findMany({
            where: { userId },
            include: {
                course: {
                    select: {
                        id: true, title: true, slug: true, thumbnailUrl: true,
                        level: true, description: true,
                        instructor: { select: { id: true, fullName: true, avatarUrl: true } },
                    },
                },
            },
            orderBy: { enrolledAt: 'desc' },
        });
    }
    async findByCourse(courseId, userId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true, instructorId: true },
        });
        if (!course || course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You can only view enrollments for your own courses');
        }
        return this.prisma.enrollment.findMany({
            where: { courseId },
            include: {
                user: { select: { id: true, fullName: true, avatarUrl: true } },
            },
            orderBy: { enrolledAt: 'desc' },
        });
    }
    async unenroll(courseId, userId) {
        await this.prisma.enrollment.delete({
            where: { userId_courseId: { userId, courseId } },
        }).catch(() => {
            throw new common_1.BadRequestException('Enrollment not found');
        });
        return { success: true };
    }
    async bulkEnroll(courseId, userIds) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true, status: true },
        });
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        if (course.status !== 'published') {
            throw new common_1.BadRequestException('Cannot enroll in an unpublished course');
        }
        const existing = await this.prisma.enrollment.findMany({
            where: { courseId, userId: { in: userIds } },
            select: { userId: true },
        });
        const existingIds = new Set(existing.map((e) => e.userId));
        const newUserIds = userIds.filter((id) => !existingIds.has(id));
        if (newUserIds.length === 0) {
            return { enrolled: 0, skipped: userIds.length };
        }
        await this.prisma.enrollment.createMany({
            data: newUserIds.map((userId) => ({ userId, courseId })),
            skipDuplicates: true,
        });
        for (const uid of newUserIds) {
            this.eventEmitter.emit(contact_sync_events_1.CONTACT_SYNC_EVENTS.ENROLLMENT_CREATED, { userId: uid, courseId });
        }
        return { enrolled: newUserIds.length, skipped: existingIds.size };
    }
};
exports.EnrollmentsService = EnrollmentsService;
exports.EnrollmentsService = EnrollmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], EnrollmentsService);
//# sourceMappingURL=enrollments.service.js.map