import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { QuestionsManagementService } from './questions-management.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [QuestionsController],
  providers: [QuestionsService, QuestionsManagementService, PrismaService],
  exports: [QuestionsService, QuestionsManagementService],
})
export class QuestionsModule {}
