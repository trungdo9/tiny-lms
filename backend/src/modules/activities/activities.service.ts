import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CoursesService } from '../courses/courses.service';
import { CreateActivityDto, UpdateActivityDto } from './dto/activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    private prisma: PrismaService,
    private coursesService: CoursesService,
  ) { }

  // ─── Create ────────────────────────────────────────────────────────────────

  async create(userId: string, lessonId: string, dto: CreateActivityDto, userRole: string = 'student') {
    // Verify lesson ownership
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    });

    if (!lesson) throw new NotFoundException('Lesson not found');
    if (!(await this.coursesService.canManageCourse(lesson.course.id, userId, userRole))) {
      throw new ForbiddenException('You can only create activities for courses you are assigned to');
    }

    // Create activity
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

  // ─── Read ─────────────────────────────────────────────────────────────────

  async findByLesson(lessonId: string) {
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

  async findById(activityId: string) {
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

    if (!activity) throw new NotFoundException('Activity not found');
    return activity;
  }

  // ─── Update ────────────────────────────────────────────────────────────────

  async update(userId: string, activityId: string, dto: UpdateActivityDto, userRole: string = 'student') {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      include: { lesson: { include: { course: true } } },
    });

    if (!activity) throw new NotFoundException('Activity not found');
    if (!(await this.coursesService.canManageCourse(activity.lesson.course.id, userId, userRole))) {
      throw new ForbiddenException('You can only edit activities in courses you are assigned to');
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

  // ─── Delete ────────────────────────────────────────────────────────────────

  async delete(userId: string, activityId: string, userRole: string = 'student') {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      include: { lesson: { include: { course: true } } },
    });

    if (!activity) throw new NotFoundException('Activity not found');
    if (!(await this.coursesService.canManageCourse(activity.lesson.course.id, userId, userRole))) {
      throw new ForbiddenException('You can only delete activities in courses you are assigned to');
    }

    // Delete related content based on type
    if (activity.activityType === 'quiz') {
      await this.prisma.quiz.deleteMany({ where: { activityId } });
    } else if (activity.activityType === 'flashcard') {
      await this.prisma.flashCardDeck.deleteMany({ where: { activityId } });
    }

    await this.prisma.activity.delete({ where: { id: activityId } });
    return { success: true };
  }

  // ─── Reorder ─────────────────────────────────────────────────────────────

  async reorder(userId: string, lessonId: string, activityIds: string[], userRole: string = 'student') {
    // Verify lesson ownership
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    });

    if (!lesson) throw new NotFoundException('Lesson not found');
    if (!(await this.coursesService.canManageCourse(lesson.course.id, userId, userRole))) {
      throw new ForbiddenException('You can only reorder activities in courses you are assigned to');
    }

    // Update order for each activity
    await this.prisma.$transaction(
      activityIds.map((id, index) =>
        this.prisma.activity.update({
          where: { id },
          data: { orderIndex: index },
        }),
      ),
    );

    return { success: true };
  }
}
