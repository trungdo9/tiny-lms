import { Injectable, NotFoundException, BadRequestException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma.service';
import { CONTACT_SYNC_EVENTS } from '../contact-sync/contact-sync.events';

@Injectable()
export class EnrollmentsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async enroll(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, isFree: true, price: true, status: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.status !== 'published') {
      throw new BadRequestException('Cannot enroll in an unpublished course');
    }

    // Block direct enrollment for paid courses — must go through payment
    if (!course.isFree) {
      throw new HttpException(
        {
          message: 'Payment required for this course',
          error: 'Payment Required',
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          courseId,
          amount: course.price,
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    // Check if already enrolled
    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existing) {
      throw new BadRequestException('Already enrolled in this course');
    }

    const enrollment = await this.prisma.enrollment.create({
      data: { userId, courseId },
    });

    this.eventEmitter.emit(CONTACT_SYNC_EVENTS.ENROLLMENT_CREATED, { userId, courseId });

    return enrollment;
  }

  async checkEnrollment(courseId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: { course: { select: { title: true, slug: true } } },
    });

    if (!enrollment) {
      return { isEnrolled: false };
    }

    return { isEnrolled: true, enrollment };
  }

  async findByUser(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true, title: true, slug: true, thumbnailUrl: true,
            level: true, description: true,
            instructor: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async findByCourse(courseId: string, userId: string) {
    // Verify course ownership
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, instructorId: true },
    });

    if (!course || course.instructorId !== userId) {
      throw new ForbiddenException('You can only view enrollments for your own courses');
    }

    return this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true } },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async unenroll(courseId: string, userId: string) {
    await this.prisma.enrollment.delete({
      where: { userId_courseId: { userId, courseId } },
    }).catch(() => {
      throw new BadRequestException('Enrollment not found');
    });

    return { success: true };
  }

  async bulkEnroll(courseId: string, userIds: string[]) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, status: true },
    });

    if (!course) throw new NotFoundException('Course not found');
    if (course.status !== 'published') {
      throw new BadRequestException('Cannot enroll in an unpublished course');
    }

    // Find already enrolled users
    const existing = await this.prisma.enrollment.findMany({
      where: { courseId, userId: { in: userIds } },
      select: { userId: true },
    });
    const existingIds = new Set(existing.map((e) => e.userId));
    const newUserIds = userIds.filter((id) => !existingIds.has(id));

    if (newUserIds.length === 0) {
      return { enrolled: 0, skipped: userIds.length };
    }

    await this.prisma.enrollment.createMany({
      data: newUserIds.map((userId) => ({ userId, courseId })),
      skipDuplicates: true,
    });

    for (const uid of newUserIds) {
      this.eventEmitter.emit(CONTACT_SYNC_EVENTS.ENROLLMENT_CREATED, { userId: uid, courseId });
    }

    return { enrolled: newUserIds.length, skipped: existingIds.size };
  }
}
