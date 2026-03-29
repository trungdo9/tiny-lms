import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { QuestionBanksService } from './question-banks.service';
import { CreateQuestionBankDto, UpdateQuestionBankDto } from './dto/question-bank.dto';

@ApiTags('question-banks')
@ApiBearerAuth()
@Controller('question-banks')
@UseGuards(SupabaseAuthGuard)
export class QuestionBanksController {
  constructor(private service: QuestionBanksService) {}

  @ApiOperation({ summary: 'Create a question bank' })
  @ApiResponse({ status: 201, description: 'Question bank created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  create(@Request() req: any, @Body() dto: CreateQuestionBankDto) {
    return this.service.create(req.user.id, dto);
  }

  @ApiOperation({ summary: 'List all question banks for the current user' })
  @ApiResponse({ status: 200, description: 'List of question banks' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  findAll(@Request() req: any, @Param('courseId') courseId?: string) {
    return this.service.findAll(req.user.id, courseId);
  }

  @ApiOperation({ summary: 'Get a question bank by ID' })
  @ApiResponse({ status: 200, description: 'Question bank found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question bank not found' })
  @Get(':id')
  findById(@Param('id') id: string, @Request() req: any) {
    return this.service.findById(id, req.user.id);
  }

  @ApiOperation({ summary: 'Update a question bank' })
  @ApiResponse({ status: 200, description: 'Question bank updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question bank not found' })
  @Put(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateQuestionBankDto) {
    return this.service.update(id, req.user.id, dto);
  }

  @ApiOperation({ summary: 'Delete a question bank' })
  @ApiResponse({ status: 200, description: 'Question bank deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question bank not found' })
  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.service.delete(id, req.user.id);
  }

  @ApiOperation({ summary: 'Get all questions in a question bank' })
  @ApiResponse({ status: 200, description: 'List of questions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question bank not found' })
  @Get(':id/questions')
  getQuestions(@Param('id') id: string, @Request() req: any) {
    return this.service.getQuestions(id, req.user.id);
  }
}
