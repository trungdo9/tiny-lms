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
exports.ActivitiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let ActivitiesService = class ActivitiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, lessonId, dto) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { course: true },
        });
        if (!lesson)
            throw new common_1.NotFoundException('Lesson not found');
        if (lesson.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You can only create activities for your own lessons');
        }
        const activity = await this.prisma.activity.create({
            data: {
                lessonId,
                activityType: dto.activityType,
                title: dto.title,
                isPublished: dto.isPublished ?? false,
                contentUrl: dto.contentUrl,
                contentType: dto.contentType,
            },
            include: {
                quiz: true,
                flashCardDeck: true,
            },
        });
        return activity;
    }
    async findByLesson(lessonId) {
        return this.prisma.activity.findMany({
            where: { lessonId },
            include: {
                quiz: {
                    include: { _count: { select: { questions: true } } },
                },
                flashCardDeck: {
                    include: { _count: { select: { cards: true } } },
                },
            },
            orderBy: { orderIndex: 'asc' },
        });
    }
    async findById(activityId) {
        const activity = await this.prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                quiz: {
                    include: { questions: true, _count: { select: { attempts: true } } },
                },
                flashCardDeck: {
                    include: { cards: true, _count: { select: { studySessions: true } } },
                },
            },
        });
        if (!activity)
            throw new common_1.NotFoundException('Activity not found');
        return activity;
    }
    async update(userId, activityId, dto) {
        const activity = await this.prisma.activity.findUnique({
            where: { id: activityId },
            include: { lesson: { include: { course: true } } },
        });
        if (!activity)
            throw new common_1.NotFoundException('Activity not found');
        if (activity.lesson.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You can only edit your own activities');
        }
        return this.prisma.activity.update({
            where: { id: activityId },
            data: {
                title: dto.title,
                isPublished: dto.isPublished,
                contentUrl: dto.contentUrl,
                contentType: dto.contentType,
            },
            include: {
                quiz: true,
                flashCardDeck: true,
            },
        });
    }
    async delete(userId, activityId) {
        const activity = await this.prisma.activity.findUnique({
            where: { id: activityId },
            include: { lesson: { include: { course: true } } },
        });
        if (!activity)
            throw new common_1.NotFoundException('Activity not found');
        if (activity.lesson.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own activities');
        }
        if (activity.activityType === 'quiz') {
            await this.prisma.quiz.deleteMany({ where: { activityId } });
        }
        else if (activity.activityType === 'flashcard') {
            await this.prisma.flashCardDeck.deleteMany({ where: { activityId } });
        }
        await this.prisma.activity.delete({ where: { id: activityId } });
        return { success: true };
    }
    async reorder(userId, lessonId, activityIds) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { course: true },
        });
        if (!lesson)
            throw new common_1.NotFoundException('Lesson not found');
        if (lesson.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You can only reorder activities in your own lessons');
        }
        await this.prisma.$transaction(activityIds.map((id, index) => this.prisma.activity.update({
            where: { id },
            data: { orderIndex: index },
        })));
        return { success: true };
    }
};
exports.ActivitiesService = ActivitiesService;
exports.ActivitiesService = ActivitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivitiesService);
//# sourceMappingURL=activities.service.js.map