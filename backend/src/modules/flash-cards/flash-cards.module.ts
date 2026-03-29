import { Module } from '@nestjs/common';
import { FlashCardsController, LessonFlashCardsController } from './flash-cards.controller';
import { FlashCardsService } from './flash-cards.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [FlashCardsController, LessonFlashCardsController],
  providers: [FlashCardsService, PrismaService],
  exports: [FlashCardsService],
})
export class FlashCardsModule { }
