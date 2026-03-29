import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../../common/prisma.service';
import { createMockPrismaService, MockPrismaService } from '../../../test/helpers/mock-prisma';
import { buildCourse, buildEnrollment, buildReview, buildUser } from '../../../test/helpers/mock-factories';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: MockPrismaService;

  const courseId = 'course-1';
  const userId = 'user-1';
  const reviewId = 'review-1';

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  describe('upsert', () => {
    const dto = { rating: 5, comment: 'Great!' };

    it('should create a review when enrolled', async () => {
      const course = buildCourse({ id: courseId });
      const enrollment = buildEnrollment({ courseId, userId });
      const review = buildReview({ courseId, userId, rating: 5, comment: 'Great!' });

      prisma.course.findUnique.mockResolvedValue(course);
      prisma.enrollment.findFirst.mockResolvedValue(enrollment);
      prisma.courseReview.upsert.mockResolvedValue(review);
      prisma.courseReview.aggregate.mockResolvedValue({ _avg: { rating: 5 }, _count: { rating: 1 } });
      prisma.course.update.mockResolvedValue(course);

      const result = await service.upsert(courseId, userId, dto);

      expect(result).toEqual(review);
      expect(prisma.courseReview.upsert).toHaveBeenCalledWith({
        where: { courseId_userId: { courseId, userId } },
        create: { courseId, userId, rating: 5, comment: 'Great!' },
        update: { rating: 5, comment: 'Great!' },
      });
    });

    it('should throw NotFoundException if course not found', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      await expect(service.upsert(courseId, userId, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not enrolled', async () => {
      prisma.course.findUnique.mockResolvedValue(buildCourse({ id: courseId }));
      prisma.enrollment.findFirst.mockResolvedValue(null);
      await expect(service.upsert(courseId, userId, dto)).rejects.toThrow(ForbiddenException);
    });

    it('should recompute course rating after upsert', async () => {
      prisma.course.findUnique.mockResolvedValue(buildCourse({ id: courseId }));
      prisma.enrollment.findFirst.mockResolvedValue(buildEnrollment({ courseId, userId }));
      prisma.courseReview.upsert.mockResolvedValue(buildReview());
      prisma.courseReview.aggregate.mockResolvedValue({ _avg: { rating: 4.5 }, _count: { rating: 2 } });
      prisma.course.update.mockResolvedValue({});

      await service.upsert(courseId, userId, dto);

      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: courseId },
        data: { averageRating: 4.5, totalReviews: 2 },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated reviews with user data', async () => {
      const reviews = [buildReview({ user: buildUser() })];
      prisma.courseReview.findMany.mockResolvedValue(reviews);
      prisma.courseReview.count.mockResolvedValue(1);

      const result = await service.findAll(courseId, 1, 10);

      expect(result.reviews).toEqual(reviews);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('should calculate correct offset for page 2', async () => {
      prisma.courseReview.findMany.mockResolvedValue([]);
      prisma.courseReview.count.mockResolvedValue(15);

      await service.findAll(courseId, 2, 10);

      expect(prisma.courseReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  describe('getStats', () => {
    it('should return average rating and distribution', async () => {
      prisma.courseReview.aggregate.mockResolvedValue({
        _avg: { rating: 4.2 },
        _count: { rating: 5 },
      });
      prisma.courseReview.groupBy.mockResolvedValue([
        { rating: 5, _count: { rating: 3 } },
        { rating: 4, _count: { rating: 1 } },
        { rating: 3, _count: { rating: 1 } },
      ]);

      const result = await service.getStats(courseId);

      expect(result.averageRating).toBe(4.2);
      expect(result.totalReviews).toBe(5);
      expect(result.distribution).toEqual({ '1': 0, '2': 0, '3': 1, '4': 1, '5': 3 });
    });

    it('should return null average when no reviews', async () => {
      prisma.courseReview.aggregate.mockResolvedValue({
        _avg: { rating: null },
        _count: { rating: 0 },
      });
      prisma.courseReview.groupBy.mockResolvedValue([]);

      const result = await service.getStats(courseId);

      expect(result.averageRating).toBeNull();
      expect(result.totalReviews).toBe(0);
    });
  });

  describe('delete', () => {
    it('should allow owner to delete their review', async () => {
      const review = buildReview({ id: reviewId, courseId, userId });
      prisma.courseReview.findFirst.mockResolvedValue(review);
      prisma.courseReview.delete.mockResolvedValue(review);
      prisma.courseReview.aggregate.mockResolvedValue({ _avg: { rating: null }, _count: { rating: 0 } });
      prisma.course.update.mockResolvedValue({});

      const result = await service.delete(courseId, reviewId, userId, 'student');

      expect(result).toEqual({ deleted: true });
      expect(prisma.courseReview.delete).toHaveBeenCalledWith({ where: { id: reviewId } });
    });

    it('should allow admin to delete any review', async () => {
      const review = buildReview({ id: reviewId, courseId, userId: 'other-user' });
      prisma.courseReview.findFirst.mockResolvedValue(review);
      prisma.courseReview.delete.mockResolvedValue(review);
      prisma.courseReview.aggregate.mockResolvedValue({ _avg: { rating: null }, _count: { rating: 0 } });
      prisma.course.update.mockResolvedValue({});

      const result = await service.delete(courseId, reviewId, 'admin-user', 'admin');

      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException if review not found', async () => {
      prisma.courseReview.findFirst.mockResolvedValue(null);
      await expect(service.delete(courseId, reviewId, userId, 'student')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner and not admin', async () => {
      const review = buildReview({ id: reviewId, courseId, userId: 'other-user' });
      prisma.courseReview.findFirst.mockResolvedValue(review);
      await expect(service.delete(courseId, reviewId, userId, 'student')).rejects.toThrow(ForbiddenException);
    });
  });
});
