import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CoursesService } from '../courses/courses.service';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto';

@Injectable()
export class SectionsService {
  constructor(
    private prisma: PrismaService,
    private coursesService: CoursesService,
  ) {}

  async findByCourse(courseId: string) {
    return this.prisma.section.findMany({
      where: { courseId },
      include: { lessons: { orderBy: { orderIndex: 'asc' } } },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async findOne(id: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: { lessons: { orderBy: { orderIndex: 'asc' } } },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    return section;
  }

  async create(courseId: string, dto: CreateSectionDto, userId: string, userRole: string = 'student') {
    await this.verifyCourseAccess(courseId, userId, userRole);

    // Get max order_index
    const lastSection = await this.prisma.section.findFirst({
      where: { courseId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });

    const orderIndex = dto.orderIndex ?? (lastSection ? lastSection.orderIndex + 1 : 0);

    return this.prisma.section.create({
      data: {
        courseId,
        title: dto.title,
        orderIndex,
      },
    });
  }

  async update(id: string, dto: UpdateSectionDto, userId: string, userRole: string = 'student') {
    const section = await this.findOne(id);
    await this.verifyCourseAccess(section.courseId, userId, userRole);

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.orderIndex !== undefined) data.orderIndex = dto.orderIndex;

    return this.prisma.section.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string, userRole: string = 'student') {
    const section = await this.findOne(id);
    await this.verifyCourseAccess(section.courseId, userId, userRole);

    await this.prisma.section.delete({ where: { id } });
    return { success: true };
  }

  async reorder(courseId: string, sectionIds: string[], userId: string, userRole: string = 'student') {
    await this.verifyCourseAccess(courseId, userId, userRole);

    await this.prisma.$transaction(
      sectionIds.map((id, index) =>
        this.prisma.section.update({
          where: { id },
          data: { orderIndex: index },
        }),
      ),
    );

    return { success: true };
  }

  private async verifyCourseAccess(courseId: string, userId: string, userRole: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (!(await this.coursesService.canManageCourse(courseId, userId, userRole))) {
      throw new ForbiddenException('You can only modify courses you are assigned to');
    }
  }
}
