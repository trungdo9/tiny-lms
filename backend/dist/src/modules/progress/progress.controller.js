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
exports.ProgressController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const progress_service_1 = require("./progress.service");
class SavePositionDto {
    position;
}
let ProgressController = class ProgressController {
    progressService;
    constructor(progressService) {
        this.progressService = progressService;
    }
    async markComplete(lessonId, req) {
        return this.progressService.markComplete(lessonId, req.user.id);
    }
    async savePosition(lessonId, dto, req) {
        return this.progressService.savePosition(lessonId, dto.position, req.user.id);
    }
    async getCourseProgress(courseId, req) {
        return this.progressService.getCourseProgress(courseId, req.user.id);
    }
    async getLessonProgress(lessonId, req) {
        return this.progressService.getLessonProgress(lessonId, req.user.id);
    }
};
exports.ProgressController = ProgressController;
__decorate([
    (0, common_1.Post)('lessons/:lessonId/complete'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Mark a lesson as complete for the current user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Lesson marked complete' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('lessonId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "markComplete", null);
__decorate([
    (0, common_1.Put)('lessons/:lessonId/progress'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Save playback position for a lesson' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Position saved' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request body' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('lessonId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SavePositionDto, Object]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "savePosition", null);
__decorate([
    (0, common_1.Get)('courses/:courseId/progress'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get progress for the current user in a course' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Course progress returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "getCourseProgress", null);
__decorate([
    (0, common_1.Get)('lessons/:lessonId/progress'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get progress for the current user on a lesson' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lesson progress returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('lessonId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "getLessonProgress", null);
exports.ProgressController = ProgressController = __decorate([
    (0, swagger_1.ApiTags)('progress'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [progress_service_1.ProgressService])
], ProgressController);
//# sourceMappingURL=progress.controller.js.map