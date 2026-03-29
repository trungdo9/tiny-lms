import { Module } from '@nestjs/common';
import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';
import { PrismaService } from '../../common/prisma.service';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [CoursesModule],
  controllers: [SectionsController],
  providers: [SectionsService, PrismaService],
  exports: [SectionsService],
})
export class SectionsModule {}
