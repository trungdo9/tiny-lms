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
exports.SubmitAttemptDto = exports.SaveAnswerDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SaveAnswerDto {
    questionId;
    selectedOptions;
    textAnswer;
    orderAnswer;
    matchAnswer;
}
exports.SaveAnswerDto = SaveAnswerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'uuid', description: 'Question ID being answered' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SaveAnswerDto.prototype, "questionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: 'Selected option IDs (UUIDs) for choice-based questions' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], SaveAnswerDto.prototype, "selectedOptions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Free-text answer' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SaveAnswerDto.prototype, "textAnswer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: 'Ordered option IDs for ordering questions' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], SaveAnswerDto.prototype, "orderAnswer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Key-value pairs for matching questions', type: 'object', additionalProperties: { type: 'string' } }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SaveAnswerDto.prototype, "matchAnswer", void 0);
class SubmitAttemptDto {
    submit;
}
exports.SubmitAttemptDto = SubmitAttemptDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Set to true to finalize the attempt' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SubmitAttemptDto.prototype, "submit", void 0);
//# sourceMappingURL=attempt.dto.js.map