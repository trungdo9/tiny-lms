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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsert(courseId, userId, dto) {
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        const enrollment = await this.prisma.enrollment.findFirst({
            where: { courseId, userId },
        });
        if (!enrollment)
            throw new common_1.ForbiddenException('You must be enrolled to review this course');
        const review = await this.prisma.courseReview.upsert({
            where: { courseId_userId: { courseId, userId } },
            create: { courseId, userId, rating: dto.rating, comment: dto.comment },
            update: { rating: dto.rating, comment: dto.comment },
        });
        await this.recomputeRating(courseId);
        return review;
    }
    async findAll(courseId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [reviews, total] = await Promise.all([
            this.prisma.courseReview.findMany({
                where: { courseId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    user: { select: { id: true, fullName: true, avatarUrl: true } },
                },
            }),
            this.prisma.courseReview.count({ where: { courseId } }),
        ]);
        return {
            reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getStats(courseId) {
        const agg = await this.prisma.courseReview.aggregate({
            where: { courseId },
            _avg: { rating: true },
            _count: { rating: true },
        });
        const groups = await this.prisma.courseReview.groupBy({
            by: ['rating'],
            where: { courseId },
            _count: { rating: true },
        });
        const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
        for (const g of groups) {
            distribution[String(g.rating)] = g._count.rating;
        }
        return {
            averageRating: agg._avg.rating ?? null,
            totalReviews: agg._count.rating,
            distribution,
        };
    }
    async delete(courseId, reviewId, userId, userRole) {
        const review = await this.prisma.courseReview.findFirst({
            where: { id: reviewId, courseId },
        });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        if (review.userId !== userId && userRole !== 'admin') {
            throw new common_1.ForbiddenException('You can only delete your own reviews');
        }
        await this.prisma.courseReview.delete({ where: { id: reviewId } });
        await this.recomputeRating(courseId);
        return { deleted: true };
    }
    async recomputeRating(courseId) {
        const agg = await this.prisma.courseReview.aggregate({
            where: { courseId },
            _avg: { rating: true },
            _count: { rating: true },
        });
        await this.prisma.course.update({
            where: { id: courseId },
            data: {
                averageRating: agg._avg.rating,
                totalReviews: agg._count.rating,
            },
        });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map