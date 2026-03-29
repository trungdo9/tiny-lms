import {
  Controller, Get, Post, Put, Patch,
  Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { AssignmentsService } from './assignments.service';
import {
  CreateAssignmentDto, UpdateAssignmentDto,
  SubmitAssignmentDto, GradeSubmissionDto,
} from './dto/assignment.dto';

@ApiTags('assignments')
@ApiBearerAuth()
@Controller('assignments')
@UseGuards(SupabaseAuthGuard)
export class AssignmentsController {
  constructor(private service: AssignmentsService) {}

  @ApiOperation({ summary: 'Create an assignment for an activity' })
  @ApiResponse({ status: 201, description: 'Assignment created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  @Post('activity/:activityId')
  async create(
    @Param('activityId') activityId: string,
    @Body() dto: CreateAssignmentDto,
    @Request() req: any,
  ) {
    return this.service.create(activityId, dto, req.user.id);
  }

  @ApiOperation({ summary: 'Get an assignment by ID' })
  @ApiResponse({ status: 200, description: 'Assignment found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Update an assignment' })
  @ApiResponse({ status: 200, description: 'Assignment updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAssignmentDto, @Request() req: any) {
    return this.service.update(id, dto, req.user.id);
  }

  @ApiOperation({ summary: 'Submit an assignment' })
  @ApiResponse({ status: 201, description: 'Submission recorded' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @Post(':id/submit')
  async submit(@Param('id') id: string, @Body() dto: SubmitAssignmentDto, @Request() req: any) {
    return this.service.submit(id, dto, req.user.id);
  }

  @ApiOperation({ summary: 'Grade an assignment submission' })
  @ApiResponse({ status: 200, description: 'Submission graded' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  @Patch('submissions/:subId/grade')
  async grade(
    @Param('subId') subId: string,
    @Body() dto: GradeSubmissionDto,
    @Request() req: any,
  ) {
    return this.service.grade(subId, dto, req.user.id);
  }

  @ApiOperation({ summary: 'Get all submissions for an assignment' })
  @ApiResponse({ status: 200, description: 'List of submissions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @Get(':id/submissions')
  async getSubmissions(@Param('id') id: string, @Request() req: any) {
    return this.service.getSubmissions(id, req.user.id);
  }
}
