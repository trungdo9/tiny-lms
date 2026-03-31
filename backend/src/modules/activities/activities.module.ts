import { Module } from '@nestjs/common';
import { ActivitiesController, LessonActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { PrismaService } from '../../common/prisma.service';
import { CoursesModule } from '../courses/courses.module';

@Module({
  controllers: [ActivitiesController, LessonActivitiesController],
  providers: [ActivitiesService, PrismaService],
  imports: [CoursesModule],
  exports: [ActivitiesService],
})
export class ActivitiesModule { }
