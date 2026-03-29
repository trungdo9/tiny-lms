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
exports.GradingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const grading_service_1 = require("./grading.service");
let GradingController = class GradingController {
    service;
    constructor(service) {
        this.service = service;
    }
    getPendingGrading(req, quizId) {
        return this.service.getPendingGrading(req.user.id, quizId);
    }
    gradeAnswer(attemptId, answerId, req, data) {
        return this.service.gradeAnswer(attemptId, answerId, req.user.id, data);
    }
};
exports.GradingController = GradingController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get answers pending manual grading' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of pending answers' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, common_1.Get)('pending'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('quizId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], GradingController.prototype, "getPendingGrading", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Grade a specific answer in an attempt' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Answer graded' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Attempt or answer not found' }),
    (0, common_1.Post)('attempts/:attemptId/answers/:answerId/grade'),
    __param(0, (0, common_1.Param)('attemptId')),
    __param(1, (0, common_1.Param)('answerId')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], GradingController.prototype, "gradeAnswer", null);
exports.GradingController = GradingController = __decorate([
    (0, swagger_1.ApiTags)('grading'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('grading'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [grading_service_1.GradingService])
], GradingController);
//# sourceMappingURL=grading.controller.js.map