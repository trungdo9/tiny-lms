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
exports.AttemptsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const attempts_service_1 = require("./attempts.service");
const attempt_dto_1 = require("./dto/attempt.dto");
let AttemptsController = class AttemptsController {
    service;
    constructor(service) {
        this.service = service;
    }
    start(quizId, req) {
        return this.service.start(quizId, req.user.id);
    }
    getAttempt(id, req) {
        return this.service.getAttempt(id, req.user.id);
    }
    getPage(id, page, req) {
        return this.service.getPage(id, page, req.user.id);
    }
    saveAnswer(id, req, dto) {
        return this.service.saveAnswer(id, req.user.id, dto);
    }
    submit(id, req) {
        return this.service.submit(id, req.user.id);
    }
    getResult(id, req) {
        return this.service.getResult(id, req.user.id);
    }
    getUserAttempts(quizId, req) {
        return this.service.getUserAttempts(quizId, req.user.id);
    }
    toggleFlag(id, questionId, req) {
        return this.service.toggleFlag(id, questionId, req.user.id);
    }
    getAllQuestions(id, req) {
        return this.service.getAllQuestions(id, req.user.id);
    }
};
exports.AttemptsController = AttemptsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Start a new quiz attempt' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Attempt started' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    (0, common_1.Post)('quizzes/:quizId/start'),
    __param(0, (0, common_1.Param)('quizId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AttemptsController.prototype, "start", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get an attempt by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Attempt found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Attempt not found' }),
    (0, common_1.Get)('attempts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AttemptsController.prototype, "getAttempt", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get a paginated page of questions for an attempt' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Page of questions' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Attempt not found' }),
    (0, common_1.Get)('attempts/:id/page/:page'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('page')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", void 0)
], AttemptsController.prototype, "getPage", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Save an answer for a question in an attempt' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Answer saved' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Attempt not found' }),
    (0, common_1.Post)('attempts/:id/answers'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, attempt_dto_1.SaveAnswerDto]),
    __metadata("design:returntype", void 0)
], AttemptsController.prototype, "saveAnswer", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Submit an attempt for grading' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Attempt submitted' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Attempt not found' }),
    (0, common_1.Post)('attempts/:id/submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AttemptsController.prototype, "submit", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get the result of a submitted attempt' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Attempt result' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Attempt not found' }),
    (0, common_1.Get)('attempts/:id/result'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AttemptsController.prototype, "getResult", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'List all attempts by the current user for a quiz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of attempts' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    (0, common_1.Get)('quizzes/:quizId/attempts'),
    __param(0, (0, common_1.Param)('quizId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AttemptsController.prototype, "getUserAttempts", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Toggle flag on a question within an attempt' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Flag toggled' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Attempt or question not found' }),
    (0, common_1.Put)('attempts/:id/questions/:questionId/flag'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('questionId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AttemptsController.prototype, "toggleFlag", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all questions for an attempt' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of questions' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Attempt not found' }),
    (0, common_1.Get)('attempts/:id/questions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AttemptsController.prototype, "getAllQuestions", null);
exports.AttemptsController = AttemptsController = __decorate([
    (0, swagger_1.ApiTags)('attempts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [attempts_service_1.AttemptsService])
], AttemptsController);
//# sourceMappingURL=attempts.controller.js.map