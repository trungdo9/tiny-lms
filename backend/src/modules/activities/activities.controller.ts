import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto, UpdateActivityDto, ReorderActivitiesDto } from './dto/activity.dto';

// ─── Nested under /lessons/:lessonId ─────────────────────────────────────────

@ApiTags('activities')
@ApiBearerAuth()
@Controller('lessons/:lessonId/activities')
@UseGuards(SupabaseAuthGuard)
export class LessonActivitiesController {
  constructor(private service: ActivitiesService) { }

  /** Get all activities for a lesson. */
  @Get()
  @ApiOperation({ summary: 'List activities for a lesson' })
  @ApiResponse({ status: 200, description: 'List of activities' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByLesson(@Param('lessonId') lessonId: string) {
    return this.service.findByLesson(lessonId);
  }

  /** Create a new activity for a lesson. */
  @Post()
  @ApiOperation({ summary: 'Create an activity in a lesson' })
  @ApiResponse({ status: 201, description: 'Activity created' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Request() req: any,
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateActivityDto,
  ) {
    return this.service.create(req.user.id, lessonId, dto, req.user.role);
  }

  /** Reorder activities in a lesson. */
  @Put('reorder')
  @ApiOperation({ summary: 'Reorder activities within a lesson' })
  @ApiResponse({ status: 200, description: 'Activities reordered' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  reorder(
    @Request() req: any,
    @Param('lessonId') lessonId: string,
    @Body() body: ReorderActivitiesDto,
  ) {
    return this.service.reorder(req.user.id, lessonId, body.activityIds, req.user.role);
  }
}

// ─── Standalone /activities routes ───────────────────────────────────────────

@ApiTags('activities')
@ApiBearerAuth()
@Controller('activities')
@UseGuards(SupabaseAuthGuard)
export class ActivitiesController {
  constructor(private service: ActivitiesService) { }

  /** Get activity by ID. */
  @Get(':id')
  @ApiOperation({ summary: 'Get an activity by ID' })
  @ApiResponse({ status: 200, description: 'Activity found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  /** Update an activity. */
  @Put(':id')
  @ApiOperation({ summary: 'Update an activity' })
  @ApiResponse({ status: 200, description: 'Activity updated' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateActivityDto,
  ) {
    return this.service.update(req.user.id, id, dto, req.user.role);
  }

  /** Delete an activity. */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an activity' })
  @ApiResponse({ status: 200, description: 'Activity deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  delete(@Request() req: any, @Param('id') id: string) {
    return this.service.delete(req.user.id, id, req.user.role);
  }
}
