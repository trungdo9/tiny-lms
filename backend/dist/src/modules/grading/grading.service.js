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
exports.GradingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let GradingService = class GradingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPendingGrading(instructorId, quizId) {
        const where = {
            quiz: {
                isPublished: true,
            },
            status: 'submitted',
        };
        if (quizId) {
            where.quizId = quizId;
        }
        const attempts = await this.prisma.quizAttempt.findMany({
            where,
            include: {
                quiz: { select: { id: true, title: true, courseId: true } },
                user: { select: { id: true, fullName: true } },
                answers: {
                    where: {
                        question: { type: 'essay' },
                    },
                    include: {
                        question: { select: { id: true, content: true, defaultScore: true } },
                    },
                },
            },
            orderBy: { submittedAt: 'desc' },
        });
        return attempts.map(attempt => ({
            ...attempt,
            answers: attempt.answers.filter(a => a.scoreEarned === null),
        })).filter(attempt => attempt.answers.length > 0);
    }
    async gradeAnswer(attemptId, answerId, instructorId, data) {
        const attempt = await this.prisma.quizAttempt.findUnique({
            where: { id: attemptId },
            include: { quiz: { include: { course: true } } },
        });
        if (!attempt) {
            throw new common_1.NotFoundException('Attempt not found');
        }
        if (attempt.quiz.course?.instructorId !== instructorId) {
            throw new common_1.ForbiddenException('You can only grade quizzes for your own courses');
        }
        const answer = await this.prisma.quizAnswer.findFirst({
            where: { id: answerId, attemptId },
            include: { question: true },
        });
        if (!answer) {
            throw new common_1.NotFoundException('Answer not found');
        }
        if (answer.question.type !== 'essay') {
            throw new common_1.BadRequestException('This answer does not require manual grading');
        }
        if (data.score > Number(answer.question.defaultScore)) {
            throw new common_1.BadRequestException(`Score cannot exceed ${answer.question.defaultScore}`);
        }
        const updated = await this.prisma.quizAnswer.update({
            where: { id: answerId },
            data: {
                scoreEarned: data.score,
                isCorrect: data.score >= Number(answer.question.defaultScore) * 0.5,
            },
        });
        await this.recalculateAttempt(attemptId);
        return updated;
    }
    async recalculateAttempt(attemptId) {
        const attempt = await this.prisma.quizAttempt.findUnique({
            where: { id: attemptId },
            include: {
                attemptQuestions: {
                    include: { question: true },
                },
                answers: true,
                quiz: true,
            },
        });
        if (!attempt)
            return;
        let totalScore = 0;
        let maxScore = 0;
        for (const aq of attempt.attemptQuestions) {
            maxScore += Number(aq.question.defaultScore) || 1;
            const answer = attempt.answers.find((a) => a.questionId === aq.questionId);
            if (answer?.scoreEarned) {
                totalScore += Number(answer.scoreEarned);
            }
        }
        const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
        const passScore = attempt.quiz?.passScore ? Number(attempt.quiz.passScore) : 0;
        await this.prisma.quizAttempt.update({
            where: { id: attemptId },
            data: {
                totalScore,
                maxScore,
                percentage,
                isPassed: percentage >= passScore,
            },
        });
    }
};
exports.GradingService = GradingService;
exports.GradingService = GradingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GradingService);
//# sourceMappingURL=grading.service.js.map