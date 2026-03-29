import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, UpdateQuizDto, AddQuizQuestionDto, CloneQuizDto } from './dto/quiz.dto';

// ─── Nested under /lessons/:lessonId ─────────────────────────────────────────

@ApiTags('quizzes')
@ApiBearerAuth()
@Controller('lessons/:lessonId/quizzes')
@UseGuards(SupabaseAuthGuard)
export class LessonQuizzesController {
  constructor(private service: QuizzesService) { }

  /** Create quiz for a lesson. 1 lesson = 1 quiz max. */
  @ApiOperation({ summary: 'Create a quiz for a lesson (max 1 per lesson)' })
  @ApiResponse({ status: 201, description: 'Quiz created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  @Post()
  create(
    @Request() req: any,
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateQuizDto,
  ) {
    return this.service.create(req.user.id, lessonId, dto, req.user.role);
  }

  /** Get the quiz attached to a lesson (null if none). */
  @ApiOperation({ summary: 'Get the quiz attached to a lesson' })
  @ApiResponse({ status: 200, description: 'Quiz or null' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  @Get()
  findByLesson(@Param('lessonId') lessonId: string, @Request() req: any) {
    return this.service.findByLesson(lessonId, req.user?.id, req.user?.role);
  }
}

// ─── Standalone /quizzes routes ───────────────────────────────────────────────

@ApiTags('quizzes')
@ApiBearerAuth()
@Controller('quizzes')
@UseGuards(SupabaseAuthGuard)
export class QuizzesController {
  constructor(private service: QuizzesService) { }

  /** List quizzes, optionally filtered by courseId or sectionId. */
  @ApiOperation({ summary: 'List quizzes, optionally filtered by courseId or sectionId' })
  @ApiResponse({ status: 200, description: 'List of quizzes' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  findAll(
    @Query('courseId') courseId?: string,
    @Query('sectionId') sectionId?: string,
  ) {
    return this.service.findAll(courseId, sectionId);
  }

  @ApiOperation({ summary: 'Get a quiz by ID' })
  @ApiResponse({ status: 200, description: 'Quiz found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @ApiOperation({ summary: 'Update a quiz' })
  @ApiResponse({ status: 200, description: 'Quiz updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @Put(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateQuizDto) {
    return this.service.update(id, req.user.id, dto, req.user.role);
  }

  @ApiOperation({ summary: 'Delete a quiz' })
  @ApiResponse({ status: 200, description: 'Quiz deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.service.delete(id, req.user.id, req.user.role);
  }

  /** Clone an existing quiz into a different lesson. */
  @ApiOperation({ summary: 'Clone a quiz into a different lesson' })
  @ApiResponse({ status: 201, description: 'Quiz cloned' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @Post(':id/clone')
  clone(@Param('id') id: string, @Request() req: any, @Body() dto: CloneQuizDto) {
    return this.service.clone(id, req.user.id, dto, req.user.role);
  }

  // ─── Questions ─────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Get all questions in a quiz' })
  @ApiResponse({ status: 200, description: 'List of quiz questions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @Get(':id/questions')
  getQuestions(@Param('id') id: string) {
    return this.service.getQuestions(id);
  }

  @ApiOperation({ summary: 'Add a question to a quiz' })
  @ApiResponse({ status: 201, description: 'Question added' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @Post(':id/questions')
  addQuestion(@Param('id') id: string, @Request() req: any, @Body() dto: AddQuizQuestionDto) {
    return this.service.addQuestion(id, req.user.id, dto, req.user.role);
  }

  @ApiOperation({ summary: 'Remove a question from a quiz' })
  @ApiResponse({ status: 200, description: 'Question removed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz or question not found' })
  @Delete(':id/questions/:quizQuestionId')
  removeQuestion(
    @Param('id') id: string,
    @Param('quizQuestionId') quizQuestionId: string,
    @Request() req: any,
  ) {
    return this.service.removeQuestion(id, quizQuestionId, req.user.id, req.user.role);
  }

  // ─── Leaderboard ───────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Get quiz leaderboard' })
  @ApiResponse({ status: 200, description: 'Leaderboard entries' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @Get(':id/leaderboard')
  getLeaderboard(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.service.getLeaderboard(id, limit ? parseInt(limit, 10) : 10);
  }
}
