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
exports.AIGeneratedQuestion = exports.AIOption = void 0;
const swagger_1 = require("@nestjs/swagger");
class AIOption {
    content;
    isCorrect;
    matchKey;
    matchValue;
    orderIndex;
}
exports.AIOption = AIOption;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AIOption.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], AIOption.prototype, "isCorrect", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AIOption.prototype, "matchKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AIOption.prototype, "matchValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], AIOption.prototype, "orderIndex", void 0);
class AIGeneratedQuestion {
    type;
    content;
    explanation;
    difficulty;
    defaultScore;
    options;
    tags;
}
exports.AIGeneratedQuestion = AIGeneratedQuestion;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AIGeneratedQuestion.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AIGeneratedQuestion.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AIGeneratedQuestion.prototype, "explanation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AIGeneratedQuestion.prototype, "difficulty", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AIGeneratedQuestion.prototype, "defaultScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AIOption] }),
    __metadata("design:type", Array)
], AIGeneratedQuestion.prototype, "options", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], AIGeneratedQuestion.prototype, "tags", void 0);
//# sourceMappingURL=ai-question.dto.js.map