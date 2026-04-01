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
exports.AiQuestionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const ai_questions_service_1 = require("./ai-questions.service");
const generate_questions_dto_1 = require("./dto/generate-questions.dto");
const ai_question_dto_1 = require("./dto/ai-question.dto");
let AiQuestionsController = class AiQuestionsController {
    aiQuestionsService;
    constructor(aiQuestionsService) {
        this.aiQuestionsService = aiQuestionsService;
    }
    async generate(dto, req) {
        const role = req.user?.role;
        if (role !== 'instructor' && role !== 'admin') {
            throw new common_1.ForbiddenException('Only instructors and admins can generate questions');
        }
        return this.aiQuestionsService.generateQuestions(dto);
    }
};
exports.AiQuestionsController = AiQuestionsController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate quiz questions using AI (GPT-4o-mini)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Questions generated successfully', type: [ai_question_dto_1.AIGeneratedQuestion] }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request parameters' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Only instructors and admins can generate questions' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'OpenAI API error or configuration issue' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_questions_dto_1.GenerateQuestionsDto, Object]),
    __metadata("design:returntype", Promise)
], AiQuestionsController.prototype, "generate", null);
exports.AiQuestionsController = AiQuestionsController = __decorate([
    (0, swagger_1.ApiTags)('AI Questions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, common_1.Controller)('ai-questions'),
    __metadata("design:paramtypes", [ai_questions_service_1.AiQuestionsService])
], AiQuestionsController);
//# sourceMappingURL=ai-questions.controller.js.map