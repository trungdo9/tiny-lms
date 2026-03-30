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
const question_validation_helper_1 = require("./question-validation.helper");
const question_difficulty_util_1 = require("./question-difficulty.util");
let QuestionsService = class QuestionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(bankId, userId, userRole, query) {
        await (0, question_validation_helper_1.checkBankOwnership)(this.prisma, bankId, userId, userRole);
        const { search, type, difficulty, tags, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const where = { bankId };
        if (search)
            where.content = { contains: search, mode: 'insensitive' };
        if (type)
            where.type = { in: type.split(',').map(t => t.trim()) };
        if (difficulty)
            where.difficulty = { in: (0, question_difficulty_util_1.normalizeQuestionDifficultyList)(difficulty) };
        if (tags)
            where.tags = { hasSome: tags.split(',').map(t => t.trim()) };
        const [total, data] = await this.prisma.$transaction([
            this.prisma.question.count({ where }),
            this.prisma.question.findMany({
                where,
                include: {
                    options: { orderBy: { orderIndex: 'asc' } },
                    _count: { select: { quizQuestions: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async findOne(id, userId, userRole) {
        const question = await this.prisma.question.findUnique({
            where: { id },
            include: {
                options: { orderBy: { orderIndex: 'asc' } },
                bank: { select: { createdBy: true } },
                _count: { select: { quizQuestions: true } },
            },
        });
        if (!question)
            throw new common_1.NotFoundException('Question not found');
        if (userRole !== 'admin' && question.bank.createdBy !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this question');
        }
        const { bank, ...rest } = question;
        return rest;
    }
    async create(bankId, userId, userRole, dto) {
        await (0, question_validation_helper_1.checkBankOwnership)(this.prisma, bankId, userId, userRole);
        (0, question_validation_helper_1.validateQuestionDto)(dto);
        return this.prisma.question.create({
            data: {
                bankId,
                type: dto.type,
                content: dto.content,
                explanation: dto.explanation,
                mediaUrl: dto.mediaUrl,
                mediaType: dto.mediaType,
                difficulty: (0, question_difficulty_util_1.normalizeQuestionDifficulty)(dto.difficulty, { defaultValue: 'medium' }),
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
            include: { options: { orderBy: { orderIndex: 'asc' } } },
        });
    }
    async bulkCreate(bankId, userId, userRole, questions) {
        await (0, question_validation_helper_1.checkBankOwnership)(this.prisma, bankId, userId, userRole);
        questions.forEach(dto => (0, question_validation_helper_1.validateQuestionDto)(dto));
        const results = await this.prisma.$transaction(questions.map((dto) => this.prisma.question.create({
            data: {
                bankId,
                type: dto.type,
                content: dto.content,
                explanation: dto.explanation,
                mediaUrl: dto.mediaUrl,
                mediaType: dto.mediaType,
                difficulty: (0, question_difficulty_util_1.normalizeQuestionDifficulty)(dto.difficulty, { defaultValue: 'medium' }),
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
        if (!question)
            throw new common_1.NotFoundException('Question not found');
        if (userRole !== 'admin' && question.bank.createdBy !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this question');
        }
        return this.prisma.$transaction(async (tx) => {
            if (dto.options !== undefined) {
                await tx.questionOption.deleteMany({ where: { questionId: id } });
                if (dto.options.length > 0) {
                    await tx.questionOption.createMany({
                        data: dto.options.map((opt, idx) => ({
                            questionId: id,
                            content: opt.content,
                            isCorrect: opt.isCorrect || false,
                            matchKey: opt.matchKey,
                            matchValue: opt.matchValue,
                            orderIndex: idx,
                        })),
                    });
                }
            }
            return tx.question.update({
                where: { id },
                data: {
                    content: dto.content,
                    explanation: dto.explanation,
                    mediaUrl: dto.mediaUrl,
                    mediaType: dto.mediaType,
                    difficulty: (0, question_difficulty_util_1.normalizeOptionalQuestionDifficulty)(dto.difficulty),
                    defaultScore: dto.defaultScore,
                    tags: dto.tags,
                },
                include: { options: { orderBy: { orderIndex: 'asc' } } },
            });
        });
    }
    async delete(id, userId, userRole) {
        const question = await this.prisma.question.findUnique({
            where: { id },
            include: { bank: true },
        });
        if (!question)
            throw new common_1.NotFoundException('Question not found');
        if (userRole !== 'admin' && question.bank.createdBy !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this question');
        }
        await this.prisma.question.delete({ where: { id } });
        return { success: true };
    }
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuestionsService);
//# sourceMappingURL=questions.service.js.map