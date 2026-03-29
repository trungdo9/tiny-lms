import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsEmail, IsString, IsOptional, IsIn, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { UsersService } from './users.service';
import { PrismaService } from '../../common/prisma.service';
import { SupabaseService } from '../../common/supabase.service';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

class UpdateProfileDto {
  fullName?: string;
  bio?: string;
  phone?: string;
}

class UpdateUserDto {
  role?: string;
  isActive?: boolean;
  fullName?: string;
  bio?: string;
  phone?: string;
}

class UserQueryDto {
  page?: string;
  limit?: string;
  q?: string;
  role?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: string;
}

class CreateAdminUserDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message: 'Password must contain uppercase, number, and special character',
  })
  password: string;

  @IsString() @IsOptional() @MaxLength(100)
  fullName?: string;

  @IsIn(['student', 'instructor', 'admin']) @IsOptional()
  role?: string;
}

class ResetPasswordDto {
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message: 'Password must contain uppercase, number, and special character',
  })
  newPassword: string;
}

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(SupabaseAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private supabase: SupabaseService,
    private configService: ConfigService,
  ) {}

  // ─── Current User Endpoints ─────────────────────────────────────────────────

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.id, req.user.email);
  }

  @Get('me/activity')
  @ApiOperation({ summary: 'Get current user activity' })
  @ApiResponse({ status: 200, description: 'Activity returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyActivity(@Request() req: any, @Query('months') months?: string) {
    const m = Math.min(Math.max(parseInt(months || '6') || 6, 1), 12);
    return this.usersService.getMyActivity(req.user.id, m);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users' })
  @ApiResponse({ status: 200, description: 'Users returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchUsers(
    @Query('q') q: string = '',
    @Query('role') role?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.searchUsers(q, parseInt(page || '1'), parseInt(limit || '20'), { role });
  }

  @Get('me/dashboard')
  @ApiOperation({ summary: 'Get student dashboard stats and progress' })
  @ApiResponse({ status: 200, description: 'Dashboard data returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStudentDashboard(@Request() req: any) {
    console.log('Dashboard request, user:', req.user);
    try {
      const userId = req.user?.id;
      console.log('Dashboard for user:', userId);

      const enrollments = await this.prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              sections: {
                include: {
                  lessons: {
                    where: { isPublished: true },
                    select: {
                      id: true,
                      isPublished: true,
                      orderIndex: true,
                    },
                    orderBy: { orderIndex: 'asc' },
                  },
                },
                orderBy: { orderIndex: 'asc' },
              },
            },
          },
        },
      });

      console.log('Enrollments found:', enrollments.length);

      const recentAttempts = await this.prisma.quizAttempt.findMany({
        where: { userId, status: 'submitted' },
        include: {
          quiz: { select: { title: true, courseId: true } },
        },
        orderBy: { submittedAt: 'desc' },
        take: 5,
      });

      console.log('Recent attempts:', recentAttempts.length);

      const courseProgress: any[] = [];
      for (const e of enrollments) {
        const lessonIds = e.course.sections.flatMap((s: any) => s.lessons.map((l: any) => l.id));
        const totalLessons = lessonIds.length;

        const lessonProgress = await this.prisma.lessonProgress.findMany({
          where: {
            userId,
            lessonId: { in: lessonIds },
          },
          select: {
            lessonId: true,
            isCompleted: true,
            lastPosition: true,
            updatedAt: true,
          },
        });

        const completedCount = lessonProgress.filter((item) => item.isCompleted).length;
        const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        courseProgress.push({
          courseId: e.course.id,
          courseSlug: e.course.slug,
          courseTitle: e.course.title,
          totalLessons,
          completedLessons: completedCount,
          progress: progressPercent,
          enrolledAt: e.enrolledAt,
          sections: e.course.sections,
          lessonProgress,
        });
      }

      const completedCourses = courseProgress.filter(c => c.progress === 100).length;

      return {
        stats: {
          totalCourses: enrollments.length,
          completedCourses,
          totalQuizzes: recentAttempts.length,
        },
        enrolledCourses: courseProgress,
        recentActivity: recentAttempts.map((a) => ({
          id: a.id,
          quizTitle: a.quiz?.title || 'Unknown',
          score: a.percentage,
          isPassed: a.isPassed,
          submittedAt: a.submittedAt,
        })),
      };
    } catch (error) {
      console.error('Dashboard error:', error);
      return {
        stats: { totalCourses: 0, completedCourses: 0, totalQuizzes: 0 },
        enrolledCourses: [],
        recentActivity: [],
        error: error.message,
      };
    }
  }

  @Get('me/courses')
  @ApiOperation({ summary: 'Get enrolled courses for current user' })
  @ApiResponse({ status: 200, description: 'Courses returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getEnrolledCourses(@Request() req: any) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId: req.user.id },
      include: {
        course: {
          include: {
            sections: { include: { lessons: true } },
            instructor: { select: { fullName: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return enrollments.map((e) => ({
      id: e.course.id,
      title: e.course.title,
      description: e.course.description,
      thumbnailUrl: e.course.thumbnailUrl,
      instructorName: e.course.instructor.fullName,
      totalLessons: e.course.sections.reduce((sum, s) => sum + s.lessons.length, 0),
      enrolledAt: e.enrolledAt,
    }));
  }

  @Get('me/quiz-history')
  @ApiOperation({ summary: 'Get quiz attempt history for current user' })
  @ApiResponse({ status: 200, description: 'Quiz history returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getQuizHistory(@Request() req: any) {
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { userId: req.user.id },
      include: {
        quiz: {
          select: { id: true, title: true, courseId: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return attempts.map((a) => ({
      id: a.id,
      quizId: a.quiz.id,
      quizTitle: a.quiz.title,
      courseId: a.quiz.courseId,
      score: a.percentage,
      maxScore: a.maxScore,
      totalScore: a.totalScore,
      isPassed: a.isPassed,
      status: a.status,
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
    }));
  }

  @Put('me/profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, {
      full_name: dto.fullName,
      bio: dto.bio,
      phone: dto.phone,
    });
  }

  @Put('me/avatar')
  @ApiOperation({ summary: 'Upload avatar for current user' })
  @ApiResponse({ status: 200, description: 'Avatar updated' })
  @ApiResponse({ status: 400, description: 'No file uploaded or upload failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userId = req.user.id;
    const bucketName = this.configService.get<string>('app.supabase.avatarBucket') || 'avatars';
    const fileName = `${userId}/${Date.now()}-${file.originalname}`;

    const { data, error } = await this.supabase.adminClient.storage
      .from(bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }

    const { data: urlData } = this.supabase.adminClient.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    await this.usersService.updateAvatar(userId, urlData.publicUrl);

    return { avatarUrl: urlData.publicUrl };
  }

  // ─── Admin Endpoints ────────────────────────────────────────────────────────

  // Static admin routes MUST be before admin/:id to avoid route conflict

  @Get('admin/stats')
  @ApiOperation({ summary: 'Get user stats (admin)' })
  @ApiResponse({ status: 200, description: 'Stats returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getUserStats() {
    return this.usersService.getUserStats();
  }

  @Get('admin/all')
  @ApiOperation({ summary: 'List all users with filters (admin)' })
  @ApiResponse({ status: 200, description: 'Users returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getAllUsers(@Query() query: UserQueryDto) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const sortByWhitelist = ['createdAt', 'fullName', 'email'];
    const sortBy = query.sortBy && sortByWhitelist.includes(query.sortBy) ? query.sortBy as 'createdAt' | 'fullName' | 'email' : undefined;
    const sortOrder = query.sortOrder === 'asc' ? 'asc' as const : query.sortOrder === 'desc' ? 'desc' as const : undefined;
    const isActive = query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined;

    return this.usersService.searchUsers(query.q || '', page, limit, {
      role: query.role,
      isActive,
      sortBy,
      sortOrder,
    });
  }

  @Post('admin')
  @ApiOperation({ summary: 'Create a new user (admin)' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async createUser(@Body(new ValidationPipe()) dto: CreateAdminUserDto) {
    return this.usersService.createUser(dto);
  }

  @Get('admin/:id')
  @ApiOperation({ summary: 'Get user by ID (admin)' })
  @ApiResponse({ status: 200, description: 'User returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Put('admin/:id')
  @ApiOperation({ summary: 'Update user by ID (admin)' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, dto);
  }

  @Put('admin/:id/reactivate')
  @ApiOperation({ summary: 'Reactivate a deactivated user (admin)' })
  @ApiResponse({ status: 200, description: 'User reactivated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async reactivateUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.reactivateUser(id);
  }

  @Put('admin/:id/reset-password')
  @ApiOperation({ summary: 'Reset user password (admin)' })
  @ApiResponse({ status: 200, description: 'Password reset' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async resetUserPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe()) dto: ResetPasswordDto,
  ) {
    return this.usersService.resetUserPassword(id, dto.newPassword);
  }

  @Delete('admin/:id')
  @ApiOperation({ summary: 'Deactivate user by ID (admin)' })
  @ApiResponse({ status: 200, description: 'User deactivated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deactivateUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.deactivateUser(id);
  }
}
