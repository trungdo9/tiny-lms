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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where: { userId } }),
        ]);
        return {
            notifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getUnreadCount(userId) {
        return this.prisma.notification.count({
            where: { userId, isRead: false },
        });
    }
    async markAsRead(id, userId) {
        return this.prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
    async create(data) {
        return this.prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                data: data.data,
            },
        });
    }
    async notifyQuizResult(userId, quizTitle, score, isPassed) {
        return this.create({
            userId,
            type: 'quiz_result',
            title: isPassed ? 'Quiz Passed!' : 'Quiz Result Available',
            message: `You scored ${score}% on "${quizTitle}"`,
            data: { quizTitle, score, isPassed },
        });
    }
    async notifyGradingComplete(userId, quizTitle) {
        return this.create({
            userId,
            type: 'grading_complete',
            title: 'Grading Complete',
            message: `Your "${quizTitle}" has been graded`,
            data: { quizTitle },
        });
    }
    async notifyEnrollment(instructorId, courseTitle, studentName) {
        return this.create({
            userId: instructorId,
            type: 'enrollment',
            title: 'New Student Enrolled',
            message: `${studentName} enrolled in "${courseTitle}"`,
            data: { courseTitle, studentName },
        });
    }
    async notifyCoursePublished(studentIds, courseTitle) {
        const notifications = studentIds.map(userId => ({
            userId,
            type: 'course_published',
            title: 'Course Available',
            message: `"${courseTitle}" is now available`,
            data: { courseTitle },
        }));
        return this.prisma.notification.createMany({
            data: notifications,
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map