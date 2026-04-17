"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
const fs = __importStar(require("fs"));
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const questions_service_1 = require("./questions.service");
const questions_management_service_1 = require("./questions-management.service");
const question_dto_1 = require("./dto/question.dto");
let QuestionsController = class QuestionsController {
    service;
    management;
    constructor(service, management) {
        this.service = service;
        this.management = management;
    }
    findAll(bankId, req, query) {
        return this.service.findAll(bankId, req.user.id, req.user.role, query);
    }
    uploadImage(file) {
        return { url: `/uploads/images/${file.filename}` };
    }
    findOne(id, req) {
        return this.service.findOne(id, req.user.id, req.user.role);
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
    clone(id, req, dto) {
        return this.management.clone(id, req.user.id, req.user.role, dto);
    }
    move(id, req, dto) {
        return this.management.move(id, req.user.id, req.user.role, dto);
    }
    addOptions(id, req, options) {
        return this.management.addOptions(id, req.user.id, req.user.role, options);
    }
    updateOptions(id, req, options) {
        return this.management.updateOptions(id, req.user.id, req.user.role, options);
    }
};
exports.QuestionsController = QuestionsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'List questions in a bank with filters and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated questions list' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question bank not found' }),
    (0, common_1.Get)('bank/:bankId'),
    __param(0, (0, common_1.Param)('bankId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, question_dto_1.ListQuestionsQueryDto]),
    __metadata("design:returntype", void 0)
], QuestionsController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Upload an image for drag_drop_image questions' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Image uploaded, returns { url }' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Not an image or exceeds 5MB' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, common_1.Post)('upload-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => {
                const dest = path.join(process.cwd(), 'public', 'uploads', 'images');
                fs.mkdirSync(dest, { recursive: true });
                cb(null, dest);
            },
            filename: (_req, file, cb) => {
                cb(null, `${(0, crypto_1.randomUUID)()}${path.extname(file.originalname)}`);
            },
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                cb(new common_1.BadRequestException('Only images allowed'), false);
            }
            else {
                cb(null, true);
            }
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], QuestionsController.prototype, "uploadImage", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get a single question by ID with usage count' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Question detail' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question not found' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QuestionsController.prototype, "findOne", null);
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
    (0, swagger_1.ApiOperation)({ summary: 'Update a question (optionally replace options inline)' }),
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
    (0, swagger_1.ApiOperation)({ summary: 'Clone a question (optionally to a different bank)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Question cloned' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question not found' }),
    (0, common_1.Post)(':id/clone'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, question_dto_1.CloneQuestionDto]),
    __metadata("design:returntype", void 0)
], QuestionsController.prototype, "clone", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Move a question to another bank (blocked if used in any quiz)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Question moved' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Question is used in one or more quizzes' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question not found' }),
    (0, common_1.Patch)(':id/move'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, question_dto_1.MoveQuestionDto]),
    __metadata("design:returntype", void 0)
], QuestionsController.prototype, "move", null);
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
    (0, swagger_1.ApiOperation)({ summary: 'Replace all answer options on a question' }),
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
    __metadata("design:paramtypes", [questions_service_1.QuestionsService,
        questions_management_service_1.QuestionsManagementService])
], QuestionsController);
//# sourceMappingURL=questions.controller.js.map