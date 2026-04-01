import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiQuestionsController } from './ai-questions.controller';
import { AiQuestionsService } from './ai-questions.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiQuestionsController],
  providers: [AiQuestionsService],
  exports: [AiQuestionsService],
})
export class AiQuestionsModule {}
