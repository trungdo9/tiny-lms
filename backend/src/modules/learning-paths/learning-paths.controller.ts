import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards, Request, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { LearningPathsService } from './learning-paths.service';
import {
  CreateLearningPathDto, UpdateLearningPathDto,
  AddCourseToPathDto, ReorderPathCoursesDto,
} from './dto/learning-path.dto';

@ApiTags('learning-paths')
@ApiBearerAuth()
@Controller('learning-paths')
export class LearningPathsController {
  constructor(private service: LearningPathsService) {}

  @Get()
  async findAll(@Query('all') all?: string) {
    return this.service.findAll(all !== 'true');
  }

  @Get('mine')
  @UseGuards(SupabaseAuthGuard)
  async findMine(@Request() req: any) {
    return this.service.findMine(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/progress')
  @UseGuards(SupabaseAuthGuard)
  async findOneWithProgress(@Param('id') id: string, @Request() req: any) {
    return this.service.findOneWithProgress(id, req.user.id);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  async create(@Body() dto: CreateLearningPathDto, @Request() req: any) {
    return this.service.create(dto, req.user.id);
  }

  @Put(':id')
  @UseGuards(SupabaseAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateLearningPathDto, @Request() req: any) {
    return this.service.update(id, dto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.service.delete(id, req.user.id, req.user.role);
  }

  @Post(':id/enroll')
  @UseGuards(SupabaseAuthGuard)
  async enroll(@Param('id') id: string, @Request() req: any) {
    return this.service.enroll(id, req.user.id);
  }

  @Post(':id/courses')
  @UseGuards(SupabaseAuthGuard)
  async addCourse(@Param('id') id: string, @Body() dto: AddCourseToPathDto, @Request() req: any) {
    return this.service.addCourse(id, dto, req.user.id, req.user.role);
  }

  @Delete(':id/courses/:courseId')
  @UseGuards(SupabaseAuthGuard)
  async removeCourse(
    @Param('id') id: string, @Param('courseId') courseId: string, @Request() req: any,
  ) {
    return this.service.removeCourse(id, courseId, req.user.id, req.user.role);
  }

  @Put(':id/courses/reorder')
  @UseGuards(SupabaseAuthGuard)
  async reorderCourses(
    @Param('id') id: string, @Body() dto: ReorderPathCoursesDto, @Request() req: any,
  ) {
    return this.service.reorderCourses(id, dto.courseIds, req.user.id, req.user.role);
  }
}
