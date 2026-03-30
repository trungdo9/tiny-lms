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
exports.GradeSubmissionDto = exports.SubmitAssignmentDto = exports.UpdateAssignmentDto = exports.CreateAssignmentDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateAssignmentDto {
    instructions;
    maxScore;
    dueDate;
    allowLateSubmission;
    maxFileSize;
    allowedFileTypes;
}
exports.CreateAssignmentDto = CreateAssignmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Assignment instructions' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "instructions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum achievable score' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateAssignmentDto.prototype, "maxScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Due date (ISO 8601 date string)' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether late submissions are accepted' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateAssignmentDto.prototype, "allowLateSubmission", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum allowed file size in bytes' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateAssignmentDto.prototype, "maxFileSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: 'Allowed file MIME types or extensions' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateAssignmentDto.prototype, "allowedFileTypes", void 0);
class UpdateAssignmentDto extends CreateAssignmentDto {
}
exports.UpdateAssignmentDto = UpdateAssignmentDto;
class SubmitAssignmentDto {
    fileUrl;
    fileName;
    comment;
}
exports.SubmitAssignmentDto = SubmitAssignmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'URL of the submitted file' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitAssignmentDto.prototype, "fileUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Original file name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitAssignmentDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional comment from the student' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubmitAssignmentDto.prototype, "comment", void 0);
class GradeSubmissionDto {
    score;
    feedback;
}
exports.GradeSubmissionDto = GradeSubmissionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Score awarded' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], GradeSubmissionDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Instructor feedback' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GradeSubmissionDto.prototype, "feedback", void 0);
//# sourceMappingURL=assignment.dto.js.map