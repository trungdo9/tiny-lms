import { Module } from '@nestjs/common';
import { QuestionBanksController } from './question-banks.controller';
import { QuestionBanksService } from './question-banks.service';
import { PrismaService } from '../../common/prisma.service';
import { ImportModule } from './import/import.module';
import { QuestionsModule } from '../questions/questions.module';

@Module({
  imports: [QuestionsModule, ImportModule],
  controllers: [QuestionBanksController],
  providers: [QuestionBanksService, PrismaService],
  exports: [QuestionBanksService],
})
export class QuestionBanksModule {}
