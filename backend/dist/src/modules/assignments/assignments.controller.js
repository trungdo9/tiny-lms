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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const assignments_service_1 = require("./assignments.service");
const assignment_dto_1 = require("./dto/assignment.dto");
let AssignmentsController = class AssignmentsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async create(activityId, dto, req) {
        return this.service.create(activityId, dto, req.user.id);
    }
    async findOne(id) {
        return this.service.findOne(id);
    }
    async update(id, dto, req) {
        return this.service.update(id, dto, req.user.id);
    }
    async submit(id, dto, req) {
        return this.service.submit(id, dto, req.user.id);
    }
    async grade(subId, dto, req) {
        return this.service.grade(subId, dto, req.user.id);
    }
    async getSubmissions(id, req) {
        return this.service.getSubmissions(id, req.user.id);
    }
};
exports.AssignmentsController = AssignmentsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create an assignment for an activity' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Assignment created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Activity not found' }),
    (0, common_1.Post)('activity/:activityId'),
    __param(0, (0, common_1.Param)('activityId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assignment_dto_1.CreateAssignmentDto, Object]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get an assignment by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Assignment found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Assignment not found' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update an assignment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Assignment updated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Assignment not found' }),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assignment_dto_1.UpdateAssignmentDto, Object]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Submit an assignment' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Submission recorded' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Assignment not found' }),
    (0, common_1.Post)(':id/submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assignment_dto_1.SubmitAssignmentDto, Object]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "submit", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Grade an assignment submission' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Submission graded' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Submission not found' }),
    (0, common_1.Patch)('submissions/:subId/grade'),
    __param(0, (0, common_1.Param)('subId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assignment_dto_1.GradeSubmissionDto, Object]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "grade", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all submissions for an assignment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of submissions' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Assignment not found' }),
    (0, common_1.Get)(':id/submissions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "getSubmissions", null);
exports.AssignmentsController = AssignmentsController = __decorate([
    (0, swagger_1.ApiTags)('assignments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('assignments'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [assignments_service_1.AssignmentsService])
], AssignmentsController);
//# sourceMappingURL=assignments.controller.js.map