import { Controller, Get, Post, Delete, Put, Param, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CourseInstructorsService } from './course-instructors.service';
import { AssignInstructorDto, UpdateInstructorRoleDto } from './dto/course-instructor.dto';

@ApiTags('courses')
@ApiBearerAuth()
@Controller('courses/:courseId/instructors')
export class CourseInstructorsController {
  constructor(private service: CourseInstructorsService) {}

  /** PUBLIC — no auth required, for public course pages */
  @Get()
  @ApiOperation({ summary: 'List instructors for a course (public)' })
  @ApiResponse({ status: 200, description: 'List of instructors' })
  list(@Param('courseId') courseId: string) {
    return this.service.list(courseId);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Assign an instructor to a course' })
  @ApiResponse({ status: 201, description: 'Instructor assigned' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  assign(
    @Param('courseId') courseId: string,
    @Body() dto: AssignInstructorDto,
    @Request() req: any,
  ) {
    return this.service.assign(courseId, dto, req.user.id, req.user.role);
  }

  @Delete(':userId')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Remove an instructor from a course' })
  @ApiResponse({ status: 200, description: 'Instructor removed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Instructor not found' })
  remove(
    @Param('courseId') courseId: string,
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    return this.service.remove(courseId, userId, req.user.id, req.user.role);
  }

  @Put(':userId')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Update the role of an instructor on a course' })
  @ApiResponse({ status: 200, description: 'Instructor role updated' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Instructor not found' })
  updateRole(
    @Param('courseId') courseId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateInstructorRoleDto,
    @Request() req: any,
  ) {
    return this.service.updateRole(courseId, userId, dto, req.user.role);
  }
}
