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
exports.CloneQuizDto = exports.AddQuizQuestionDto = exports.UpdateQuizDto = exports.CreateQuizDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateQuizDto {
    title;
    description;
    timeLimitMinutes;
    maxAttempts;
    passScore;
    showResult;
    showCorrectAnswer;
    showExplanation;
    shuffleQuestions;
    shuffleAnswers;
    paginationMode;
    questionsPerPage;
    allowBackNavigation;
    isPublished;
    availableFrom;
    availableUntil;
    showLeaderboard;
}
exports.CreateQuizDto = CreateQuizDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Chapter 1 Quiz' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Test your knowledge of chapter 1.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, example: 30 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateQuizDto.prototype, "timeLimitMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, example: 3 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateQuizDto.prototype, "maxAttempts", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 100, example: 70 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateQuizDto.prototype, "passScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['immediately', 'after_closed', 'never'], example: 'immediately' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['immediately', 'after_closed', 'never']),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "showResult", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateQuizDto.prototype, "showCorrectAnswer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateQuizDto.prototype, "showExplanation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateQuizDto.prototype, "shuffleQuestions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateQuizDto.prototype, "shuffleAnswers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['all', 'paginated', 'one_by_one'], example: 'all' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['all', 'paginated', 'one_by_one']),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "paginationMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, example: 10 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateQuizDto.prototype, "questionsPerPage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateQuizDto.prototype, "allowBackNavigation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateQuizDto.prototype, "isPublished", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-01-01T00:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "availableFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-12-31T23:59:59.000Z' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "availableUntil", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateQuizDto.prototype, "showLeaderboard", void 0);
class UpdateQuizDto {
    title;
    description;
    timeLimitMinutes;
    maxAttempts;
    passScore;
    showResult;
    showCorrectAnswer;
    showExplanation;
    shuffleQuestions;
    shuffleAnswers;
    paginationMode;
    questionsPerPage;
    allowBackNavigation;
    isPublished;
    availableFrom;
    availableUntil;
    showLeaderboard;
}
exports.UpdateQuizDto = UpdateQuizDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Chapter 1 Quiz' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuizDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Test your knowledge of chapter 1.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuizDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, example: 30 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateQuizDto.prototype, "timeLimitMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, example: 3 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateQuizDto.prototype, "maxAttempts", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 100, example: 70 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateQuizDto.prototype, "passScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['immediately', 'after_closed', 'never'], example: 'immediately' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['immediately', 'after_closed', 'never']),
    __metadata("design:type", String)
], UpdateQuizDto.prototype, "showResult", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateQuizDto.prototype, "showCorrectAnswer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateQuizDto.prototype, "showExplanation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateQuizDto.prototype, "shuffleQuestions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateQuizDto.prototype, "shuffleAnswers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['all', 'paginated', 'one_by_one'], example: 'all' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['all', 'paginated', 'one_by_one']),
    __metadata("design:type", String)
], UpdateQuizDto.prototype, "paginationMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, example: 10 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateQuizDto.prototype, "questionsPerPage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateQuizDto.prototype, "allowBackNavigation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateQuizDto.prototype, "isPublished", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-01-01T00:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuizDto.prototype, "availableFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-12-31T23:59:59.000Z' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuizDto.prototype, "availableUntil", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateQuizDto.prototype, "showLeaderboard", void 0);
class AddQuizQuestionDto {
    questionId;
    bankId;
    pickCount;
    difficultyFilter;
    tagFilter;
    scoreOverride;
}
exports.AddQuizQuestionDto = AddQuizQuestionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddQuizQuestionDto.prototype, "questionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddQuizQuestionDto.prototype, "bankId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, example: 5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AddQuizQuestionDto.prototype, "pickCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'medium' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddQuizQuestionDto.prototype, "difficultyFilter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['grammar', 'vocab'] }),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], AddQuizQuestionDto.prototype, "tagFilter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, example: 10 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AddQuizQuestionDto.prototype, "scoreOverride", void 0);
class CloneQuizDto {
    targetLessonId;
}
exports.CloneQuizDto = CloneQuizDto;
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'uuid' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CloneQuizDto.prototype, "targetLessonId", void 0);
//# sourceMappingURL=quiz.dto.js.map