import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CourseInstructorsController } from './course-instructors.controller';
import { CourseInstructorsService } from './course-instructors.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../../common/prisma.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SupabaseService } from '../../common/supabase.service';

@Module({
  controllers: [CoursesController, CourseInstructorsController, ReviewsController],
  providers: [CoursesService, CourseInstructorsService, ReviewsService, PrismaService, RolesGuard, SupabaseService],
  exports: [CoursesService],
})
export class CoursesModule {}
