import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { PrismaService } from '../../common/prisma.service';
import { createMockPrismaService, MockPrismaService } from '../../../test/helpers/mock-prisma';
import { buildCourse } from '../../../test/helpers/mock-factories';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: MockPrismaService;

  const instructorId = 'instructor-1';

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  describe('getAdminDashboard', () => {
    it('should return aggregated admin statistics', async () => {
      prisma.profile.count.mockResolvedValueOnce(100).mockResolvedValueOnce(42);
      prisma.course.count.mockResolvedValue(20);
      prisma.enrollment.count.mockResolvedValue(500);
      prisma.payment.aggregate.mockResolvedValue({ _sum: { amount: 50000000 } });
      prisma.payment.count.mockResolvedValue(5);

      const result = await service.getAdminDashboard();

      expect(result).toEqual({
        totalUsers: 100,
        totalCourses: 20,
        totalEnrollments: 500,
        activeUsers30d: 42,
        totalRevenue: 50000000,
        pendingPayments: 5,
      });
    });

    it('should handle zero revenue', async () => {
      prisma.profile.count.mockResolvedValue(0);
      prisma.course.count.mockResolvedValue(0);
      prisma.enrollment.count.mockResolvedValue(0);
      prisma.payment.aggregate.mockResolvedValue({ _sum: { amount: null } });
      prisma.payment.count.mockResolvedValue(0);

      const result = await service.getAdminDashboard();

      expect(result.totalRevenue).toBe(0);
    });
  });

  describe('getAdminTrends', () => {
    it('should return user growth and enrollment trends', async () => {
      prisma.$queryRaw
        .mockResolvedValueOnce([{ month: '2026-01', count: 10 }])
        .mockResolvedValueOnce([{ month: '2026-01', count: 25 }]);

      const result = await service.getAdminTrends(6);

      expect(result).toHaveProperty('userGrowth');
      expect(result).toHaveProperty('enrollmentTrends');
    });
  });

  describe('getTopCourses', () => {
    it('should return courses ordered by enrollment count', async () => {
      prisma.course.findMany.mockResolvedValue([
        { id: 'c1', title: 'Course 1', _count: { enrollments: 50 } },
        { id: 'c2', title: 'Course 2', _count: { enrollments: 30 } },
      ]);

      const result = await service.getTopCourses(5);

      expect(result.courses).toHaveLength(2);
      expect(result.courses[0].enrollments).toBe(50);
    });
  });

  describe('getRevenueStats', () => {
    it('should return monthly revenue and total', async () => {
      prisma.$queryRaw.mockResolvedValue([
        { month: '2026-01', revenue: 1000000 },
        { month: '2026-02', revenue: 2000000 },
      ]);

      const result = await service.getRevenueStats(6);

      expect(result.total).toBe(3000000);
      expect(result.monthly).toHaveLength(2);
    });
  });

  describe('getInstructorTrends', () => {
    it('should return empty arrays when instructor has no courses', async () => {
      prisma.course.findMany.mockResolvedValue([]);

      const result = await service.getInstructorTrends(instructorId, 6);

      expect(result).toEqual({ enrollmentTrends: [], quizAttemptTrends: [] });
    });
  });

  describe('getInstructorDashboard', () => {
    it('should return instructor stats', async () => {
      prisma.course.findMany.mockResolvedValue([
        { id: 'c1', title: 'Course 1', _count: { enrollments: 10, sections: 3 } },
      ]);
      prisma.quiz.findMany.mockResolvedValue([
        { id: 'q1', _count: { attempts: 5 } },
      ]);
      prisma.quizAttempt.findMany
        .mockResolvedValueOnce([]) // recent attempts
        .mockResolvedValueOnce([]) // all attempts
        .mockResolvedValueOnce([]); // pending grading
      prisma.quizAttempt.findMany.mockResolvedValue([]);

      const result = await service.getInstructorDashboard(instructorId);

      expect(result.stats.totalCourses).toBe(1);
      expect(result.stats.totalEnrollments).toBe(10);
    });
  });

  describe('getCourseReport', () => {
    it('should throw NotFoundException if course not found', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      await expect(service.getCourseReport('c1', instructorId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not course owner', async () => {
      prisma.course.findUnique.mockResolvedValue(
        buildCourse({ id: 'c1', instructorId: 'other-user' }),
      );
      await expect(service.getCourseReport('c1', instructorId)).rejects.toThrow(ForbiddenException);
    });

    it('should return course report with stats and students', async () => {
      prisma.course.findUnique.mockResolvedValue(
        buildCourse({ id: 'c1', instructorId }),
      );
      prisma.enrollment.findMany.mockResolvedValue([
        { userId: 'u1', enrolledAt: new Date(), user: { id: 'u1', fullName: 'Student 1' } },
      ]);
      prisma.lesson.count.mockResolvedValue(10);
      prisma.lesson.findMany.mockResolvedValue([{ id: 'l1' }]);
      prisma.lessonProgress.findMany.mockResolvedValue([
        { userId: 'u1', lessonId: 'l1', isCompleted: true },
      ]);
      prisma.quiz.findMany.mockResolvedValue([]);

      const result = await service.getCourseReport('c1', instructorId);

      expect(result.course.id).toBe('c1');
      expect(result.stats.totalEnrollments).toBe(1);
      expect(result.students).toHaveLength(1);
    });
  });

  describe('getQuizReport', () => {
    it('should throw NotFoundException if quiz not found', async () => {
      prisma.quiz.findUnique.mockResolvedValue(null);
      await expect(service.getQuizReport('q1', instructorId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not quiz course owner', async () => {
      prisma.quiz.findUnique.mockResolvedValue({
        id: 'q1',
        course: { instructorId: 'other-user' },
      });
      await expect(service.getQuizReport('q1', instructorId)).rejects.toThrow(ForbiddenException);
    });

    it('should return quiz report with score distribution', async () => {
      prisma.quiz.findUnique.mockResolvedValue({
        id: 'q1',
        title: 'Test Quiz',
        course: { instructorId },
      });
      prisma.quizAttempt.findMany.mockResolvedValue([
        {
          id: 'a1',
          percentage: 85,
          isPassed: true,
          maxScore: 100,
          totalScore: 85,
          status: 'submitted',
          startedAt: new Date('2026-01-01T10:00:00Z'),
          submittedAt: new Date('2026-01-01T10:15:00Z'),
          user: { fullName: 'Student 1' },
        },
      ]);

      const result = await service.getQuizReport('q1', instructorId);

      expect(result.quiz.title).toBe('Test Quiz');
      expect(result.stats.totalAttempts).toBe(1);
      expect(result.stats.passedAttempts).toBe(1);
      expect(result.scoreDistribution).toHaveLength(5);
    });
  });
});
