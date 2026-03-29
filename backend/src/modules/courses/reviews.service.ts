import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async upsert(courseId: string, userId: string, dto: CreateReviewDto) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const enrollment = await this.prisma.enrollment.findFirst({
      where: { courseId, userId },
    });
    if (!enrollment) throw new ForbiddenException('You must be enrolled to review this course');

    const review = await this.prisma.courseReview.upsert({
      where: { courseId_userId: { courseId, userId } },
      create: { courseId, userId, rating: dto.rating, comment: dto.comment },
      update: { rating: dto.rating, comment: dto.comment },
    });

    await this.recomputeRating(courseId);
    return review;
  }

  async findAll(courseId: string, page = 1, limit = 10) {
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

  async getStats(courseId: string) {
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

    const distribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    for (const g of groups) {
      distribution[String(g.rating)] = g._count.rating;
    }

    return {
      averageRating: agg._avg.rating ?? null,
      totalReviews: agg._count.rating,
      distribution,
    };
  }

  async delete(courseId: string, reviewId: string, userId: string, userRole: string) {
    const review = await this.prisma.courseReview.findFirst({
      where: { id: reviewId, courseId },
    });
    if (!review) throw new NotFoundException('Review not found');

    if (review.userId !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.courseReview.delete({ where: { id: reviewId } });
    await this.recomputeRating(courseId);
    return { deleted: true };
  }

  private async recomputeRating(courseId: string) {
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
}
