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
exports.QuestionBanksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const question_banks_service_1 = require("./question-banks.service");
const question_bank_dto_1 = require("./dto/question-bank.dto");
let QuestionBanksController = class QuestionBanksController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(req, dto) {
        return this.service.create(req.user.id, dto);
    }
    findAll(req, courseId) {
        return this.service.findAll(req.user.id, courseId);
    }
    findById(id, req) {
        return this.service.findById(id, req.user.id);
    }
    update(id, req, dto) {
        return this.service.update(id, req.user.id, dto);
    }
    delete(id, req) {
        return this.service.delete(id, req.user.id);
    }
    getQuestions(id, req) {
        return this.service.getQuestions(id, req.user.id);
    }
};
exports.QuestionBanksController = QuestionBanksController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create a question bank' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Question bank created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, question_bank_dto_1.CreateQuestionBankDto]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'List all question banks for the current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of question banks' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get a question bank by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Question bank found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question bank not found' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "findById", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update a question bank' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Question bank updated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question bank not found' }),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, question_bank_dto_1.UpdateQuestionBankDto]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete a question bank' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Question bank deleted' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question bank not found' }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "delete", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all questions in a question bank' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of questions' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question bank not found' }),
    (0, common_1.Get)(':id/questions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QuestionBanksController.prototype, "getQuestions", null);
exports.QuestionBanksController = QuestionBanksController = __decorate([
    (0, swagger_1.ApiTags)('question-banks'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('question-banks'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [question_banks_service_1.QuestionBanksService])
], QuestionBanksController);
//# sourceMappingURL=question-banks.controller.js.map