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
const courses_service_1 = require("../courses/courses.service");
let ActivitiesService = class ActivitiesService {
    prisma;
    coursesService;
    constructor(prisma, coursesService) {
        this.prisma = prisma;
        this.coursesService = coursesService;
    }
    async create(userId, lessonId, dto, userRole = 'student') {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { course: true },
        });
        if (!lesson)
            throw new common_1.NotFoundException('Lesson not found');
        if (!(await this.coursesService.canManageCourse(lesson.course.id, userId, userRole))) {
            throw new common_1.ForbiddenException('You can only create activities for courses you are assigned to');
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
    async update(userId, activityId, dto, userRole = 'student') {
        const activity = await this.prisma.activity.findUnique({
            where: { id: activityId },
            include: { lesson: { include: { course: true } } },
        });
        if (!activity)
            throw new common_1.NotFoundException('Activity not found');
        if (!(await this.coursesService.canManageCourse(activity.lesson.course.id, userId, userRole))) {
            throw new common_1.ForbiddenException('You can only edit activities in courses you are assigned to');
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
    async delete(userId, activityId, userRole = 'student') {
        const activity = await this.prisma.activity.findUnique({
            where: { id: activityId },
            include: { lesson: { include: { course: true } } },
        });
        if (!activity)
            throw new common_1.NotFoundException('Activity not found');
        if (!(await this.coursesService.canManageCourse(activity.lesson.course.id, userId, userRole))) {
            throw new common_1.ForbiddenException('You can only delete activities in courses you are assigned to');
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
    async reorder(userId, lessonId, activityIds, userRole = 'student') {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { course: true },
        });
        if (!lesson)
            throw new common_1.NotFoundException('Lesson not found');
        if (!(await this.coursesService.canManageCourse(lesson.course.id, userId, userRole))) {
            throw new common_1.ForbiddenException('You can only reorder activities in courses you are assigned to');
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        courses_service_1.CoursesService])
], ActivitiesService);
//# sourceMappingURL=activities.service.js.map