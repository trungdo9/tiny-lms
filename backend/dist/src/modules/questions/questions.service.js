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
exports.QuestionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let QuestionsService = class QuestionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(bankId, userId, userRole, dto) {
        const bank = await this.prisma.questionBank.findUnique({ where: { id: bankId } });
        if (!bank) {
            throw new common_1.NotFoundException('Question bank not found');
        }
        if (userRole !== 'admin' && bank.createdBy !== userId) {
            throw new common_1.BadRequestException('You can only add questions to your own banks');
        }
        const validTypes = ['single', 'multi', 'true_false', 'short_answer', 'essay', 'matching', 'ordering', 'cloze'];
        if (!validTypes.includes(dto.type)) {
            throw new common_1.BadRequestException(`Invalid question type. Valid types: ${validTypes.join(', ')}`);
        }
        if (['single', 'multi', 'true_false'].includes(dto.type) && (!dto.options || dto.options.length === 0)) {
            throw new common_1.BadRequestException('Question options are required for this type');
        }
        if (['single', 'true_false'].includes(dto.type) && dto.options) {
            const correctOptions = dto.options.filter(o => o.isCorrect);
            if (correctOptions.length !== 1) {
                throw new common_1.BadRequestException('Single/True-False questions must have exactly one correct answer');
            }
        }
        return this.prisma.question.create({
            data: {
                bankId,
                type: dto.type,
                content: dto.content,
                explanation: dto.explanation,
                mediaUrl: dto.mediaUrl,
                mediaType: dto.mediaType,
                difficulty: dto.difficulty || 'medium',
                defaultScore: dto.defaultScore || 1,
                tags: dto.tags || [],
                options: dto.options ? {
                    create: dto.options.map((opt, idx) => ({
                        content: opt.content,
                        isCorrect: opt.isCorrect || false,
                        orderIndex: idx,
                    })),
                } : undefined,
            },
            include: {
                options: { orderBy: { orderIndex: 'asc' } },
            },
        });
    }
    async bulkCreate(bankId, userId, userRole, questions) {
        const bank = await this.prisma.questionBank.findUnique({ where: { id: bankId } });
        if (!bank) {
            throw new common_1.NotFoundException('Question bank not found');
        }
        if (userRole !== 'admin' && bank.createdBy !== userId) {
            throw new common_1.BadRequestException('You can only add questions to your own banks');
        }
        const validTypes = ['single', 'multi', 'true_false', 'short_answer', 'essay', 'matching', 'ordering', 'cloze'];
        for (const dto of questions) {
            if (!validTypes.includes(dto.type)) {
                throw new common_1.BadRequestException(`Invalid question type: ${dto.type}`);
            }
            if (['single', 'multi', 'true_false'].includes(dto.type) && (!dto.options || dto.options.length === 0)) {
                throw new common_1.BadRequestException('Question options are required for this type');
            }
        }
        const results = await this.prisma.$transaction(questions.map((dto) => this.prisma.question.create({
            data: {
                bankId,
                type: dto.type,
                content: dto.content,
                explanation: dto.explanation,
                mediaUrl: dto.mediaUrl,
                mediaType: dto.mediaType,
                difficulty: dto.difficulty || 'medium',
                defaultScore: dto.defaultScore || 1,
                tags: dto.tags || [],
                options: dto.options ? {
                    create: dto.options.map((opt, idx) => ({
                        content: opt.content,
                        isCorrect: opt.isCorrect || false,
                        matchKey: opt.matchKey,
                        matchValue: opt.matchValue,
                        orderIndex: idx,
                    })),
                } : undefined,
            },
        })));
        return { count: results.length, questions: results };
    }
    async update(id, userId, userRole, dto) {
        const question = await this.prisma.question.findUnique({
            where: { id },
            include: { bank: true },
        });
        if (!question) {
            throw new common_1.NotFoundException('Question not found');
        }
        if (userRole !== 'admin' && question.bank.createdBy !== userId) {
            throw new common_1.BadRequestException('You can only update questions in your own banks');
        }
        return this.prisma.question.update({
            where: { id },
            data: {
                content: dto.content,
                explanation: dto.explanation,
                mediaUrl: dto.mediaUrl,
                mediaType: dto.mediaType,
                difficulty: dto.difficulty,
                defaultScore: dto.defaultScore,
                tags: dto.tags,
            },
            include: {
                options: { orderBy: { orderIndex: 'asc' } },
            },
        });
    }
    async delete(id, userId, userRole) {
        const question = await this.prisma.question.findUnique({
            where: { id },
            include: { bank: true },
        });
        if (!question) {
            throw new common_1.NotFoundException('Question not found');
        }
        if (userRole !== 'admin' && question.bank.createdBy !== userId) {
            throw new common_1.BadRequestException('You can only delete questions from your own banks');
        }
        await this.prisma.question.delete({ where: { id } });
        return { success: true };
    }
    async addOptions(questionId, userId, userRole, options) {
        const question = await this.prisma.question.findUnique({
            where: { id: questionId },
            include: { bank: true },
        });
        if (!question) {
            throw new common_1.NotFoundException('Question not found');
        }
        if (userRole !== 'admin' && question.bank.createdBy !== userId) {
            throw new common_1.BadRequestException('You can only modify questions in your own banks');
        }
        const existingOptions = await this.prisma.questionOption.findMany({
            where: { questionId },
        });
        if (existingOptions.length > 0) {
            throw new common_1.BadRequestException('Options already exist. Update them instead.');
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
        if (!question) {
            throw new common_1.NotFoundException('Question not found');
        }
        if (userRole !== 'admin' && question.bank.createdBy !== userId) {
            throw new common_1.BadRequestException('You can only modify questions in your own banks');
        }
        await this.prisma.questionOption.deleteMany({ where: { questionId } });
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
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuestionsService);
//# sourceMappingURL=questions.service.js.map