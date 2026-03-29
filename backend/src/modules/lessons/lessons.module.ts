import { Module } from '@nestjs/common';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { PrismaService } from '../../common/prisma.service';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [CoursesModule],
  controllers: [LessonsController],
  providers: [LessonsService, PrismaService],
  exports: [LessonsService],
})
export class LessonsModule {}
