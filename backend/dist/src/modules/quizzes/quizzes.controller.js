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
exports.QuizzesController = exports.LessonQuizzesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const quizzes_service_1 = require("./quizzes.service");
const quiz_dto_1 = require("./dto/quiz.dto");
let LessonQuizzesController = class LessonQuizzesController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(req, lessonId, dto) {
        return this.service.create(req.user.id, lessonId, dto, req.user.role);
    }
    findByLesson(lessonId, req) {
        return this.service.findByLesson(lessonId, req.user?.id, req.user?.role);
    }
};
exports.LessonQuizzesController = LessonQuizzesController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create a quiz for a lesson (max 1 per lesson)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Quiz created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lesson not found' }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('lessonId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, quiz_dto_1.CreateQuizDto]),
    __metadata("design:returntype", void 0)
], LessonQuizzesController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get the quiz attached to a lesson' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quiz or null' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lesson not found' }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('lessonId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LessonQuizzesController.prototype, "findByLesson", null);
exports.LessonQuizzesController = LessonQuizzesController = __decorate([
    (0, swagger_1.ApiTags)('quizzes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('lessons/:lessonId/quizzes'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [quizzes_service_1.QuizzesService])
], LessonQuizzesController);
let QuizzesController = class QuizzesController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(courseId, sectionId) {
        return this.service.findAll(courseId, sectionId);
    }
    findById(id) {
        return this.service.findById(id);
    }
    update(id, req, dto) {
        return this.service.update(id, req.user.id, dto, req.user.role);
    }
    delete(id, req) {
        return this.service.delete(id, req.user.id, req.user.role);
    }
    clone(id, req, dto) {
        return this.service.clone(id, req.user.id, dto, req.user.role);
    }
    getQuestions(id) {
        return this.service.getQuestions(id);
    }
    addQuestion(id, req, dto) {
        return this.service.addQuestion(id, req.user.id, dto, req.user.role);
    }
    removeQuestion(id, quizQuestionId, req) {
        return this.service.removeQuestion(id, quizQuestionId, req.user.id, req.user.role);
    }
    getLeaderboard(id, limit) {
        return this.service.getLeaderboard(id, limit ? parseInt(limit, 10) : 10);
    }
};
exports.QuizzesController = QuizzesController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'List quizzes, optionally filtered by courseId or sectionId' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of quizzes' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('courseId')),
    __param(1, (0, common_1.Query)('sectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get a quiz by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quiz found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "findById", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update a quiz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quiz updated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, quiz_dto_1.UpdateQuizDto]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete a quiz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quiz deleted' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "delete", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Clone a quiz into a different lesson' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Quiz cloned' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    (0, common_1.Post)(':id/clone'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, quiz_dto_1.CloneQuizDto]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "clone", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all questions in a quiz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of quiz questions' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    (0, common_1.Get)(':id/questions'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "getQuestions", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Add a question to a quiz' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Question added' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    (0, common_1.Post)(':id/questions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, quiz_dto_1.AddQuizQuestionDto]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "addQuestion", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Remove a question from a quiz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Question removed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz or question not found' }),
    (0, common_1.Delete)(':id/questions/:quizQuestionId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('quizQuestionId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "removeQuestion", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get quiz leaderboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Leaderboard entries' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    (0, common_1.Get)(':id/leaderboard'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "getLeaderboard", null);
exports.QuizzesController = QuizzesController = __decorate([
    (0, swagger_1.ApiTags)('quizzes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('quizzes'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [quizzes_service_1.QuizzesService])
], QuizzesController);
//# sourceMappingURL=quizzes.controller.js.map