import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateOptionDto, CloneQuestionDto, MoveQuestionDto } from './dto/question.dto';
import { checkBankOwnership } from './question-validation.helper';

@Injectable()
export class QuestionsManagementService {
  constructor(private prisma: PrismaService) {}

  async clone(id: string, userId: string, userRole: string, dto: CloneQuestionDto) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        bank: true,
        options: { orderBy: { orderIndex: 'asc' } },
      },
    });

    if (!question) throw new NotFoundException('Question not found');
    if (userRole !== 'admin' && question.bank.createdBy !== userId) {
      throw new ForbiddenException('You do not have access to this question');
    }

    const targetBankId = dto.targetBankId || question.bankId;
    if (targetBankId !== question.bankId) {
      await checkBankOwnership(this.prisma, targetBankId, userId, userRole);
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

  async move(id: string, userId: string, userRole: string, dto: MoveQuestionDto) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        bank: true,
        _count: { select: { quizQuestions: true } },
      },
    });

    if (!question) throw new NotFoundException('Question not found');
    if (userRole !== 'admin' && question.bank.createdBy !== userId) {
      throw new ForbiddenException('You do not have access to this question');
    }

    if (question._count.quizQuestions > 0) {
      throw new BadRequestException(
        `Cannot move: question is used in ${question._count.quizQuestions} quiz(zes). Remove it from all quizzes first.`
      );
    }

    await checkBankOwnership(this.prisma, dto.targetBankId, userId, userRole);

    return this.prisma.question.update({
      where: { id },
      data: { bankId: dto.targetBankId },
      include: { options: { orderBy: { orderIndex: 'asc' } } },
    });
  }

  async addOptions(questionId: string, userId: string, userRole: string, options: CreateOptionDto[]) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { bank: true },
    });

    if (!question) throw new NotFoundException('Question not found');
    if (userRole !== 'admin' && question.bank.createdBy !== userId) {
      throw new ForbiddenException('You do not have access to this question');
    }

    const existingOptions = await this.prisma.questionOption.findMany({ where: { questionId } });
    if (existingOptions.length > 0) {
      throw new BadRequestException('Options already exist. Use PUT /options to replace them.');
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

  async updateOptions(questionId: string, userId: string, userRole: string, options: CreateOptionDto[]) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { bank: true },
    });

    if (!question) throw new NotFoundException('Question not found');
    if (userRole !== 'admin' && question.bank.createdBy !== userId) {
      throw new ForbiddenException('You do not have access to this question');
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
}
