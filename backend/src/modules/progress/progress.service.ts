import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ProgressService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async markComplete(lessonId: string, userId: string) {
    const lesson = await this.getLessonWithAccessCheck(lessonId, userId);

    // Check if already completed
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

  async savePosition(lessonId: string, position: number, userId: string) {
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

  async getCourseProgress(courseId: string, userId: string) {
    // Verify enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment) {
      throw new ForbiddenException('You must be enrolled to view progress');
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

  async getLessonProgress(lessonId: string, userId: string) {
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

  private async getLessonWithAccessCheck(lessonId: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, courseId: true, isPreview: true },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (!lesson.isPreview) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: lesson.courseId } },
      });

      if (!enrollment) {
        throw new ForbiddenException('You must be enrolled to track progress');
      }
    }

    return lesson;
  }
}
