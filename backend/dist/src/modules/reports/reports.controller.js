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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const reports_service_1 = require("./reports.service");
let ReportsController = class ReportsController {
    service;
    constructor(service) {
        this.service = service;
    }
    getAdminDashboard() {
        return this.service.getAdminDashboard();
    }
    getAdminTrends(months) {
        const m = Math.min(Math.max(parseInt(months || '12') || 12, 1), 24);
        return this.service.getAdminTrends(m);
    }
    getTopCourses(limit) {
        return this.service.getTopCourses(parseInt(limit || '10') || 10);
    }
    getRevenueStats(months) {
        const m = Math.min(Math.max(parseInt(months || '12') || 12, 1), 24);
        return this.service.getRevenueStats(m);
    }
    getInstructorTrends(req, months) {
        const m = Math.min(Math.max(parseInt(months || '6') || 6, 1), 24);
        return this.service.getInstructorTrends(req.user.id, m);
    }
    getInstructorDashboard(req) {
        return this.service.getInstructorDashboard(req.user.id);
    }
    getCourseReport(id, req) {
        return this.service.getCourseReport(id, req.user.id);
    }
    getCourseStudents(id, req) {
        return this.service.getCourseStudents(id, req.user.id);
    }
    getQuizReport(id, req) {
        return this.service.getQuizReport(id, req.user.id);
    }
    getQuizQuestionAnalysis(id, req) {
        return this.service.getQuizQuestionAnalysis(id, req.user.id);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('admin/dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin dashboard report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard data returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getAdminDashboard", null);
__decorate([
    (0, common_1.Get)('admin/trends'),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin trend stats' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trends returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getAdminTrends", null);
__decorate([
    (0, common_1.Get)('admin/top-courses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get top courses by enrollment (admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Top courses returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getTopCourses", null);
__decorate([
    (0, common_1.Get)('admin/revenue'),
    (0, swagger_1.ApiOperation)({ summary: 'Get revenue stats (admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Revenue stats returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getRevenueStats", null);
__decorate([
    (0, common_1.Get)('dashboard/trends'),
    (0, swagger_1.ApiOperation)({ summary: 'Get instructor trend stats' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trends returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getInstructorTrends", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get instructor dashboard report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard data returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getInstructorDashboard", null);
__decorate([
    (0, common_1.Get)('courses/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get report for a course' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Course report returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Course not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getCourseReport", null);
__decorate([
    (0, common_1.Get)('courses/:id/students'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student list for a course report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Students returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Course not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getCourseStudents", null);
__decorate([
    (0, common_1.Get)('quizzes/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get report for a quiz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quiz report returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getQuizReport", null);
__decorate([
    (0, common_1.Get)('quizzes/:id/question-analysis'),
    (0, swagger_1.ApiOperation)({ summary: 'Get question-level analysis for a quiz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Analysis returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getQuizQuestionAnalysis", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map