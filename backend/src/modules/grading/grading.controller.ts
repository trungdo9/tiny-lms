import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { GradingService } from './grading.service';

@ApiTags('grading')
@ApiBearerAuth()
@Controller('grading')
@UseGuards(SupabaseAuthGuard)
export class GradingController {
  constructor(private service: GradingService) {}

  @ApiOperation({ summary: 'Get answers pending manual grading' })
  @ApiResponse({ status: 200, description: 'List of pending answers' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('pending')
  getPendingGrading(@Request() req: any, @Query('quizId') quizId?: string) {
    return this.service.getPendingGrading(req.user.id, quizId);
  }

  @ApiOperation({ summary: 'Grade a specific answer in an attempt' })
  @ApiResponse({ status: 201, description: 'Answer graded' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Attempt or answer not found' })
  @Post('attempts/:attemptId/answers/:answerId/grade')
  gradeAnswer(
    @Param('attemptId') attemptId: string,
    @Param('answerId') answerId: string,
    @Request() req: any,
    @Body() data: { score: number; feedback?: string },
  ) {
    return this.service.gradeAnswer(attemptId, answerId, req.user.id, data);
  }
}
