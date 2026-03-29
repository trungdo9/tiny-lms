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
exports.SectionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const sections_service_1 = require("./sections.service");
const section_dto_1 = require("./dto/section.dto");
let SectionsController = class SectionsController {
    sectionsService;
    constructor(sectionsService) {
        this.sectionsService = sectionsService;
    }
    async findByCourse(courseId) {
        return this.sectionsService.findByCourse(courseId);
    }
    async findOne(id) {
        return this.sectionsService.findOne(id);
    }
    async create(courseId, dto, req) {
        return this.sectionsService.create(courseId, dto, req.user.id, req.user.role);
    }
    async update(id, dto, req) {
        return this.sectionsService.update(id, dto, req.user.id, req.user.role);
    }
    async delete(id, req) {
        return this.sectionsService.delete(id, req.user.id, req.user.role);
    }
    async reorder(courseId, dto, req) {
        return this.sectionsService.reorder(courseId, dto.sectionIds, req.user.id, req.user.role);
    }
};
exports.SectionsController = SectionsController;
__decorate([
    (0, common_1.Get)('courses/:courseId/sections'),
    (0, swagger_1.ApiOperation)({ summary: 'List sections for a course' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of sections' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SectionsController.prototype, "findByCourse", null);
__decorate([
    (0, common_1.Get)('sections/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a section by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Section found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Section not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SectionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('courses/:courseId/sections'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create a section in a course' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Section created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request body' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, section_dto_1.CreateSectionDto, Object]),
    __metadata("design:returntype", Promise)
], SectionsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('sections/:id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update a section' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Section updated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request body' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Section not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, section_dto_1.UpdateSectionDto, Object]),
    __metadata("design:returntype", Promise)
], SectionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('sections/:id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a section' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Section deleted' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Section not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SectionsController.prototype, "delete", null);
__decorate([
    (0, common_1.Put)('courses/:courseId/sections/reorder'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder sections within a course' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sections reordered' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request body' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, section_dto_1.ReorderSectionsDto, Object]),
    __metadata("design:returntype", Promise)
], SectionsController.prototype, "reorder", null);
exports.SectionsController = SectionsController = __decorate([
    (0, swagger_1.ApiTags)('sections'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [sections_service_1.SectionsService])
], SectionsController);
//# sourceMappingURL=sections.controller.js.map