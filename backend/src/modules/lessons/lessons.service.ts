import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CoursesService } from '../courses/courses.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    private coursesService: CoursesService,
  ) {}

  private async syncCourseLessonCount(courseId: string, tx: PrismaService | any = this.prisma) {
    const lessonCount = await tx.lesson.count({ where: { courseId } });
    await tx.course.update({
      where: { id: courseId },
      data: { lessonCount },
    });
  }

  async findBySection(sectionId: string) {
    return this.prisma.lesson.findMany({
      where: { sectionId },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        section: { select: { id: true, title: true, courseId: true } },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async findOneForLearning(id: string, userId: string) {
    const lesson = await this.findOne(id);

    const canAccess = await this.canAccessLesson(lesson, userId);
    if (!canAccess) {
      throw new ForbiddenException('You must enroll in this course to access this lesson');
    }

    // Check prerequisite completion
    const prereqMet = await this.checkPrerequisite(id, userId);
    if (!prereqMet) {
      throw new ForbiddenException('You must complete the prerequisite lesson first');
    }

    // Check drip content availability
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: lesson.courseId } },
    });
    if (enrollment && !this.isLessonAvailable(lesson, enrollment)) {
      throw new ForbiddenException('This lesson is not yet available');
    }

    // Get user's progress for this lesson
    const progress = await this.prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId: id } },
    });

    return {
      ...lesson,
      userProgress: progress,
    };
  }

  async create(sectionId: string, dto: CreateLessonDto, userId: string, userRole: string = 'student') {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      select: { id: true, courseId: true },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    await this.verifyCourseAccess(section.courseId, userId, userRole);

    // Get max order_index
    const lastLesson = await this.prisma.lesson.findFirst({
      where: { sectionId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });

    const orderIndex = dto.orderIndex ?? (lastLesson ? lastLesson.orderIndex + 1 : 0);

    return this.prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.create({
        data: {
          sectionId,
          courseId: section.courseId,
          title: dto.title,
          type: dto.type,
          content: dto.content,
          videoUrl: dto.videoUrl,
          videoProvider: dto.videoProvider,
          pdfUrl: dto.pdfUrl,
          durationMins: dto.durationMins,
          orderIndex,
          isPreview: dto.isPreview ?? false,
          isPublished: dto.isPublished ?? false,
          prerequisiteLessonId: dto.prerequisiteLessonId,
          availableAfterDays: dto.availableAfterDays,
        },
      });

      await this.syncCourseLessonCount(section.courseId, tx);
      return lesson;
    });
  }

  async update(id: string, dto: UpdateLessonDto, userId: string, userRole: string = 'student') {
    const lesson = await this.findOne(id);
    await this.verifyCourseAccess(lesson.courseId, userId, userRole);

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.videoUrl !== undefined) data.videoUrl = dto.videoUrl;
    if (dto.videoProvider !== undefined) data.videoProvider = dto.videoProvider;
    if (dto.pdfUrl !== undefined) data.pdfUrl = dto.pdfUrl;
    if (dto.durationMins !== undefined) data.durationMins = dto.durationMins;
    if (dto.orderIndex !== undefined) data.orderIndex = dto.orderIndex;
    if (dto.isPreview !== undefined) data.isPreview = dto.isPreview;
    if (dto.isPublished !== undefined) data.isPublished = dto.isPublished;
    if (dto.prerequisiteLessonId !== undefined) {
      // Validate prerequisite is in the same course
      if (dto.prerequisiteLessonId) {
        const prereq = await this.prisma.lesson.findUnique({
          where: { id: dto.prerequisiteLessonId },
          select: { courseId: true },
        });
        if (!prereq || prereq.courseId !== lesson.courseId) {
          throw new BadRequestException('Prerequisite lesson must be in the same course');
        }
        if (dto.prerequisiteLessonId === id) {
          throw new BadRequestException('A lesson cannot be its own prerequisite');
        }
      }
      data.prerequisiteLessonId = dto.prerequisiteLessonId;
    }
    if (dto.availableAfterDays !== undefined) data.availableAfterDays = dto.availableAfterDays;

    return this.prisma.lesson.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string, userRole: string = 'student') {
    const lesson = await this.findOne(id);
    await this.verifyCourseAccess(lesson.courseId, userId, userRole);

    await this.prisma.$transaction(async (tx) => {
      await tx.lesson.delete({ where: { id } });
      await this.syncCourseLessonCount(lesson.courseId, tx);
    });

    return { success: true };
  }

  async reorder(sectionId: string, lessonIds: string[], userId: string, userRole: string = 'student') {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      select: { courseId: true },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    await this.verifyCourseAccess(section.courseId, userId, userRole);

    await this.prisma.$transaction(
      lessonIds.map((id, index) =>
        this.prisma.lesson.update({
          where: { id },
          data: { orderIndex: index },
        }),
      ),
    );

    return { success: true };
  }

  private async canAccessLesson(lesson: any, userId: string): Promise<boolean> {
    if (lesson.isPreview) return true;

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: lesson.courseId } },
    });

    return !!enrollment;
  }

  private async verifyCourseAccess(courseId: string, userId: string, userRole: string) {
    if (!(await this.coursesService.canManageCourse(courseId, userId, userRole))) {
      throw new ForbiddenException('You can only modify courses you are assigned to');
    }
  }

  async checkPrerequisite(lessonId: string, userId: string): Promise<boolean> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { prerequisiteLessonId: true, isPreview: true },
    });
    if (!lesson?.prerequisiteLessonId || lesson.isPreview) return true;

    const progress = await this.prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId: lesson.prerequisiteLessonId } },
    });
    return progress?.isCompleted ?? false;
  }

  private isLessonAvailable(lesson: any, enrollment: any): boolean {
    if (lesson.isPreview) return true;
    if (lesson.availableFrom && new Date() < new Date(lesson.availableFrom)) return false;
    if (lesson.availableAfterDays && enrollment?.enrolledAt) {
      const unlockDate = new Date(enrollment.enrolledAt);
      unlockDate.setDate(unlockDate.getDate() + lesson.availableAfterDays);
      return new Date() >= unlockDate;
    }
    return true;
  }
}
