import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { SupabaseService } from '../../common/supabase.service';
import { AssignInstructorDto, UpdateInstructorRoleDto } from './dto/course-instructor.dto';

@Injectable()
export class CourseInstructorsService {
  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
  ) {}

  private shouldUseSupabaseFallback(error: any) {
    return ['ENETUNREACH', 'P1001'].includes(error?.code)
      || /ENETUNREACH|Can't reach database server|connect ENETUNREACH/i.test(String(error?.message || ''));
  }

  async list(courseId: string) {
    try {
      const rows = await this.prisma.courseInstructor.findMany({
        where: { courseId },
        select: {
          id: true,
          role: true,
          addedAt: true,
          profile: {
            select: { id: true, email: true, fullName: true, avatarUrl: true },
          },
        },
        orderBy: [{ role: 'desc' }, { addedAt: 'asc' }], // 'primary' > 'co_instructor' alphabetically desc
      });
      return rows;
    } catch (error) {
      if (!this.shouldUseSupabaseFallback(error)) throw error;

      const { data: instructors, error: instructorsError } = await this.supabaseService.adminClient
        .from('course_instructors')
        .select('id,role,added_at,profile_id')
        .eq('course_id', courseId)
        .order('role', { ascending: false })
        .order('added_at', { ascending: true });

      if (instructorsError) throw instructorsError;

      const profileIds = [...new Set((instructors || []).map((row) => row.profile_id).filter(Boolean))];
      const { data: profiles, error: profilesError } = profileIds.length
        ? await this.supabaseService.adminClient
            .from('profiles')
            .select('id,email,full_name,avatar_url')
            .in('id', profileIds)
        : { data: [], error: null };

      if (profilesError) throw profilesError;

      const profileMap = new Map<string, any>(
        (profiles || []).map(
          (profile: any) => [
            profile.id,
            {
              id: profile.id,
              email: profile.email,
              fullName: profile.full_name,
              avatarUrl: profile.avatar_url,
            },
          ] as [string, any],
        ),
      );

      return (instructors || []).map((row) => ({
        id: row.id,
        role: row.role,
        addedAt: row.added_at,
        profile: row.profile_id ? profileMap.get(row.profile_id) || null : null,
      }));
    }
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
