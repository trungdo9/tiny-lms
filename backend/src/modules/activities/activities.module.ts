import { Module } from '@nestjs/common';
import { ActivitiesController, LessonActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [ActivitiesController, LessonActivitiesController],
  providers: [ActivitiesService, PrismaService],
  exports: [ActivitiesService],
})
export class ActivitiesModule { }
