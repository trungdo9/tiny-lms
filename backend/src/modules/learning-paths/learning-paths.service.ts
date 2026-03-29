import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma.service';
import { CertificatesService } from '../certificates/certificates.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateLearningPathDto, UpdateLearningPathDto, AddCourseToPathDto } from './dto/learning-path.dto';

@Injectable()
export class LearningPathsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private certificatesService: CertificatesService,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateLearningPathDto, userId: string) {
    const slug = dto.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);

    return this.prisma.learningPath.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        thumbnailUrl: dto.thumbnailUrl,
        createdBy: userId,
      },
    });
  }

  async findAll(publishedOnly: boolean = true) {
    const where = publishedOnly ? { isPublished: true } : {};

    return this.prisma.learningPath.findMany({
      where,
      include: {
        creator: { select: { id: true, fullName: true, avatarUrl: true } },
        courses: {
          include: {
            course: {
              select: { id: true, title: true, slug: true, thumbnailUrl: true, level: true },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const path = await this.prisma.learningPath.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, fullName: true, avatarUrl: true } },
        courses: {
          include: {
            course: {
              select: {
                id: true, title: true, slug: true, thumbnailUrl: true,
                level: true, description: true, lessonCount: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!path) throw new NotFoundException('Learning path not found');
    return path;
  }

  async findOneWithProgress(id: string, userId: string) {
    const path = await this.findOne(id);

    // Calculate progress for each course
    const courseProgress = await Promise.all(
      path.courses.map(async (pc) => {
        const enrollment = await this.prisma.enrollment.findUnique({
          where: { userId_courseId: { userId, courseId: pc.courseId } },
        });

        if (!enrollment) {
          return { ...pc, isEnrolled: false, completionPercentage: 0 };
        }

        const [totalLessons, completedLessons] = await Promise.all([
          this.prisma.lesson.count({ where: { courseId: pc.courseId, isPublished: true } }),
          this.prisma.lessonProgress.count({
            where: { courseId: pc.courseId, userId, isCompleted: true },
          }),
        ]);

        return {
          ...pc,
          isEnrolled: true,
          completionPercentage: totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100) : 0,
        };
      }),
    );

    const requiredCourses = courseProgress.filter((c) => c.isRequired);
    const completedRequired = requiredCourses.filter((c) => c.completionPercentage === 100).length;
    const overallProgress = requiredCourses.length > 0
      ? Math.round((completedRequired / requiredCourses.length) * 100) : 0;

    return { ...path, courses: courseProgress, overallProgress };
  }

  async update(id: string, dto: UpdateLearningPathDto, userId: string, userRole: string) {
    await this.verifyOwnership(id, userId, userRole);

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.thumbnailUrl !== undefined) data.thumbnailUrl = dto.thumbnailUrl;
    if (dto.isPublished !== undefined) data.isPublished = dto.isPublished;

    return this.prisma.learningPath.update({ where: { id }, data });
  }

  async delete(id: string, userId: string, userRole: string) {
    await this.verifyOwnership(id, userId, userRole);
    await this.prisma.learningPath.delete({ where: { id } });
    return { success: true };
  }

  async findMine(userId: string) {
    return this.prisma.learningPath.findMany({
      where: { createdBy: userId },
      include: {
        _count: { select: { courses: true, enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async enroll(pathId: string, userId: string) {
    const path = await this.prisma.learningPath.findUnique({
      where: { id: pathId },
      include: { courses: { select: { courseId: true } } },
    });
    if (!path) throw new NotFoundException('Learning path not found');
    if (!path.isPublished) throw new ForbiddenException('Learning path is not published');

    const existing = await this.prisma.learningPathEnrollment.findUnique({
      where: { learningPathId_studentId: { learningPathId: pathId, studentId: userId } },
    });
    if (!existing) {
      await this.prisma.learningPathEnrollment.create({
        data: { learningPathId: pathId, studentId: userId },
      });
    }

    let enrolled = 0, skipped = 0;
    for (const { courseId } of path.courses) {
      const courseEnrollment = await this.prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });
      if (!courseEnrollment) {
        await this.prisma.enrollment.create({ data: { userId, courseId } });
        enrolled++;
      } else {
        skipped++;
      }
    }

    if (path.courses.length === 0) {
      await this.checkAndIssueCertificate(pathId, userId);
    }

    return { success: true, enrolled, skipped };
  }

  async checkAndIssueCertificate(pathId: string, userId: string) {
    const enrollment = await this.prisma.learningPathEnrollment.findUnique({
      where: { learningPathId_studentId: { learningPathId: pathId, studentId: userId } },
    });
    if (!enrollment || enrollment.completedAt) return;

    const path = await this.prisma.learningPath.findUnique({
      where: { id: pathId },
      include: { courses: { select: { courseId: true } } },
    });
    if (!path || path.courses.length === 0) return;

    const allCompleted = await Promise.all(
      path.courses.map(async ({ courseId }) => {
        // A course is complete when a certificate exists for it
        const cert = await this.prisma.certificate.findUnique({
          where: { userId_courseId: { userId, courseId } },
        });
        return cert != null;
      }),
    );

    if (allCompleted.every(Boolean)) {
      await this.prisma.learningPathEnrollment.update({
        where: { learningPathId_studentId: { learningPathId: pathId, studentId: userId } },
        data: { completedAt: new Date() },
      });
      try {
        await this.certificatesService.issuePathCertificate(userId, pathId);
        this.eventEmitter.emit('learning_path.completed', {
          userId, pathId, pathTitle: path.title,
        });
      } catch {
        // cert already issued or error — non-fatal
      }
    }
  }

  async addCourse(pathId: string, dto: AddCourseToPathDto, userId: string, userRole: string) {
    await this.verifyOwnership(pathId, userId, userRole);

    if (userRole === 'instructor') {
      const course = await this.prisma.course.findUnique({
        where: { id: dto.courseId },
        select: { instructorId: true },
      });
      if (!course) throw new NotFoundException('Course not found');
      if (course.instructorId !== userId) {
        throw new ForbiddenException('You can only add your own courses to a learning path');
      }
    }

    // Get next order index
    const last = await this.prisma.learningPathCourse.findFirst({
      where: { learningPathId: pathId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });

    return this.prisma.learningPathCourse.create({
      data: {
        learningPathId: pathId,
        courseId: dto.courseId,
        orderIndex: last ? last.orderIndex + 1 : 0,
        isRequired: dto.isRequired ?? true,
      },
    });
  }

  async removeCourse(pathId: string, courseId: string, userId: string, userRole: string) {
    await this.verifyOwnership(pathId, userId, userRole);
    await this.prisma.learningPathCourse.delete({
      where: { learningPathId_courseId: { learningPathId: pathId, courseId } },
    });
    return { success: true };
  }

  async reorderCourses(pathId: string, courseIds: string[], userId: string, userRole: string) {
    await this.verifyOwnership(pathId, userId, userRole);

    await this.prisma.$transaction(
      courseIds.map((courseId, index) =>
        this.prisma.learningPathCourse.update({
          where: { learningPathId_courseId: { learningPathId: pathId, courseId } },
          data: { orderIndex: index },
        }),
      ),
    );

    return { success: true };
  }

  @OnEvent('learning_path.completed')
  async handlePathCompleted(payload: { userId: string; pathId: string; pathTitle: string }) {
    try {
      await this.notificationsService.create({
        userId: payload.userId,
        type: 'path_completed',
        title: `You completed: ${payload.pathTitle}`,
        message: 'Congratulations on completing your learning path!',
      });
    } catch {
      // non-fatal
    }
  }

  private async verifyOwnership(pathId: string, userId: string, userRole: string) {
    if (userRole === 'admin') return;

    const path = await this.prisma.learningPath.findUnique({
      where: { id: pathId },
      select: { createdBy: true },
    });

    if (!path) throw new NotFoundException('Learning path not found');
    if (path.createdBy !== userId) {
      throw new ForbiddenException('You can only manage your own learning paths');
    }
  }
}
