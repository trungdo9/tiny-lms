import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { AttemptsService } from './attempts.service';
import { SaveAnswerDto } from './dto/attempt.dto';

@ApiTags('attempts')
@ApiBearerAuth()
@Controller()
@UseGuards(SupabaseAuthGuard)
export class AttemptsController {
  constructor(private service: AttemptsService) {}

  @ApiOperation({ summary: 'Start a new quiz attempt' })
  @ApiResponse({ status: 201, description: 'Attempt started' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @Post('quizzes/:quizId/start')
  start(@Param('quizId') quizId: string, @Request() req: any) {
    return this.service.start(quizId, req.user.id);
  }

  @ApiOperation({ summary: 'Get an attempt by ID' })
  @ApiResponse({ status: 200, description: 'Attempt found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  @Get('attempts/:id')
  getAttempt(@Param('id') id: string, @Request() req: any) {
    return this.service.getAttempt(id, req.user.id);
  }

  @ApiOperation({ summary: 'Get a paginated page of questions for an attempt' })
  @ApiResponse({ status: 200, description: 'Page of questions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  @Get('attempts/:id/page/:page')
  getPage(@Param('id') id: string, @Param('page') page: number, @Request() req: any) {
    return this.service.getPage(id, page, req.user.id);
  }

  @ApiOperation({ summary: 'Save an answer for a question in an attempt' })
  @ApiResponse({ status: 201, description: 'Answer saved' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  @Post('attempts/:id/answers')
  saveAnswer(@Param('id') id: string, @Request() req: any, @Body() dto: SaveAnswerDto) {
    return this.service.saveAnswer(id, req.user.id, dto);
  }

  @ApiOperation({ summary: 'Submit an attempt for grading' })
  @ApiResponse({ status: 201, description: 'Attempt submitted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  @Post('attempts/:id/submit')
  submit(@Param('id') id: string, @Request() req: any) {
    return this.service.submit(id, req.user.id);
  }

  @ApiOperation({ summary: 'Get the result of a submitted attempt' })
  @ApiResponse({ status: 200, description: 'Attempt result' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  @Get('attempts/:id/result')
  getResult(@Param('id') id: string, @Request() req: any) {
    return this.service.getResult(id, req.user.id);
  }

  @ApiOperation({ summary: 'List all attempts by the current user for a quiz' })
  @ApiResponse({ status: 200, description: 'List of attempts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @Get('quizzes/:quizId/attempts')
  getUserAttempts(@Param('quizId') quizId: string, @Request() req: any) {
    return this.service.getUserAttempts(quizId, req.user.id);
  }

  @ApiOperation({ summary: 'Toggle flag on a question within an attempt' })
  @ApiResponse({ status: 200, description: 'Flag toggled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Attempt or question not found' })
  @Put('attempts/:id/questions/:questionId/flag')
  toggleFlag(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
    @Request() req: any
  ) {
    return this.service.toggleFlag(id, questionId, req.user.id);
  }

  @ApiOperation({ summary: 'Get all questions for an attempt' })
  @ApiResponse({ status: 200, description: 'List of questions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  @Get('attempts/:id/questions')
  getAllQuestions(@Param('id') id: string, @Request() req: any) {
    return this.service.getAllQuestions(id, req.user.id);
  }
}
