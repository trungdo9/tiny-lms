import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateQuestionDto, VALID_QUESTION_TYPES } from './dto/question.dto';

const TYPES_REQUIRING_OPTIONS = VALID_QUESTION_TYPES.filter(t => ['single', 'multi', 'true_false'].includes(t));
const TYPES_REQUIRING_ONE_CORRECT = VALID_QUESTION_TYPES.filter(t => ['single', 'true_false'].includes(t));

export function validateQuestionDto(dto: CreateQuestionDto) {
  if (TYPES_REQUIRING_OPTIONS.includes(dto.type) && (!dto.options || dto.options.length === 0)) {
    throw new BadRequestException('Question options are required for this type');
  }
  if (TYPES_REQUIRING_ONE_CORRECT.includes(dto.type) && dto.options) {
    const correctCount = dto.options.filter(o => o.isCorrect).length;
    if (correctCount !== 1) {
      throw new BadRequestException('Single/True-False questions must have exactly one correct answer');
    }
  }
}

export async function checkBankOwnership(prisma: PrismaService, bankId: string, userId: string, userRole: string) {
  const bank = await prisma.questionBank.findUnique({ where: { id: bankId } });
  if (!bank) throw new NotFoundException('Question bank not found');
  if (userRole !== 'admin' && bank.createdBy !== userId) {
    throw new ForbiddenException('You do not have access to this question bank');
  }
  return bank;
}
