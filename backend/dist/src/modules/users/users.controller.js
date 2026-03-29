"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const users_service_1 = require("./users.service");
const prisma_service_1 = require("../../common/prisma.service");
const supabase_service_1 = require("../../common/supabase.service");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
class UpdateProfileDto {
    fullName;
    bio;
    phone;
}
class UpdateUserDto {
    role;
    isActive;
    fullName;
    bio;
    phone;
}
class UserQueryDto {
    page;
    limit;
    q;
    role;
    isActive;
    sortBy;
    sortOrder;
}
class CreateAdminUserDto {
    email;
    password;
    fullName;
    role;
}
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_transformer_1.Transform)(({ value }) => value.toLowerCase().trim()),
    __metadata("design:type", String)
], CreateAdminUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.Matches)(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
        message: 'Password must contain uppercase, number, and special character',
    }),
    __metadata("design:type", String)
], CreateAdminUserDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateAdminUserDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['student', 'instructor', 'admin']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAdminUserDto.prototype, "role", void 0);
class ResetPasswordDto {
    newPassword;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.Matches)(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
        message: 'Password must contain uppercase, number, and special character',
    }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
let UsersController = class UsersController {
    usersService;
    prisma;
    supabase;
    configService;
    constructor(usersService, prisma, supabase, configService) {
        this.usersService = usersService;
        this.prisma = prisma;
        this.supabase = supabase;
        this.configService = configService;
    }
    async getProfile(req) {
        return this.usersService.getProfile(req.user.id, req.user.email);
    }
    async getMyActivity(req, months) {
        const m = Math.min(Math.max(parseInt(months || '6') || 6, 1), 12);
        return this.usersService.getMyActivity(req.user.id, m);
    }
    async searchUsers(q = '', role, page, limit) {
        return this.usersService.searchUsers(q, parseInt(page || '1'), parseInt(limit || '20'), { role });
    }
    async getStudentDashboard(req) {
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
            const courseProgress = [];
            for (const e of enrollments) {
                const lessonIds = e.course.sections.flatMap((s) => s.lessons.map((l) => l.id));
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
        }
        catch (error) {
            console.error('Dashboard error:', error);
            return {
                stats: { totalCourses: 0, completedCourses: 0, totalQuizzes: 0 },
                enrolledCourses: [],
                recentActivity: [],
                error: error.message,
            };
        }
    }
    async getEnrolledCourses(req) {
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
    async getQuizHistory(req) {
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
    async updateProfile(req, dto) {
        return this.usersService.updateProfile(req.user.id, {
            full_name: dto.fullName,
            bio: dto.bio,
            phone: dto.phone,
        });
    }
    async updateAvatar(req, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const userId = req.user.id;
        const bucketName = this.configService.get('app.supabase.avatarBucket') || 'avatars';
        const fileName = `${userId}/${Date.now()}-${file.originalname}`;
        const { data, error } = await this.supabase.adminClient.storage
            .from(bucketName)
            .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
        });
        if (error) {
            throw new common_1.BadRequestException(`Upload failed: ${error.message}`);
        }
        const { data: urlData } = this.supabase.adminClient.storage
            .from(bucketName)
            .getPublicUrl(fileName);
        await this.usersService.updateAvatar(userId, urlData.publicUrl);
        return { avatarUrl: urlData.publicUrl };
    }
    async getUserStats() {
        return this.usersService.getUserStats();
    }
    async getAllUsers(query) {
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '20');
        const sortByWhitelist = ['createdAt', 'fullName', 'email'];
        const sortBy = query.sortBy && sortByWhitelist.includes(query.sortBy) ? query.sortBy : undefined;
        const sortOrder = query.sortOrder === 'asc' ? 'asc' : query.sortOrder === 'desc' ? 'desc' : undefined;
        const isActive = query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined;
        return this.usersService.searchUsers(query.q || '', page, limit, {
            role: query.role,
            isActive,
            sortBy,
            sortOrder,
        });
    }
    async createUser(dto) {
        return this.usersService.createUser(dto);
    }
    async getUserById(id) {
        return this.usersService.findById(id);
    }
    async updateUser(id, dto) {
        return this.usersService.updateUser(id, dto);
    }
    async reactivateUser(id) {
        return this.usersService.reactivateUser(id);
    }
    async resetUserPassword(id, dto) {
        return this.usersService.resetUserPassword(id, dto.newPassword);
    }
    async deactivateUser(id) {
        return this.usersService.deactivateUser(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('me/activity'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user activity' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Activity returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyActivity", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search users' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('role')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "searchUsers", null);
__decorate([
    (0, common_1.Get)('me/dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student dashboard stats and progress' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard data returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getStudentDashboard", null);
__decorate([
    (0, common_1.Get)('me/courses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get enrolled courses for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Courses returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getEnrolledCourses", null);
__decorate([
    (0, common_1.Get)('me/quiz-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get quiz attempt history for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quiz history returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getQuizHistory", null);
__decorate([
    (0, common_1.Put)('me/profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Update current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Put)('me/avatar'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload avatar for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Avatar updated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'No file uploaded or upload failed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateAvatar", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user stats (admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stats returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserStats", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, swagger_1.ApiOperation)({ summary: 'List all users with filters (admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserQueryDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Post)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new user (admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateAdminUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)('admin/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID (admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Put)('admin/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user by ID (admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User updated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Put)('admin/:id/reactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Reactivate a deactivated user (admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User reactivated' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "reactivateUser", null);
__decorate([
    (0, common_1.Put)('admin/:id/reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset user password (admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "resetUserPassword", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate user by ID (admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User deactivated' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deactivateUser", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        prisma_service_1.PrismaService,
        supabase_service_1.SupabaseService,
        config_1.ConfigService])
], UsersController);
//# sourceMappingURL=users.controller.js.map