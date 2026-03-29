import { Module } from '@nestjs/common';
import { QuizzesController, LessonQuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { PrismaService } from '../../common/prisma.service';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [CoursesModule],
  controllers: [QuizzesController, LessonQuizzesController],
  providers: [QuizzesService, PrismaService],
  exports: [QuizzesService],
})
export class QuizzesModule { }
