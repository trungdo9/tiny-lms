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
exports.QuestionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const questions_service_1 = require("./questions.service");
const question_dto_1 = require("./dto/question.dto");
let QuestionsController = class QuestionsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(bankId, req, dto) {
        return this.service.create(bankId, req.user.id, req.user.role, dto);
    }
    bulkCreate(bankId, req, dto) {
        return this.service.bulkCreate(bankId, req.user.id, req.user.role, dto.questions);
    }
    update(id, req, dto) {
        return this.service.update(id, req.user.id, req.user.role, dto);
    }
    delete(id, req) {
        return this.service.delete(id, req.user.id, req.user.role);
    }
    addOptions(id, req, options) {
        return this.service.addOptions(id, req.user.id, req.user.role, options);
    }
    updateOptions(id, req, options) {
        return this.service.updateOptions(id, req.user.id, req.user.role, options);
    }
};
exports.QuestionsController = QuestionsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create a question in a bank' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Question created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question bank not found' }),
    (0, common_1.Post)('bank/:bankId'),
    __param(0, (0, common_1.Param)('bankId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, question_dto_1.CreateQuestionDto]),
    __metadata("design:returntype", void 0)
], QuestionsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Bulk create questions in a bank' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Questions created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question bank not found' }),
    (0, common_1.Post)('bank/:bankId/bulk'),
    __param(0, (0, common_1.Param)('bankId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, question_dto_1.BulkCreateQuestionDto]),
    __metadata("design:returntype", void 0)
], QuestionsController.prototype, "bulkCreate", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update a question' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Question updated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question not found' }),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, question_dto_1.UpdateQuestionDto]),
    __metadata("design:returntype", void 0)
], QuestionsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete a question' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Question deleted' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question not found' }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QuestionsController.prototype, "delete", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Add answer options to a question' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Options added' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question not found' }),
    (0, common_1.Post)(':id/options'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Array]),
    __metadata("design:returntype", void 0)
], QuestionsController.prototype, "addOptions", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Replace answer options on a question' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Options updated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question not found' }),
    (0, common_1.Put)(':id/options'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Array]),
    __metadata("design:returntype", void 0)
], QuestionsController.prototype, "updateOptions", null);
exports.QuestionsController = QuestionsController = __decorate([
    (0, swagger_1.ApiTags)('questions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('questions'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [questions_service_1.QuestionsService])
], QuestionsController);
//# sourceMappingURL=questions.controller.js.map