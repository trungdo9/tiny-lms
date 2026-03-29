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
exports.BulkCreateQuestionDto = exports.UpdateQuestionDto = exports.CreateQuestionDto = exports.CreateOptionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
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
    (0, swagger_1.ApiProperty)({ description: 'Question type (e.g. single_choice, multiple_choice, fill_blank, match, order)' }),
    (0, class_validator_1.IsString)(),
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
    (0, swagger_1.ApiPropertyOptional)({ description: 'Difficulty label (e.g. easy, medium, hard)' }),
    (0, class_validator_1.IsString)(),
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
    (0, swagger_1.ApiPropertyOptional)({ description: 'Difficulty label (e.g. easy, medium, hard)' }),
    (0, class_validator_1.IsString)(),
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
//# sourceMappingURL=question.dto.js.map