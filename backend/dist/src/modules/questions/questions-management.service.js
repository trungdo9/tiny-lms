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
exports.QuestionsManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const question_validation_helper_1 = require("./question-validation.helper");
let QuestionsManagementService = class QuestionsManagementService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async clone(id, userId, userRole, dto) {
        const question = await this.prisma.question.findUnique({
            where: { id },
            include: {
                bank: true,
                options: { orderBy: { orderIndex: 'asc' } },
            },
        });
        if (!question)
            throw new common_1.NotFoundException('Question not found');
        if (userRole !== 'admin' && question.bank.createdBy !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this question');
        }
        const targetBankId = dto.targetBankId || question.bankId;
        if (targetBankId !== question.bankId) {
            await (0, question_validation_helper_1.checkBankOwnership)(this.prisma, targetBankId, userId, userRole);
        }
        return this.prisma.question.create({
            data: {
                bankId: targetBankId,
                type: question.type,
                content: question.content,
                explanation: question.explanation,
                mediaUrl: question.mediaUrl,
                mediaType: question.mediaType,
                difficulty: question.difficulty,
                defaultScore: question.defaultScore,
                tags: question.tags,
                options: question.options.length > 0 ? {
                    create: question.options.map((opt) => ({
                        content: opt.content,
                        isCorrect: opt.isCorrect,
                        matchKey: opt.matchKey,
                        matchValue: opt.matchValue,
                        orderIndex: opt.orderIndex,
                    })),
                } : undefined,
            },
            include: { options: { orderBy: { orderIndex: 'asc' } } },
        });
    }
    async move(id, userId, userRole, dto) {
        const question = await this.prisma.question.findUnique({
            where: { id },
            include: {
                bank: true,
                _count: { select: { quizQuestions: true } },
            },
        });
        if (!question)
            throw new common_1.NotFoundException('Question not found');
        if (userRole !== 'admin' && question.bank.createdBy !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this question');
        }
        if (question._count.quizQuestions > 0) {
            throw new common_1.BadRequestException(`Cannot move: question is used in ${question._count.quizQuestions} quiz(zes). Remove it from all quizzes first.`);
        }
        await (0, question_validation_helper_1.checkBankOwnership)(this.prisma, dto.targetBankId, userId, userRole);
        return this.prisma.question.update({
            where: { id },
            data: { bankId: dto.targetBankId },
            include: { options: { orderBy: { orderIndex: 'asc' } } },
        });
    }
    async addOptions(questionId, userId, userRole, options) {
        const question = await this.prisma.question.findUnique({
            where: { id: questionId },
            include: { bank: true },
        });
        if (!question)
            throw new common_1.NotFoundException('Question not found');
        if (userRole !== 'admin' && question.bank.createdBy !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this question');
        }
        const existingOptions = await this.prisma.questionOption.findMany({ where: { questionId } });
        if (existingOptions.length > 0) {
            throw new common_1.BadRequestException('Options already exist. Use PUT /options to replace them.');
        }
        return this.prisma.questionOption.createMany({
            data: options.map((opt, idx) => ({
                questionId,
                content: opt.content,
                isCorrect: opt.isCorrect || false,
                matchKey: opt.matchKey,
                matchValue: opt.matchValue,
                orderIndex: idx,
            })),
        });
    }
    async updateOptions(questionId, userId, userRole, options) {
        const question = await this.prisma.question.findUnique({
            where: { id: questionId },
            include: { bank: true },
        });
        if (!question)
            throw new common_1.NotFoundException('Question not found');
        if (userRole !== 'admin' && question.bank.createdBy !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this question');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.questionOption.deleteMany({ where: { questionId } });
            return tx.questionOption.createMany({
                data: options.map((opt, idx) => ({
                    questionId,
                    content: opt.content,
                    isCorrect: opt.isCorrect || false,
                    matchKey: opt.matchKey,
                    matchValue: opt.matchValue,
                    orderIndex: idx,
                })),
            });
        });
    }
};
exports.QuestionsManagementService = QuestionsManagementService;
exports.QuestionsManagementService = QuestionsManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuestionsManagementService);
//# sourceMappingURL=questions-management.service.js.map