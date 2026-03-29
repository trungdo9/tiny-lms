import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateQuestionDto, UpdateQuestionDto, ListQuestionsQueryDto } from './dto/question.dto';
import { validateQuestionDto, checkBankOwnership } from './question-validation.helper';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(bankId: string, userId: string, userRole: string, query: ListQuestionsQueryDto) {
    await checkBankOwnership(this.prisma, bankId, userId, userRole);

    const { search, type, difficulty, tags, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { bankId };
    if (search) where.content = { contains: search, mode: 'insensitive' };
    if (type) where.type = { in: type.split(',').map(t => t.trim()) };
    if (difficulty) where.difficulty = { in: difficulty.split(',').map(d => d.trim()) };
    if (tags) where.tags = { hasSome: tags.split(',').map(t => t.trim()) };

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

  async findOne(id: string, userId: string, userRole: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        options: { orderBy: { orderIndex: 'asc' } },
        bank: { select: { createdBy: true } },
        _count: { select: { quizQuestions: true } },
      },
    });

    if (!question) throw new NotFoundException('Question not found');
    if (userRole !== 'admin' && question.bank.createdBy !== userId) {
      throw new ForbiddenException('You do not have access to this question');
    }

    const { bank, ...rest } = question;
    return rest;
  }

  async create(bankId: string, userId: string, userRole: string, dto: CreateQuestionDto) {
    await checkBankOwnership(this.prisma, bankId, userId, userRole);
    validateQuestionDto(dto);

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
            matchKey: opt.matchKey,
            matchValue: opt.matchValue,
            orderIndex: idx,
          })),
        } : undefined,
      },
      include: { options: { orderBy: { orderIndex: 'asc' } } },
    });
  }

  async bulkCreate(bankId: string, userId: string, userRole: string, questions: CreateQuestionDto[]) {
    await checkBankOwnership(this.prisma, bankId, userId, userRole);
    questions.forEach(dto => validateQuestionDto(dto));

    const results = await this.prisma.$transaction(
      questions.map((dto) =>
        this.prisma.question.create({
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
        })
      )
    );

    return { count: results.length, questions: results };
  }

  async update(id: string, userId: string, userRole: string, dto: UpdateQuestionDto) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: { bank: true },
    });

    if (!question) throw new NotFoundException('Question not found');
    if (userRole !== 'admin' && question.bank.createdBy !== userId) {
      throw new ForbiddenException('You do not have access to this question');
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
          difficulty: dto.difficulty,
          defaultScore: dto.defaultScore,
          tags: dto.tags,
        },
        include: { options: { orderBy: { orderIndex: 'asc' } } },
      });
    });
  }

  async delete(id: string, userId: string, userRole: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: { bank: true },
    });

    if (!question) throw new NotFoundException('Question not found');
    if (userRole !== 'admin' && question.bank.createdBy !== userId) {
      throw new ForbiddenException('You do not have access to this question');
    }

    await this.prisma.question.delete({ where: { id } });
    return { success: true };
  }

}
