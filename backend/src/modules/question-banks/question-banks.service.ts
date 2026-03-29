import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateQuestionBankDto, UpdateQuestionBankDto } from './dto/question-bank.dto';

@Injectable()
export class QuestionBanksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateQuestionBankDto) {
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

  async findAll(userId: string, courseId?: string) {
    const where: any = {};

    // If student, only show banks from enrolled courses or public
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

  async findById(id: string, userId: string) {
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
      throw new NotFoundException('Question bank not found');
    }

    return bank;
  }

  async update(id: string, userId: string, dto: UpdateQuestionBankDto) {
    // Check ownership
    const existing = await this.prisma.questionBank.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Question bank not found');
    }

    if (existing.createdBy !== userId) {
      throw new BadRequestException('You can only update your own question banks');
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

  async delete(id: string, userId: string) {
    const existing = await this.prisma.questionBank.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Question bank not found');
    }

    if (existing.createdBy !== userId) {
      throw new BadRequestException('You can only delete your own question banks');
    }

    await this.prisma.questionBank.delete({ where: { id } });
    return { success: true };
  }

  async getQuestions(bankId: string, userId: string) {
    return this.prisma.question.findMany({
      where: { bankId },
      include: {
        options: { orderBy: { orderIndex: 'asc' } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
