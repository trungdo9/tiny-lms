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
exports.LessonsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const lessons_service_1 = require("./lessons.service");
const lesson_dto_1 = require("./dto/lesson.dto");
let LessonsController = class LessonsController {
    lessonsService;
    constructor(lessonsService) {
        this.lessonsService = lessonsService;
    }
    async findBySection(sectionId) {
        return this.lessonsService.findBySection(sectionId);
    }
    async findOne(id) {
        return this.lessonsService.findOne(id);
    }
    async findOneForLearning(id, req) {
        return this.lessonsService.findOneForLearning(id, req.user.id);
    }
    async create(sectionId, dto, req) {
        return this.lessonsService.create(sectionId, dto, req.user.id, req.user.role);
    }
    async update(id, dto, req) {
        return this.lessonsService.update(id, dto, req.user.id, req.user.role);
    }
    async delete(id, req) {
        return this.lessonsService.delete(id, req.user.id, req.user.role);
    }
    async reorder(sectionId, dto, req) {
        return this.lessonsService.reorder(sectionId, dto.lessonIds, req.user.id, req.user.role);
    }
};
exports.LessonsController = LessonsController;
__decorate([
    (0, common_1.Get)('sections/:sectionId/lessons'),
    (0, swagger_1.ApiOperation)({ summary: 'List lessons for a section' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of lessons' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('sectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LessonsController.prototype, "findBySection", null);
__decorate([
    (0, common_1.Get)('lessons/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a lesson by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lesson found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lesson not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LessonsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('lessons/:id/learn'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get lesson content for learning (enrolled users)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lesson content returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lesson not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LessonsController.prototype, "findOneForLearning", null);
__decorate([
    (0, common_1.Post)('sections/:sectionId/lessons'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create a lesson in a section' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Lesson created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request body' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('sectionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lesson_dto_1.CreateLessonDto, Object]),
    __metadata("design:returntype", Promise)
], LessonsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('lessons/:id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update a lesson' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lesson updated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request body' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lesson not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lesson_dto_1.UpdateLessonDto, Object]),
    __metadata("design:returntype", Promise)
], LessonsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('lessons/:id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a lesson' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lesson deleted' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lesson not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LessonsController.prototype, "delete", null);
__decorate([
    (0, common_1.Put)('sections/:sectionId/lessons/reorder'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder lessons within a section' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lessons reordered' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request body' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('sectionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lesson_dto_1.ReorderLessonsDto, Object]),
    __metadata("design:returntype", Promise)
], LessonsController.prototype, "reorder", null);
exports.LessonsController = LessonsController = __decorate([
    (0, swagger_1.ApiTags)('lessons'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [lessons_service_1.LessonsService])
], LessonsController);
//# sourceMappingURL=lessons.controller.js.map