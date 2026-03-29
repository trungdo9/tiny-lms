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
exports.CourseInstructorsController = void 0;
const common_1 = require("@nestjs/common");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const course_instructors_service_1 = require("./course-instructors.service");
const course_instructor_dto_1 = require("./dto/course-instructor.dto");
let CourseInstructorsController = class CourseInstructorsController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(courseId) {
        return this.service.list(courseId);
    }
    assign(courseId, dto, req) {
        return this.service.assign(courseId, dto, req.user.id, req.user.role);
    }
    remove(courseId, userId, req) {
        return this.service.remove(courseId, userId, req.user.id, req.user.role);
    }
    updateRole(courseId, userId, dto, req) {
        return this.service.updateRole(courseId, userId, dto, req.user.role);
    }
};
exports.CourseInstructorsController = CourseInstructorsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CourseInstructorsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, course_instructor_dto_1.AssignInstructorDto, Object]),
    __metadata("design:returntype", void 0)
], CourseInstructorsController.prototype, "assign", null);
__decorate([
    (0, common_1.Delete)(':userId'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], CourseInstructorsController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':userId'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, course_instructor_dto_1.UpdateInstructorRoleDto, Object]),
    __metadata("design:returntype", void 0)
], CourseInstructorsController.prototype, "updateRole", null);
exports.CourseInstructorsController = CourseInstructorsController = __decorate([
    (0, common_1.Controller)('courses/:courseId/instructors'),
    __metadata("design:paramtypes", [course_instructors_service_1.CourseInstructorsService])
], CourseInstructorsController);
//# sourceMappingURL=course-instructors.controller.js.map