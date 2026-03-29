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
exports.AssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let AssignmentsService = class AssignmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(activityId, dto, userId) {
        const activity = await this.prisma.activity.findUnique({
            where: { id: activityId },
            include: { lesson: { include: { course: true } } },
        });
        if (!activity)
            throw new common_1.NotFoundException('Activity not found');
        if (activity.activityType !== 'assignment') {
            throw new common_1.BadRequestException('Activity type must be "assignment"');
        }
        if (activity.lesson.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You can only create assignments for your own courses');
        }
        return this.prisma.assignment.create({
            data: {
                activityId,
                instructions: dto.instructions,
                maxScore: dto.maxScore,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                allowLateSubmission: dto.allowLateSubmission ?? false,
                maxFileSize: dto.maxFileSize,
                allowedFileTypes: dto.allowedFileTypes || [],
            },
        });
    }
    async findOne(id) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id },
            include: {
                activity: { select: { title: true, lessonId: true } },
                _count: { select: { submissions: true } },
            },
        });
        if (!assignment)
            throw new common_1.NotFoundException('Assignment not found');
        return assignment;
    }
    async update(id, dto, userId) {
        const assignment = await this.getAssignmentWithOwnerCheck(id, userId);
        return this.prisma.assignment.update({
            where: { id },
            data: {
                instructions: dto.instructions,
                maxScore: dto.maxScore,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                allowLateSubmission: dto.allowLateSubmission,
                maxFileSize: dto.maxFileSize,
                allowedFileTypes: dto.allowedFileTypes,
            },
        });
    }
    async submit(assignmentId, dto, userId) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: { activity: { include: { lesson: true } } },
        });
        if (!assignment)
            throw new common_1.NotFoundException('Assignment not found');
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId: assignment.activity.lesson.courseId } },
        });
        if (!enrollment) {
            throw new common_1.ForbiddenException('You must be enrolled to submit assignments');
        }
        if (assignment.dueDate && new Date() > assignment.dueDate && !assignment.allowLateSubmission) {
            throw new common_1.BadRequestException('Submission deadline has passed');
        }
        return this.prisma.assignmentSubmission.upsert({
            where: { assignmentId_userId: { assignmentId, userId } },
            update: {
                fileUrl: dto.fileUrl,
                fileName: dto.fileName,
                comment: dto.comment,
                submittedAt: new Date(),
                score: null,
                feedback: null,
                gradedBy: null,
                gradedAt: null,
            },
            create: {
                assignmentId,
                userId,
                fileUrl: dto.fileUrl,
                fileName: dto.fileName,
                comment: dto.comment,
            },
        });
    }
    async grade(submissionId, dto, graderId) {
        const submission = await this.prisma.assignmentSubmission.findUnique({
            where: { id: submissionId },
            include: {
                assignment: {
                    include: { activity: { include: { lesson: { include: { course: true } } } } },
                },
            },
        });
        if (!submission)
            throw new common_1.NotFoundException('Submission not found');
        const course = submission.assignment.activity.lesson.course;
        if (course.instructorId !== graderId) {
            throw new common_1.ForbiddenException('Only the course instructor can grade submissions');
        }
        return this.prisma.assignmentSubmission.update({
            where: { id: submissionId },
            data: {
                score: dto.score,
                feedback: dto.feedback,
                gradedBy: graderId,
                gradedAt: new Date(),
            },
        });
    }
    async getSubmissions(assignmentId, userId) {
        await this.getAssignmentWithOwnerCheck(assignmentId, userId);
        return this.prisma.assignmentSubmission.findMany({
            where: { assignmentId },
            include: {
                student: { select: { id: true, fullName: true, avatarUrl: true } },
            },
            orderBy: { submittedAt: 'desc' },
        });
    }
    async getAssignmentWithOwnerCheck(id, userId) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id },
            include: { activity: { include: { lesson: { include: { course: true } } } } },
        });
        if (!assignment)
            throw new common_1.NotFoundException('Assignment not found');
        if (assignment.activity.lesson.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You can only manage your own assignments');
        }
        return assignment;
    }
};
exports.AssignmentsService = AssignmentsService;
exports.AssignmentsService = AssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssignmentsService);
//# sourceMappingURL=assignments.service.js.map