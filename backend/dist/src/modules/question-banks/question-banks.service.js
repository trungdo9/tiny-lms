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
exports.QuestionBanksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let QuestionBanksService = class QuestionBanksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.questionBank.create({
            data: {
                title: dto.title,
                description: dto.description,
                courseId: dto.courseId,
                createdBy: userId,
            },
            include: {
                course: true,
                creator: { select: { id: true, fullName: true } },
                _count: { select: { questions: true } },
            },
        });
    }
    async findAll(userId, courseId) {
        const where = {};
        if (courseId) {
            where.courseId = courseId;
        }
        return this.prisma.questionBank.findMany({
            where,
            include: {
                course: { select: { id: true, title: true } },
                creator: { select: { id: true, fullName: true } },
                _count: { select: { questions: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id, userId) {
        const bank = await this.prisma.questionBank.findUnique({
            where: { id },
            include: {
                course: { select: { id: true, title: true } },
                creator: { select: { id: true, fullName: true } },
                questions: {
                    include: {
                        options: true,
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!bank) {
            throw new common_1.NotFoundException('Question bank not found');
        }
        return bank;
    }
    async update(id, userId, dto) {
        const existing = await this.prisma.questionBank.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('Question bank not found');
        }
        if (existing.createdBy !== userId) {
            throw new common_1.BadRequestException('You can only update your own question banks');
        }
        return this.prisma.questionBank.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
            },
            include: {
                course: { select: { id: true, title: true } },
                _count: { select: { questions: true } },
            },
        });
    }
    async delete(id, userId) {
        const existing = await this.prisma.questionBank.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('Question bank not found');
        }
        if (existing.createdBy !== userId) {
            throw new common_1.BadRequestException('You can only delete your own question banks');
        }
        await this.prisma.questionBank.delete({ where: { id } });
        return { success: true };
    }
    async getQuestions(bankId, userId) {
        return this.prisma.question.findMany({
            where: { bankId },
            include: {
                options: { orderBy: { orderIndex: 'asc' } },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
};
exports.QuestionBanksService = QuestionBanksService;
exports.QuestionBanksService = QuestionBanksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuestionBanksService);
//# sourceMappingURL=question-banks.service.js.map