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
exports.UpdateInstructorRoleDto = exports.AssignInstructorDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class AssignInstructorDto {
    userId;
    role;
}
exports.AssignInstructorDto = AssignInstructorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'uuid' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AssignInstructorDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['primary', 'co_instructor'], example: 'co_instructor' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['primary', 'co_instructor']),
    __metadata("design:type", String)
], AssignInstructorDto.prototype, "role", void 0);
class UpdateInstructorRoleDto {
    role;
}
exports.UpdateInstructorRoleDto = UpdateInstructorRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['primary', 'co_instructor'], example: 'primary' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['primary', 'co_instructor']),
    __metadata("design:type", String)
], UpdateInstructorRoleDto.prototype, "role", void 0);
//# sourceMappingURL=course-instructor.dto.js.map