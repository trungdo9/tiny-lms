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
exports.ProgressService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../../common/prisma.service");
let ProgressService = class ProgressService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async markComplete(lessonId, userId) {
        const lesson = await this.getLessonWithAccessCheck(lessonId, userId);
        const existing = await this.prisma.lessonProgress.findUnique({
            where: { userId_lessonId: { userId, lessonId } },
        });
        if (existing?.isCompleted) {
            return { success: true, message: 'Lesson already completed' };
        }
        const result = await this.prisma.lessonProgress.upsert({
            where: { userId_lessonId: { userId, lessonId } },
            update: { isCompleted: true, completedAt: new Date() },
            create: {
                userId,
                lessonId,
                courseId: lesson.courseId,
                isCompleted: true,
                completedAt: new Date(),
            },
        });
        this.eventEmitter.emit('lesson.completed', { userId, courseId: lesson.courseId });
        return result;
    }
    async savePosition(lessonId, position, userId) {
        const lesson = await this.getLessonWithAccessCheck(lessonId, userId);
        return this.prisma.lessonProgress.upsert({
            where: { userId_lessonId: { userId, lessonId } },
            update: { lastPosition: position },
            create: {
                userId,
                lessonId,
                courseId: lesson.courseId,
                lastPosition: position,
            },
        });
    }
    async getCourseProgress(courseId, userId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });
        if (!enrollment) {
            throw new common_1.ForbiddenException('You must be enrolled to view progress');
        }
        const [totalLessons, progress] = await Promise.all([
            this.prisma.lesson.count({
                where: { courseId, isPublished: true },
            }),
            this.prisma.lessonProgress.findMany({
                where: { courseId, userId },
            }),
        ]);
        const completedLessons = progress.filter((p) => p.isCompleted).length;
        const completionPercentage = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;
        return {
            courseId,
            totalLessons,
            completedLessons,
            completionPercentage,
            lessons: progress,
        };
    }
    async getLessonProgress(lessonId, userId) {
        const progress = await this.prisma.lessonProgress.findUnique({
            where: { userId_lessonId: { userId, lessonId } },
        });
        if (!progress) {
            return { isCompleted: false, lastPosition: 0 };
        }
        return {
            isCompleted: progress.isCompleted,
            lastPosition: progress.lastPosition,
            completedAt: progress.completedAt,
        };
    }
    async getLessonWithAccessCheck(lessonId, userId) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            select: { id: true, courseId: true, isPreview: true },
        });
        if (!lesson) {
            throw new common_1.NotFoundException('Lesson not found');
        }
        if (!lesson.isPreview) {
            const enrollment = await this.prisma.enrollment.findUnique({
                where: { userId_courseId: { userId, courseId: lesson.courseId } },
            });
            if (!enrollment) {
                throw new common_1.ForbiddenException('You must be enrolled to track progress');
            }
        }
        return lesson;
    }
};
exports.ProgressService = ProgressService;
exports.ProgressService = ProgressService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], ProgressService);
//# sourceMappingURL=progress.service.js.map