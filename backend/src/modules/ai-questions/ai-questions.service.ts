import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import { AIGeneratedQuestion, AIOption } from './dto/ai-question.dto';

@Injectable()
export class AiQuestionsService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('OPENAI_API_KEY is not configured');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async generateQuestions(dto: GenerateQuestionsDto): Promise<AIGeneratedQuestion[]> {
    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(dto);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new InternalServerErrorException('Empty response from OpenAI');
      }

      const parsed = JSON.parse(content);
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new InternalServerErrorException('Invalid response format from OpenAI');
      }

      return this.validateAndTransform(parsed.questions);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          throw new BadRequestException('OpenAI rate limit exceeded. Please try again later.');
        }
        throw new InternalServerErrorException(`OpenAI API error: ${error.message}`);
      }
      throw new InternalServerErrorException(`Failed to generate questions: ${error.message}`);
    }
  }

  private buildSystemPrompt(): string {
    return `You are an expert educator creating quiz questions for an LMS.
Return a JSON object with key "questions" containing an array of question objects.

Each question MUST have:
- type: one of [single, multi, true_false, short_answer, essay]
- content: the question text (clear, concise, appropriate for assessment)
- explanation: brief explanation of why the correct answer is right (optional but recommended)
- difficulty: easy | medium | hard
- defaultScore: number (1-5, default to 1)
- tags: string[] of relevant topic tags
- options: array of options (see rules below)

Rules by type:
- single: 4 options, exactly 1 isCorrect=true
- multi: 4 options, 2-3 isCorrect=true
- true_false: exactly 2 options ["True","False"], exactly 1 isCorrect=true
- short_answer: exactly 1 option with isCorrect=true (the answer text)
- essay: empty options array

Return between 1 and 20 questions based on the user's count parameter.`;
  }

  private buildUserPrompt(dto: GenerateQuestionsDto): string {
    const typeList = dto.types.join(', ');
    let prompt = `Generate ${dto.count} quiz question(s) about: ${dto.topic}\n\n`;
    prompt += `Question types to include: ${typeList}\n`;
    prompt += `Difficulty: ${dto.difficulty}\n`;

    if (dto.context) {
      prompt += `\nAdditional context:\n${dto.context}\n`;
    }

    prompt += `\nGenerate exactly ${dto.count} question(s) in JSON format.`;
    return prompt;
  }

  private validateAndTransform(questions: any[]): AIGeneratedQuestion[] {
    const validTypes = ['single', 'multi', 'true_false', 'short_answer', 'essay'];
    const validDifficulties = ['easy', 'medium', 'hard'];

    return questions.map((q, index) => {
      if (!q.type || !validTypes.includes(q.type)) {
        throw new InternalServerErrorException(`Invalid question type at index ${index}`);
      }

      const options: AIOption[] = [];

      if (q.type === 'single' || q.type === 'multi') {
        if (!Array.isArray(q.options) || q.options.length < 2) {
          throw new InternalServerErrorException(`Question at index ${index} must have at least 2 options`);
        }
        options.push(...q.options.map((opt: any, i: number) => ({
          content: opt.content || '',
          isCorrect: Boolean(opt.isCorrect),
          orderIndex: i,
        })));
      } else if (q.type === 'true_false') {
        options.push(
          { content: 'True', isCorrect: q.options?.[0]?.isCorrect === true, orderIndex: 0 },
          { content: 'False', isCorrect: q.options?.[1]?.isCorrect === true || (q.options?.[0]?.isCorrect === false), orderIndex: 1 },
        );
      } else if (q.type === 'short_answer') {
        options.push({
          content: q.options?.[0]?.content || q.answer || '',
          isCorrect: true,
          orderIndex: 0,
        });
      }
      // essay has empty options

      return {
        type: q.type,
        content: q.content || '',
        explanation: q.explanation || undefined,
        difficulty: validDifficulties.includes(q.difficulty) ? q.difficulty : 'medium',
        defaultScore: typeof q.defaultScore === 'number' && q.defaultScore >= 1 && q.defaultScore <= 5 ? q.defaultScore : 1,
        tags: Array.isArray(q.tags) ? q.tags : [],
        options,
      };
    });
  }
}
