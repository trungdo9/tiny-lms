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
exports.ImportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../../../common/guards/supabase-auth.guard");
const import_service_1 = require("./import.service");
let ImportController = class ImportController {
    importService;
    constructor(importService) {
        this.importService = importService;
    }
    preview(bankId, content) {
        const isExcel = content.startsWith('UklGR');
        if (isExcel) {
            const buffer = Buffer.from(content, 'base64');
            return this.importService.parseExcel(buffer);
        }
        return this.importService.parseCSV(content);
    }
    getTemplate(res) {
        const template = this.importService.generateTemplate();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=questions_template.csv');
        res.send(template);
    }
};
exports.ImportController = ImportController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Preview questions parsed from CSV or Excel content' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Parsed question preview' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question bank not found' }),
    (0, common_1.Post)(':id/import/preview'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('content')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ImportController.prototype, "preview", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Download CSV import template for a question bank' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'CSV template file' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question bank not found' }),
    (0, common_1.Post)(':id/import/template'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ImportController.prototype, "getTemplate", null);
exports.ImportController = ImportController = __decorate([
    (0, swagger_1.ApiTags)('question-banks'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('question-banks'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [import_service_1.ImportService])
], ImportController);
//# sourceMappingURL=import.controller.js.map