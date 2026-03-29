import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto, ReorderLessonsDto } from './dto/lesson.dto';

@ApiTags('lessons')
@ApiBearerAuth()
@Controller()
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Get('sections/:sectionId/lessons')
  @ApiOperation({ summary: 'List lessons for a section' })
  @ApiResponse({ status: 200, description: 'List of lessons' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findBySection(@Param('sectionId') sectionId: string) {
    return this.lessonsService.findBySection(sectionId);
  }

  @Get('lessons/:id')
  @ApiOperation({ summary: 'Get a lesson by ID' })
  @ApiResponse({ status: 200, description: 'Lesson found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Get('lessons/:id/learn')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Get lesson content for learning (enrolled users)' })
  @ApiResponse({ status: 200, description: 'Lesson content returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async findOneForLearning(@Param('id') id: string, @Request() req: any) {
    return this.lessonsService.findOneForLearning(id, req.user.id);
  }

  @Post('sections/:sectionId/lessons')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Create a lesson in a section' })
  @ApiResponse({ status: 201, description: 'Lesson created' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Param('sectionId') sectionId: string,
    @Body() dto: CreateLessonDto,
    @Request() req: any,
  ) {
    return this.lessonsService.create(sectionId, dto, req.user.id, req.user.role);
  }

  @Put('lessons/:id')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Update a lesson' })
  @ApiResponse({ status: 200, description: 'Lesson updated' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLessonDto,
    @Request() req: any,
  ) {
    return this.lessonsService.update(id, dto, req.user.id, req.user.role);
  }

  @Delete('lessons/:id')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Delete a lesson' })
  @ApiResponse({ status: 200, description: 'Lesson deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.lessonsService.delete(id, req.user.id, req.user.role);
  }

  @Put('sections/:sectionId/lessons/reorder')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Reorder lessons within a section' })
  @ApiResponse({ status: 200, description: 'Lessons reordered' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async reorder(
    @Param('sectionId') sectionId: string,
    @Body() dto: ReorderLessonsDto,
    @Request() req: any,
  ) {
    return this.lessonsService.reorder(sectionId, dto.lessonIds, req.user.id, req.user.role);
  }
}
