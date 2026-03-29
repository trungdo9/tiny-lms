import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma.service';
import { SupabaseService } from '../../common/supabase.service';
import { CONTACT_SYNC_EVENTS } from '../contact-sync/contact-sync.events';

interface EnsureProfileOptions {
  email?: string;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findById(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
    });
    if (!profile) throw new NotFoundException('User not found');
    return profile;
  }

  private async ensureProfile(userId: string, options: EnsureProfileOptions = {}) {
    let profile = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (profile) {
      return profile;
    }

    let resolvedEmail = options.email;
    let fullName: string | undefined;

    try {
      const { data, error } = await this.supabase.adminClient.auth.admin.getUserById(userId);
      if (error) {
        throw error;
      }

      resolvedEmail = resolvedEmail ?? data.user?.email ?? undefined;
      const metadata = data.user?.user_metadata as { full_name?: string } | undefined;
      fullName = metadata?.full_name?.trim() || undefined;
    } catch {
      // Best effort only — if auth lookup fails we still create a minimal profile row.
    }

    profile = await this.prisma.profile.upsert({
      where: { id: userId },
      update: {
        email: resolvedEmail,
        ...(fullName ? { fullName } : {}),
        isActive: true,
      },
      create: {
        id: userId,
        email: resolvedEmail,
        ...(fullName ? { fullName } : {}),
        role: 'student',
        isActive: true,
      },
    });

    return profile;
  }

  async getProfile(userId: string, email?: string) {
    let profile = await this.ensureProfile(userId, { email });

    if (email && profile.email !== email) {
      profile = await this.prisma.profile.update({
        where: { id: userId },
        data: { email },
      });
    }

    return {
      ...profile,
      email: email ?? profile.email,
    };
  }

  async updateProfile(
    userId: string,
    data: { full_name?: string; bio?: string; phone?: string },
  ) {
    const { data: profile, error } = await this.supabase.adminClient
      .from('profiles')
      .update({
        full_name: data.full_name,
        bio: data.bio,
        phone: data.phone,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    this.eventEmitter.emit(CONTACT_SYNC_EVENTS.PROFILE_UPDATED, { userId });

    return profile;
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.prisma.profile.update({
      where: { id: userId },
      data: { avatarUrl },
    });
  }

  async searchUsers(query: string, page = 1, limit = 20, filters?: {
    role?: string; isActive?: boolean;
    sortBy?: 'createdAt' | 'fullName' | 'email'; sortOrder?: 'asc' | 'desc';
  }) {
    const skip = (page - 1) * limit;

    const where: any = query
      ? {
          OR: [
            { fullName: { contains: query, mode: 'insensitive' as const } },
            { email: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {};

    if (filters?.role) where.role = filters.role;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    const orderBy = filters?.sortBy
      ? { [filters.sortBy]: filters.sortOrder ?? 'asc' }
      : { createdAt: 'desc' as const };

    const [users, total] = await Promise.all([
      this.prisma.profile.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      this.prisma.profile.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUser(id: string, data: { role?: string; isActive?: boolean; fullName?: string; bio?: string; phone?: string }) {
    const updateData: Record<string, unknown> = {};
    if (data.role) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.phone !== undefined) updateData.phone = data.phone;

    return this.prisma.profile.update({
      where: { id },
      data: updateData,
    });
  }

  async deactivateUser(id: string) {
    return this.prisma.profile.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async reactivateUser(id: string) {
    return this.prisma.profile.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async createUser(dto: { email: string; password: string; fullName?: string; role?: string }) {
    const { data: authData, error } =
      await this.supabase.adminClient.auth.admin.createUser({
        email: dto.email,
        password: dto.password,
        email_confirm: true,
      });
    if (error) throw new BadRequestException(error.message);

    try {
      return await this.prisma.profile.create({
        data: {
          id: authData.user.id,
          email: dto.email,
          fullName: dto.fullName,
          role: dto.role ?? 'student',
          isActive: true,
        },
      });
    } catch {
      await this.supabase.adminClient.auth.admin.deleteUser(authData.user.id);
      throw new BadRequestException('Failed to create user profile');
    }
  }

  async getUserStats() {
    const [total, students, instructors, admins, inactive] = await Promise.all([
      this.prisma.profile.count(),
      this.prisma.profile.count({ where: { role: 'student' } }),
      this.prisma.profile.count({ where: { role: 'instructor' } }),
      this.prisma.profile.count({ where: { role: 'admin' } }),
      this.prisma.profile.count({ where: { isActive: false } }),
    ]);
    return { total, students, instructors, admins, inactive };
  }

  async resetUserPassword(id: string, newPassword: string) {
    const { error } = await this.supabase.adminClient.auth.admin.updateUserById(id, {
      password: newPassword,
    });
    if (error) throw new BadRequestException(error.message);
    return { success: true };
  }

  async getMyActivity(userId: string, months: number) {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const daily: { date: string; count: number }[] = await this.prisma.$queryRaw`
      SELECT d::date::text AS date, COALESCE(c.count, 0)::int AS count FROM
      generate_series(${since}::date, CURRENT_DATE, '1 day'::interval) d
      LEFT JOIN (
        SELECT completed_at::date AS day, COUNT(*)::int AS count FROM (
          SELECT completed_at FROM lesson_progress
          WHERE user_id = ${userId}::uuid AND is_completed = true AND completed_at >= ${since}
          UNION ALL
          SELECT submitted_at AS completed_at FROM quiz_attempts
          WHERE user_id = ${userId}::uuid AND status = 'submitted' AND submitted_at >= ${since}
        ) actions GROUP BY day
      ) c ON c.day = d::date
      ORDER BY date
    `;
    return { daily };
  }
}
