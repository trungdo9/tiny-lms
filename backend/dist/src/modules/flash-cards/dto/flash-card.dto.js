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
exports.CompleteSessionDto = exports.UpdateCardDto = exports.CreateCardDto = exports.UpdateDeckDto = exports.CreateDeckDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateDeckDto {
    title;
    description;
    shuffleCards;
    isPublished;
}
exports.CreateDeckDto = CreateDeckDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Deck title' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeckDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Deck description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDeckDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether cards should be presented in random order' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateDeckDto.prototype, "shuffleCards", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether the deck is published and visible to learners' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateDeckDto.prototype, "isPublished", void 0);
class UpdateDeckDto {
    title;
    description;
    shuffleCards;
    isPublished;
}
exports.UpdateDeckDto = UpdateDeckDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Deck title' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDeckDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Deck description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDeckDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether cards should be presented in random order' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateDeckDto.prototype, "shuffleCards", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether the deck is published and visible to learners' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateDeckDto.prototype, "isPublished", void 0);
class CreateCardDto {
    front;
    back;
    hint;
    imageUrl;
    orderIndex;
}
exports.CreateCardDto = CreateCardDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Front face content of the flash card' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCardDto.prototype, "front", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Back face content of the flash card' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCardDto.prototype, "back", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional hint shown to the learner' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCardDto.prototype, "hint", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL of an image associated with the card' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCardDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Display order index within the deck' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateCardDto.prototype, "orderIndex", void 0);
class UpdateCardDto {
    front;
    back;
    hint;
    imageUrl;
    orderIndex;
}
exports.UpdateCardDto = UpdateCardDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Front face content of the flash card' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCardDto.prototype, "front", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Back face content of the flash card' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCardDto.prototype, "back", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional hint shown to the learner' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCardDto.prototype, "hint", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL of an image associated with the card' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCardDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Display order index within the deck' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateCardDto.prototype, "orderIndex", void 0);
class CompleteSessionDto {
    knownCards;
    timeSpentSecs;
}
exports.CompleteSessionDto = CompleteSessionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of cards the learner marked as known' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CompleteSessionDto.prototype, "knownCards", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total time spent in the session, in seconds' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CompleteSessionDto.prototype, "timeSpentSecs", void 0);
//# sourceMappingURL=flash-card.dto.js.map