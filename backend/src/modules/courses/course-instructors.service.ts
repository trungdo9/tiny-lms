import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AssignInstructorDto, UpdateInstructorRoleDto } from './dto/course-instructor.dto';

@Injectable()
export class CourseInstructorsService {
  constructor(private prisma: PrismaService) {}

  async list(courseId: string) {
    return this.prisma.courseInstructor.findMany({
      where: { courseId },
      select: {
        id: true,
        role: true,
        addedAt: true,
        profile: {
          select: { id: true, email: true, fullName: true, avatarUrl: true },
        },
      },
      orderBy: [{ role: 'desc' }, { addedAt: 'asc' }],
    });
  }

  async assign(courseId: string, dto: AssignInstructorDto, actorId: string, actorRole: string) {
    // Only primary instructor or admin can assign
    if (actorRole !== 'admin') {
      const actorMembership = await this.prisma.courseInstructor.findFirst({
        where: { courseId, profileId: actorId, role: 'primary' },
      });
      if (!actorMembership) {
        throw new ForbiddenException('Only the primary instructor or admin can assign instructors');
      }
    }

    // Verify target user exists
    const target = await this.prisma.profile.findUnique({ where: { id: dto.userId } });
    if (!target) throw new NotFoundException('User not found');

    // Prevent duplicate
    const existing = await this.prisma.courseInstructor.findFirst({
      where: { courseId, profileId: dto.userId },
    });
    if (existing) throw new ConflictException('User is already an instructor for this course');

    return this.prisma.courseInstructor.create({
      data: {
        courseId,
        profileId: dto.userId,
        role: dto.role ?? 'co_instructor',
        addedBy: actorId,
      },
      include: {
        profile: { select: { id: true, email: true, fullName: true, avatarUrl: true } },
      },
    });
  }

  async remove(courseId: string, targetUserId: string, actorId: string, actorRole: string) {
    const target = await this.prisma.courseInstructor.findFirst({
      where: { courseId, profileId: targetUserId },
    });
    if (!target) throw new NotFoundException('Instructor not found on this course');

    // Only admin or primary instructor can remove
    if (actorRole !== 'admin') {
      const actorIsPrimary = await this.prisma.courseInstructor.findFirst({
        where: { courseId, profileId: actorId, role: 'primary' },
      });
      if (!actorIsPrimary) {
        throw new ForbiddenException('Only the primary instructor or admin can remove instructors');
      }
    }

    // Cannot remove the last primary instructor
    if (target.role === 'primary') {
      const primaryCount = await this.prisma.courseInstructor.count({
        where: { courseId, role: 'primary' },
      });
      if (primaryCount <= 1) {
        throw new BadRequestException(
          'Cannot remove the only primary instructor. Assign a new primary first.',
        );
      }
    }

    await this.prisma.courseInstructor.delete({ where: { id: target.id } });
    return { success: true };
  }

  async updateRole(
    courseId: string,
    targetUserId: string,
    dto: UpdateInstructorRoleDto,
    actorRole: string,
  ) {
    if (actorRole !== 'admin') {
      throw new ForbiddenException('Only admin can change instructor roles');
    }

    const target = await this.prisma.courseInstructor.findFirst({
      where: { courseId, profileId: targetUserId },
    });
    if (!target) throw new NotFoundException('Instructor not found on this course');

    return this.prisma.courseInstructor.update({
      where: { id: target.id },
      data: { role: dto.role },
      include: {
        profile: { select: { id: true, email: true, fullName: true, avatarUrl: true } },
      },
    });
  }
}
