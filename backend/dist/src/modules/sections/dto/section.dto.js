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
exports.ReorderSectionsDto = exports.UpdateSectionDto = exports.CreateSectionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateSectionDto {
    title;
    orderIndex;
}
exports.CreateSectionDto = CreateSectionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Introduction' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSectionDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSectionDto.prototype, "orderIndex", void 0);
class UpdateSectionDto {
    title;
    orderIndex;
}
exports.UpdateSectionDto = UpdateSectionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Introduction' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSectionDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateSectionDto.prototype, "orderIndex", void 0);
class ReorderSectionsDto {
    sectionIds;
}
exports.ReorderSectionsDto = ReorderSectionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], example: ['uuid-1', 'uuid-2'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ReorderSectionsDto.prototype, "sectionIds", void 0);
//# sourceMappingURL=section.dto.js.map