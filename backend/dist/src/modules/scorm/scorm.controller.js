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
exports.ScormController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const scorm_service_1 = require("./scorm.service");
const scorm_dto_1 = require("./dto/scorm.dto");
let ScormController = class ScormController {
    scormService;
    constructor(scormService) {
        this.scormService = scormService;
    }
    async uploadForLesson(lessonId, file) {
        return this.scormService.uploadPackage(file, { lessonId });
    }
    async uploadForCourse(courseId, file) {
        return this.scormService.uploadPackage(file, { courseId });
    }
    async getPackageByLesson(lessonId) {
        return this.scormService.getPackageByLesson(lessonId);
    }
    async getPackageByCourse(courseId) {
        return this.scormService.getPackageByCourse(courseId);
    }
    async initAttempt(dto, req) {
        return this.scormService.initAttempt(req.user.id, dto.packageId, dto.lessonId, dto.courseId);
    }
    async updateAttempt(id, dto, req) {
        return this.scormService.updateAttempt(id, dto.values, req.user.id);
    }
    async finishAttempt(id, req) {
        return this.scormService.finishAttempt(id, req.user.id);
    }
};
exports.ScormController = ScormController;
__decorate([
    (0, common_1.Post)('upload/lesson/:lessonId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 100 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('lessonId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScormController.prototype, "uploadForLesson", null);
__decorate([
    (0, common_1.Post)('upload/course/:courseId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 100 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScormController.prototype, "uploadForCourse", null);
__decorate([
    (0, common_1.Get)('package/lesson/:lessonId'),
    __param(0, (0, common_1.Param)('lessonId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScormController.prototype, "getPackageByLesson", null);
__decorate([
    (0, common_1.Get)('package/course/:courseId'),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScormController.prototype, "getPackageByCourse", null);
__decorate([
    (0, common_1.Post)('attempts/init'),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true }))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [scorm_dto_1.InitAttemptDto, Object]),
    __metadata("design:returntype", Promise)
], ScormController.prototype, "initAttempt", null);
__decorate([
    (0, common_1.Put)('attempts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true }))),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, scorm_dto_1.UpdateAttemptDto, Object]),
    __metadata("design:returntype", Promise)
], ScormController.prototype, "updateAttempt", null);
__decorate([
    (0, common_1.Post)('attempts/:id/finish'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScormController.prototype, "finishAttempt", null);
exports.ScormController = ScormController = __decorate([
    (0, swagger_1.ApiTags)('scorm'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('scorm'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [scorm_service_1.ScormService])
], ScormController);
//# sourceMappingURL=scorm.controller.js.map