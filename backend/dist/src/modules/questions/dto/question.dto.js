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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveQuestionDto = exports.CloneQuestionDto = exports.ListQuestionsQueryDto = exports.BulkCreateQuestionDto = exports.UpdateQuestionDto = exports.CreateQuestionDto = exports.CreateOptionDto = exports.VALID_DIFFICULTIES = exports.VALID_QUESTION_TYPES = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const question_difficulty_util_1 = require("../question-difficulty.util");
exports.VALID_QUESTION_TYPES = ['single', 'multi', 'true_false', 'short_answer', 'essay', 'matching', 'ordering', 'cloze', 'drag_drop_text', 'drag_drop_image'];
exports.VALID_DIFFICULTIES = [...question_difficulty_util_1.CANONICAL_QUESTION_DIFFICULTIES];
class CreateOptionDto {
    content;
    isCorrect;
    matchKey;
    matchValue;
}
exports.CreateOptionDto = CreateOptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Option text content' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOptionDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether this option is the correct answer' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateOptionDto.prototype, "isCorrect", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Matching key (for match-type questions)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOptionDto.prototype, "matchKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Matching value (for match-type questions)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOptionDto.prototype, "matchValue", void 0);
class CreateQuestionDto {
    type;
    content;
    explanation;
    mediaUrl;
    mediaType;
    difficulty;
    defaultScore;
    tags;
    options;
}
exports.CreateQuestionDto = CreateQuestionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: exports.VALID_QUESTION_TYPES, description: 'Question type' }),
    (0, class_validator_1.IsIn)(exports.VALID_QUESTION_TYPES),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Question text content' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Explanation shown after answering' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "explanation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL of associated media' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "mediaUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Media type (e.g. image, video)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "mediaType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: exports.VALID_DIFFICULTIES, default: 'medium', description: 'Difficulty level' }),
    (0, class_validator_1.IsIn)(exports.VALID_DIFFICULTIES),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "difficulty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, description: 'Default score for this question' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateQuestionDto.prototype, "defaultScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: 'Tags for categorization' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateQuestionDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: () => CreateOptionDto, isArray: true, description: 'Answer options' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateOptionDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateQuestionDto.prototype, "options", void 0);
class UpdateQuestionDto {
    content;
    explanation;
    mediaUrl;
    mediaType;
    difficulty;
    defaultScore;
    tags;
    options;
}
exports.UpdateQuestionDto = UpdateQuestionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Question text content' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuestionDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Explanation shown after answering' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuestionDto.prototype, "explanation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL of associated media' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuestionDto.prototype, "mediaUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Media type (e.g. image, video)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuestionDto.prototype, "mediaType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: exports.VALID_DIFFICULTIES, description: 'Difficulty level' }),
    (0, class_validator_1.IsIn)(exports.VALID_DIFFICULTIES),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuestionDto.prototype, "difficulty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, description: 'Default score for this question' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateQuestionDto.prototype, "defaultScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: 'Tags for categorization' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateQuestionDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: () => CreateOptionDto, isArray: true, description: 'Replace all answer options inline (optional)' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateOptionDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateQuestionDto.prototype, "options", void 0);
class BulkCreateQuestionDto {
    questions;
}
exports.BulkCreateQuestionDto = BulkCreateQuestionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => CreateQuestionDto, isArray: true, description: 'List of questions to create' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateQuestionDto),
    __metadata("design:type", Array)
], BulkCreateQuestionDto.prototype, "questions", void 0);
class ListQuestionsQueryDto {
    search;
    type;
    difficulty;
    tags;
    page = 1;
    limit = 20;
}
exports.ListQuestionsQueryDto = ListQuestionsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Full-text search on question content' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListQuestionsQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by types (comma-separated)', example: 'single,multi' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListQuestionsQueryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by difficulties (comma-separated)', example: 'easy,medium' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListQuestionsQueryDto.prototype, "difficulty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by tags (comma-separated, any match)', example: 'math,algebra' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListQuestionsQueryDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1, minimum: 1, description: 'Page number' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ListQuestionsQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20, minimum: 1, maximum: 100, description: 'Items per page' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ListQuestionsQueryDto.prototype, "limit", void 0);
class CloneQuestionDto {
    targetBankId;
}
exports.CloneQuestionDto = CloneQuestionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target bank ID to clone into (defaults to same bank)' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CloneQuestionDto.prototype, "targetBankId", void 0);
class MoveQuestionDto {
    targetBankId;
}
exports.MoveQuestionDto = MoveQuestionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target bank ID to move question to' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], MoveQuestionDto.prototype, "targetBankId", void 0);
//# sourceMappingURL=question.dto.js.map