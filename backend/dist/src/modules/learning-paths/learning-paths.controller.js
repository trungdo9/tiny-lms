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
exports.LearningPathsController = void 0;
const common_1 = require("@nestjs/common");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const learning_paths_service_1 = require("./learning-paths.service");
const learning_path_dto_1 = require("./dto/learning-path.dto");
let LearningPathsController = class LearningPathsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async findAll(all) {
        return this.service.findAll(all !== 'true');
    }
    async findMine(req) {
        return this.service.findMine(req.user.id);
    }
    async findOne(id) {
        return this.service.findOne(id);
    }
    async findOneWithProgress(id, req) {
        return this.service.findOneWithProgress(id, req.user.id);
    }
    async create(dto, req) {
        return this.service.create(dto, req.user.id);
    }
    async update(id, dto, req) {
        return this.service.update(id, dto, req.user.id, req.user.role);
    }
    async delete(id, req) {
        return this.service.delete(id, req.user.id, req.user.role);
    }
    async enroll(id, req) {
        return this.service.enroll(id, req.user.id);
    }
    async addCourse(id, dto, req) {
        return this.service.addCourse(id, dto, req.user.id, req.user.role);
    }
    async removeCourse(id, courseId, req) {
        return this.service.removeCourse(id, courseId, req.user.id, req.user.role);
    }
    async reorderCourses(id, dto, req) {
        return this.service.reorderCourses(id, dto.courseIds, req.user.id, req.user.role);
    }
};
exports.LearningPathsController = LearningPathsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('all')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LearningPathsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('mine'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LearningPathsController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LearningPathsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/progress'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LearningPathsController.prototype, "findOneWithProgress", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [learning_path_dto_1.CreateLearningPathDto, Object]),
    __metadata("design:returntype", Promise)
], LearningPathsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, learning_path_dto_1.UpdateLearningPathDto, Object]),
    __metadata("design:returntype", Promise)
], LearningPathsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LearningPathsController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/enroll'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LearningPathsController.prototype, "enroll", null);
__decorate([
    (0, common_1.Post)(':id/courses'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, learning_path_dto_1.AddCourseToPathDto, Object]),
    __metadata("design:returntype", Promise)
], LearningPathsController.prototype, "addCourse", null);
__decorate([
    (0, common_1.Delete)(':id/courses/:courseId'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('courseId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LearningPathsController.prototype, "removeCourse", null);
__decorate([
    (0, common_1.Put)(':id/courses/reorder'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, learning_path_dto_1.ReorderPathCoursesDto, Object]),
    __metadata("design:returntype", Promise)
], LearningPathsController.prototype, "reorderCourses", null);
exports.LearningPathsController = LearningPathsController = __decorate([
    (0, common_1.Controller)('learning-paths'),
    __metadata("design:paramtypes", [learning_paths_service_1.LearningPathsService])
], LearningPathsController);
//# sourceMappingURL=learning-paths.controller.js.map