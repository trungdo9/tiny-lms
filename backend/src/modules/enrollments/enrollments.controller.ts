import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { EnrollmentsService } from './enrollments.service';

@ApiTags('enrollments')
@ApiBearerAuth()
@Controller()
export class EnrollmentsController {
  constructor(private enrollmentsService: EnrollmentsService) {}

  @Post('courses/:courseId/enroll')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Enroll the current user in a course' })
  @ApiResponse({ status: 201, description: 'Enrolled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async enroll(@Param('courseId') courseId: string, @Request() req: any) {
    return this.enrollmentsService.enroll(courseId, req.user.id);
  }

  @Get('courses/:courseId/enroll/check')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Check if the current user is enrolled in a course' })
  @ApiResponse({ status: 200, description: 'Enrollment status returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkEnrollment(@Param('courseId') courseId: string, @Request() req: any) {
    return this.enrollmentsService.checkEnrollment(courseId, req.user.id);
  }

  @Get('enrollments/my')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'List enrollments for the current user' })
  @ApiResponse({ status: 200, description: 'List of enrollments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByUser(@Request() req: any) {
    return this.enrollmentsService.findByUser(req.user.id);
  }

  @Get('courses/:courseId/enrollments')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'List all enrollments for a course' })
  @ApiResponse({ status: 200, description: 'List of enrollments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByCourse(@Param('courseId') courseId: string, @Request() req: any) {
    return this.enrollmentsService.findByCourse(courseId, req.user.id);
  }

  @Delete('courses/:courseId/enroll')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Unenroll the current user from a course' })
  @ApiResponse({ status: 200, description: 'Unenrolled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async unenroll(@Param('courseId') courseId: string, @Request() req: any) {
    return this.enrollmentsService.unenroll(courseId, req.user.id);
  }

  @Post('enrollments/bulk')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Bulk enroll users into a course' })
  @ApiResponse({ status: 201, description: 'Users enrolled' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bulkEnroll(@Body() body: { courseId: string; userIds: string[] }) {
    return this.enrollmentsService.bulkEnroll(body.courseId, body.userIds);
  }
}
