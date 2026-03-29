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
exports.ReorderLessonsDto = exports.UpdateLessonDto = exports.CreateLessonDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateLessonDto {
    title;
    type;
    content;
    videoUrl;
    videoProvider;
    pdfUrl;
    durationMins;
    orderIndex;
    isPreview;
    isPublished;
    prerequisiteLessonId;
    availableAfterDays;
}
exports.CreateLessonDto = CreateLessonDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lesson title' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['video', 'text', 'pdf', 'quiz', 'scorm'], description: 'Lesson content type' }),
    (0, class_validator_1.IsEnum)(['video', 'text', 'pdf', 'quiz', 'scorm']),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Rich-text or markdown content (for text lessons)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Video URL' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "videoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['youtube', 'vimeo', 's3', 'upload'], description: 'Video hosting provider' }),
    (0, class_validator_1.IsEnum)(['youtube', 'vimeo', 's3', 'upload']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "videoProvider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'PDF file URL' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "pdfUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Estimated duration in minutes' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateLessonDto.prototype, "durationMins", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Display order index within the module' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateLessonDto.prototype, "orderIndex", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether this lesson is available as a free preview' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateLessonDto.prototype, "isPreview", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether the lesson is published' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateLessonDto.prototype, "isPublished", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid', description: 'ID of the lesson that must be completed first' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "prerequisiteLessonId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of days after enrollment before this lesson becomes available' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateLessonDto.prototype, "availableAfterDays", void 0);
class UpdateLessonDto {
    title;
    type;
    content;
    videoUrl;
    videoProvider;
    pdfUrl;
    durationMins;
    orderIndex;
    isPreview;
    isPublished;
    prerequisiteLessonId;
    availableAfterDays;
}
exports.UpdateLessonDto = UpdateLessonDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lesson title' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['video', 'text', 'pdf', 'quiz', 'scorm'], description: 'Lesson content type' }),
    (0, class_validator_1.IsEnum)(['video', 'text', 'pdf', 'quiz', 'scorm']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Rich-text or markdown content (for text lessons)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Video URL' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "videoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['youtube', 'vimeo', 's3', 'upload'], description: 'Video hosting provider' }),
    (0, class_validator_1.IsEnum)(['youtube', 'vimeo', 's3', 'upload']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "videoProvider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'PDF file URL' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "pdfUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Estimated duration in minutes' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateLessonDto.prototype, "durationMins", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Display order index within the module' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateLessonDto.prototype, "orderIndex", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether this lesson is available as a free preview' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateLessonDto.prototype, "isPreview", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether the lesson is published' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateLessonDto.prototype, "isPublished", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid', description: 'ID of the lesson that must be completed first' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "prerequisiteLessonId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of days after enrollment before this lesson becomes available' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateLessonDto.prototype, "availableAfterDays", void 0);
class ReorderLessonsDto {
    lessonIds;
}
exports.ReorderLessonsDto = ReorderLessonsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], description: 'Lesson IDs in the desired display order' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ReorderLessonsDto.prototype, "lessonIds", void 0);
//# sourceMappingURL=lesson.dto.js.map