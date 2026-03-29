import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { QuestionsService } from './questions.service';
import { QuestionsManagementService } from './questions-management.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  CreateOptionDto,
  BulkCreateQuestionDto,
  ListQuestionsQueryDto,
  CloneQuestionDto,
  MoveQuestionDto,
} from './dto/question.dto';

@ApiTags('questions')
@ApiBearerAuth()
@Controller('questions')
@UseGuards(SupabaseAuthGuard)
export class QuestionsController {
  constructor(
    private service: QuestionsService,
    private management: QuestionsManagementService,
  ) {}

  @ApiOperation({ summary: 'List questions in a bank with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated questions list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question bank not found' })
  @Get('bank/:bankId')
  findAll(@Param('bankId') bankId: string, @Request() req: any, @Query() query: ListQuestionsQueryDto) {
    return this.service.findAll(bankId, req.user.id, req.user.role, query);
  }

  @ApiOperation({ summary: 'Get a single question by ID with usage count' })
  @ApiResponse({ status: 200, description: 'Question detail' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.service.findOne(id, req.user.id, req.user.role);
  }

  @ApiOperation({ summary: 'Create a question in a bank' })
  @ApiResponse({ status: 201, description: 'Question created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question bank not found' })
  @Post('bank/:bankId')
  create(@Param('bankId') bankId: string, @Request() req: any, @Body() dto: CreateQuestionDto) {
    return this.service.create(bankId, req.user.id, req.user.role, dto);
  }

  @ApiOperation({ summary: 'Bulk create questions in a bank' })
  @ApiResponse({ status: 201, description: 'Questions created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question bank not found' })
  @Post('bank/:bankId/bulk')
  bulkCreate(@Param('bankId') bankId: string, @Request() req: any, @Body() dto: BulkCreateQuestionDto) {
    return this.service.bulkCreate(bankId, req.user.id, req.user.role, dto.questions);
  }

  @ApiOperation({ summary: 'Update a question (optionally replace options inline)' })
  @ApiResponse({ status: 200, description: 'Question updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @Put(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateQuestionDto) {
    return this.service.update(id, req.user.id, req.user.role, dto);
  }

  @ApiOperation({ summary: 'Delete a question' })
  @ApiResponse({ status: 200, description: 'Question deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.service.delete(id, req.user.id, req.user.role);
  }

  @ApiOperation({ summary: 'Clone a question (optionally to a different bank)' })
  @ApiResponse({ status: 201, description: 'Question cloned' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @Post(':id/clone')
  clone(@Param('id') id: string, @Request() req: any, @Body() dto: CloneQuestionDto) {
    return this.management.clone(id, req.user.id, req.user.role, dto);
  }

  @ApiOperation({ summary: 'Move a question to another bank (blocked if used in any quiz)' })
  @ApiResponse({ status: 200, description: 'Question moved' })
  @ApiResponse({ status: 400, description: 'Question is used in one or more quizzes' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @Patch(':id/move')
  move(@Param('id') id: string, @Request() req: any, @Body() dto: MoveQuestionDto) {
    return this.management.move(id, req.user.id, req.user.role, dto);
  }

  @ApiOperation({ summary: 'Add answer options to a question' })
  @ApiResponse({ status: 201, description: 'Options added' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @Post(':id/options')
  addOptions(@Param('id') id: string, @Request() req: any, @Body() options: CreateOptionDto[]) {
    return this.management.addOptions(id, req.user.id, req.user.role, options);
  }

  @ApiOperation({ summary: 'Replace all answer options on a question' })
  @ApiResponse({ status: 200, description: 'Options updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @Put(':id/options')
  updateOptions(@Param('id') id: string, @Request() req: any, @Body() options: CreateOptionDto[]) {
    return this.management.updateOptions(id, req.user.id, req.user.role, options);
  }
}
