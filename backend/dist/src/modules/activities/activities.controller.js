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
exports.ActivitiesController = exports.LessonActivitiesController = void 0;
const common_1 = require("@nestjs/common");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const activities_service_1 = require("./activities.service");
const activity_dto_1 = require("./dto/activity.dto");
let LessonActivitiesController = class LessonActivitiesController {
    service;
    constructor(service) {
        this.service = service;
    }
    findByLesson(lessonId) {
        return this.service.findByLesson(lessonId);
    }
    create(req, lessonId, dto) {
        return this.service.create(req.user.id, lessonId, dto);
    }
    reorder(req, lessonId, body) {
        return this.service.reorder(req.user.id, lessonId, body.activityIds);
    }
};
exports.LessonActivitiesController = LessonActivitiesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('lessonId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LessonActivitiesController.prototype, "findByLesson", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('lessonId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, activity_dto_1.CreateActivityDto]),
    __metadata("design:returntype", void 0)
], LessonActivitiesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('reorder'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('lessonId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, activity_dto_1.ReorderActivitiesDto]),
    __metadata("design:returntype", void 0)
], LessonActivitiesController.prototype, "reorder", null);
exports.LessonActivitiesController = LessonActivitiesController = __decorate([
    (0, common_1.Controller)('lessons/:lessonId/activities'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [activities_service_1.ActivitiesService])
], LessonActivitiesController);
let ActivitiesController = class ActivitiesController {
    service;
    constructor(service) {
        this.service = service;
    }
    findById(id) {
        return this.service.findById(id);
    }
    update(req, id, dto) {
        return this.service.update(req.user.id, id, dto);
    }
    delete(req, id) {
        return this.service.delete(req.user.id, id);
    }
};
exports.ActivitiesController = ActivitiesController;
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, activity_dto_1.UpdateActivityDto]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "delete", null);
exports.ActivitiesController = ActivitiesController = __decorate([
    (0, common_1.Controller)('activities'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [activities_service_1.ActivitiesService])
], ActivitiesController);
//# sourceMappingURL=activities.controller.js.map