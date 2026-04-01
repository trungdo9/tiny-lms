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
exports.GenerateQuestionsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class GenerateQuestionsDto {
    topic;
    context;
    types;
    difficulty;
    count;
}
exports.GenerateQuestionsDto = GenerateQuestionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Topic for question generation (e.g. "JavaScript closures")', minLength: 3, maxLength: 500 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], GenerateQuestionsDto.prototype, "topic", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional context or excerpt for generating more relevant questions', maxLength: 2000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], GenerateQuestionsDto.prototype, "context", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Question types to generate', type: [String], enum: ['single', 'multi', 'true_false', 'short_answer', 'essay'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], GenerateQuestionsDto.prototype, "types", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Difficulty level', enum: ['easy', 'medium', 'hard', 'mixed'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['easy', 'medium', 'hard', 'mixed']),
    __metadata("design:type", String)
], GenerateQuestionsDto.prototype, "difficulty", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of questions to generate (1-20)', minimum: 1, maximum: 20 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], GenerateQuestionsDto.prototype, "count", void 0);
//# sourceMappingURL=generate-questions.dto.js.map