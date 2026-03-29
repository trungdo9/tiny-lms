import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { ProgressService } from './progress.service';

class SavePositionDto {
  position: number;
}

@ApiTags('progress')
@ApiBearerAuth()
@Controller()
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Post('lessons/:lessonId/complete')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Mark a lesson as complete for the current user' })
  @ApiResponse({ status: 201, description: 'Lesson marked complete' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markComplete(@Param('lessonId') lessonId: string, @Request() req: any) {
    return this.progressService.markComplete(lessonId, req.user.id);
  }

  @Put('lessons/:lessonId/progress')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Save playback position for a lesson' })
  @ApiResponse({ status: 200, description: 'Position saved' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async savePosition(
    @Param('lessonId') lessonId: string,
    @Body() dto: SavePositionDto,
    @Request() req: any,
  ) {
    return this.progressService.savePosition(lessonId, dto.position, req.user.id);
  }

  @Get('courses/:courseId/progress')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Get progress for the current user in a course' })
  @ApiResponse({ status: 200, description: 'Course progress returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCourseProgress(@Param('courseId') courseId: string, @Request() req: any) {
    return this.progressService.getCourseProgress(courseId, req.user.id);
  }

  @Get('lessons/:lessonId/progress')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Get progress for the current user on a lesson' })
  @ApiResponse({ status: 200, description: 'Lesson progress returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLessonProgress(@Param('lessonId') lessonId: string, @Request() req: any) {
    return this.progressService.getLessonProgress(lessonId, req.user.id);
  }
}
