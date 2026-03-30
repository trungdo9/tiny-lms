import { IsString, IsOptional, IsArray, IsBoolean, IsNumber, IsUUID, ValidateNested, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CANONICAL_QUESTION_DIFFICULTIES } from '../question-difficulty.util';

export const VALID_QUESTION_TYPES = ['single', 'multi', 'true_false', 'short_answer', 'essay', 'matching', 'ordering', 'cloze'];
export const VALID_DIFFICULTIES = [...CANONICAL_QUESTION_DIFFICULTIES];

export class CreateOptionDto {
  @ApiProperty({ description: 'Option text content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Whether this option is the correct answer' })
  @IsBoolean()
  @IsOptional()
  isCorrect?: boolean;

  @ApiPropertyOptional({ description: 'Matching key (for match-type questions)' })
  @IsString()
  @IsOptional()
  matchKey?: string;

  @ApiPropertyOptional({ description: 'Matching value (for match-type questions)' })
  @IsString()
  @IsOptional()
  matchValue?: string;
}

export class CreateQuestionDto {
  @ApiProperty({ enum: VALID_QUESTION_TYPES, description: 'Question type' })
  @IsIn(VALID_QUESTION_TYPES)
  type: string;

  @ApiProperty({ description: 'Question text content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Explanation shown after answering' })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiPropertyOptional({ description: 'URL of associated media' })
  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @ApiPropertyOptional({ description: 'Media type (e.g. image, video)' })
  @IsString()
  @IsOptional()
  mediaType?: string;

  @ApiPropertyOptional({ enum: VALID_DIFFICULTIES, default: 'medium', description: 'Difficulty level' })
  @IsIn(VALID_DIFFICULTIES)
  @IsOptional()
  difficulty?: string;

  @ApiPropertyOptional({ minimum: 0, description: 'Default score for this question' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  defaultScore?: number;

  @ApiPropertyOptional({ type: [String], description: 'Tags for categorization' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ type: () => CreateOptionDto, isArray: true, description: 'Answer options' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  @IsOptional()
  options?: CreateOptionDto[];
}

export class UpdateQuestionDto {
  @ApiPropertyOptional({ description: 'Question text content' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Explanation shown after answering' })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiPropertyOptional({ description: 'URL of associated media' })
  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @ApiPropertyOptional({ description: 'Media type (e.g. image, video)' })
  @IsString()
  @IsOptional()
  mediaType?: string;

  @ApiPropertyOptional({ enum: VALID_DIFFICULTIES, description: 'Difficulty level' })
  @IsIn(VALID_DIFFICULTIES)
  @IsOptional()
  difficulty?: string;

  @ApiPropertyOptional({ minimum: 0, description: 'Default score for this question' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  defaultScore?: number;

  @ApiPropertyOptional({ type: [String], description: 'Tags for categorization' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ type: () => CreateOptionDto, isArray: true, description: 'Replace all answer options inline (optional)' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  @IsOptional()
  options?: CreateOptionDto[];
}

export class BulkCreateQuestionDto {
  @ApiProperty({ type: () => CreateQuestionDto, isArray: true, description: 'List of questions to create' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}

export class ListQuestionsQueryDto {
  @ApiPropertyOptional({ description: 'Full-text search on question content' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by types (comma-separated)', example: 'single,multi' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: 'Filter by difficulties (comma-separated)', example: 'easy,medium' })
  @IsString()
  @IsOptional()
  difficulty?: string;

  @ApiPropertyOptional({ description: 'Filter by tags (comma-separated, any match)', example: 'math,algebra' })
  @IsString()
  @IsOptional()
  tags?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Page number' })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100, description: 'Items per page' })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}

export class CloneQuestionDto {
  @ApiPropertyOptional({ description: 'Target bank ID to clone into (defaults to same bank)' })
  @IsUUID()
  @IsOptional()
  targetBankId?: string;
}

export class MoveQuestionDto {
  @ApiProperty({ description: 'Target bank ID to move question to' })
  @IsUUID()
  targetBankId: string;
}
