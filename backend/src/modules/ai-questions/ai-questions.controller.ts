import { Controller, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { AiQuestionsService } from './ai-questions.service';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import { AIGeneratedQuestion } from './dto/ai-question.dto';

@ApiTags('AI Questions')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('ai-questions')
export class AiQuestionsController {
  constructor(private readonly aiQuestionsService: AiQuestionsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate quiz questions using AI (GPT-4o-mini)' })
  @ApiResponse({ status: 201, description: 'Questions generated successfully', type: [AIGeneratedQuestion] })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only instructors and admins can generate questions' })
  @ApiResponse({ status: 500, description: 'OpenAI API error or configuration issue' })
  async generate(
    @Body() dto: GenerateQuestionsDto,
    @Request() req: any,
  ): Promise<AIGeneratedQuestion[]> {
    const role = req.user?.role;
    if (role !== 'instructor' && role !== 'admin') {
      throw new ForbiddenException('Only instructors and admins can generate questions');
    }
    return this.aiQuestionsService.generateQuestions(dto);
  }
}
