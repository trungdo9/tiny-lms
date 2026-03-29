import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(SupabaseAuthGuard)
export class ReportsController {
  constructor(private service: ReportsService) {}

  // Admin endpoints (static routes before parametric)

  @Get('admin/dashboard')
  @ApiOperation({ summary: 'Get admin dashboard report' })
  @ApiResponse({ status: 200, description: 'Dashboard data returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getAdminDashboard() {
    return this.service.getAdminDashboard();
  }

  @Get('admin/trends')
  @ApiOperation({ summary: 'Get admin trend stats' })
  @ApiResponse({ status: 200, description: 'Trends returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getAdminTrends(@Query('months') months?: string) {
    const m = Math.min(Math.max(parseInt(months || '12') || 12, 1), 24);
    return this.service.getAdminTrends(m);
  }

  @Get('admin/top-courses')
  @ApiOperation({ summary: 'Get top courses by enrollment (admin)' })
  @ApiResponse({ status: 200, description: 'Top courses returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getTopCourses(@Query('limit') limit?: string) {
    return this.service.getTopCourses(parseInt(limit || '10') || 10);
  }

  @Get('admin/revenue')
  @ApiOperation({ summary: 'Get revenue stats (admin)' })
  @ApiResponse({ status: 200, description: 'Revenue stats returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getRevenueStats(@Query('months') months?: string) {
    const m = Math.min(Math.max(parseInt(months || '12') || 12, 1), 24);
    return this.service.getRevenueStats(m);
  }

  // Instructor endpoints

  @Get('dashboard/trends')
  @ApiOperation({ summary: 'Get instructor trend stats' })
  @ApiResponse({ status: 200, description: 'Trends returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getInstructorTrends(@Request() req: any, @Query('months') months?: string) {
    const m = Math.min(Math.max(parseInt(months || '6') || 6, 1), 24);
    return this.service.getInstructorTrends(req.user.id, m);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get instructor dashboard report' })
  @ApiResponse({ status: 200, description: 'Dashboard data returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getInstructorDashboard(@Request() req: any) {
    return this.service.getInstructorDashboard(req.user.id);
  }

  @Get('courses/:id')
  @ApiOperation({ summary: 'Get report for a course' })
  @ApiResponse({ status: 200, description: 'Course report returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  getCourseReport(@Param('id') id: string, @Request() req: any) {
    return this.service.getCourseReport(id, req.user.id);
  }

  @Get('courses/:id/students')
  @ApiOperation({ summary: 'Get student list for a course report' })
  @ApiResponse({ status: 200, description: 'Students returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  getCourseStudents(@Param('id') id: string, @Request() req: any) {
    return this.service.getCourseStudents(id, req.user.id);
  }

  @Get('quizzes/:id')
  @ApiOperation({ summary: 'Get report for a quiz' })
  @ApiResponse({ status: 200, description: 'Quiz report returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  getQuizReport(@Param('id') id: string, @Request() req: any) {
    return this.service.getQuizReport(id, req.user.id);
  }

  @Get('quizzes/:id/question-analysis')
  @ApiOperation({ summary: 'Get question-level analysis for a quiz' })
  @ApiResponse({ status: 200, description: 'Analysis returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  getQuizQuestionAnalysis(@Param('id') id: string, @Request() req: any) {
    return this.service.getQuizQuestionAnalysis(id, req.user.id);
  }
}
