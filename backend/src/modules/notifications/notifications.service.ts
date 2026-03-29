import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, page = 1, limit = 20) {
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

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async create(data: {
    userId: string;
    type: string;
    title: string;
    message?: string;
    data?: any;
  }) {
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

  async notifyQuizResult(userId: string, quizTitle: string, score: number, isPassed: boolean) {
    return this.create({
      userId,
      type: 'quiz_result',
      title: isPassed ? 'Quiz Passed!' : 'Quiz Result Available',
      message: `You scored ${score}% on "${quizTitle}"`,
      data: { quizTitle, score, isPassed },
    });
  }

  async notifyGradingComplete(userId: string, quizTitle: string) {
    return this.create({
      userId,
      type: 'grading_complete',
      title: 'Grading Complete',
      message: `Your "${quizTitle}" has been graded`,
      data: { quizTitle },
    });
  }

  async notifyEnrollment(instructorId: string, courseTitle: string, studentName: string) {
    return this.create({
      userId: instructorId,
      type: 'enrollment',
      title: 'New Student Enrolled',
      message: `${studentName} enrolled in "${courseTitle}"`,
      data: { courseTitle, studentName },
    });
  }

  async notifyCoursePublished(studentIds: string[], courseTitle: string) {
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
}
