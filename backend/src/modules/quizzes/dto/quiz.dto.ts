import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsArray,
  Min,
  Max,
  IsDateString,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Helper type for Date fields
type DateString = string;

export class CreateQuizDto {
  @ApiProperty({ example: 'Chapter 1 Quiz' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Test your knowledge of chapter 1.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ minimum: 1, example: 30 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  timeLimitMinutes?: number;

  @ApiPropertyOptional({ minimum: 1, example: 3 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxAttempts?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 100, example: 70 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  passScore?: number;

  @ApiPropertyOptional({ enum: ['immediately', 'after_closed', 'never'], example: 'immediately' })
  @IsString()
  @IsOptional()
  @IsIn(['immediately', 'after_closed', 'never'])
  showResult?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  showCorrectAnswer?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  showExplanation?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  shuffleQuestions?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  shuffleAnswers?: boolean;

  @ApiPropertyOptional({ enum: ['all', 'paginated', 'one_by_one'], example: 'all' })
  @IsString()
  @IsOptional()
  @IsIn(['all', 'paginated', 'one_by_one'])
  paginationMode?: string;

  @ApiPropertyOptional({ minimum: 1, example: 10 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  questionsPerPage?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  allowBackNavigation?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: '2025-01-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  availableFrom?: DateString;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59.000Z' })
  @IsDateString()
  @IsOptional()
  availableUntil?: DateString;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  showLeaderboard?: boolean;
}

export class UpdateQuizDto {
  @ApiPropertyOptional({ example: 'Chapter 1 Quiz' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Test your knowledge of chapter 1.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ minimum: 1, example: 30 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  timeLimitMinutes?: number;

  @ApiPropertyOptional({ minimum: 1, example: 3 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxAttempts?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 100, example: 70 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  passScore?: number;

  @ApiPropertyOptional({ enum: ['immediately', 'after_closed', 'never'], example: 'immediately' })
  @IsString()
  @IsOptional()
  @IsIn(['immediately', 'after_closed', 'never'])
  showResult?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  showCorrectAnswer?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  showExplanation?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  shuffleQuestions?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  shuffleAnswers?: boolean;

  @ApiPropertyOptional({ enum: ['all', 'paginated', 'one_by_one'], example: 'all' })
  @IsString()
  @IsOptional()
  @IsIn(['all', 'paginated', 'one_by_one'])
  paginationMode?: string;

  @ApiPropertyOptional({ minimum: 1, example: 10 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  questionsPerPage?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  allowBackNavigation?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: '2025-01-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  availableFrom?: DateString;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59.000Z' })
  @IsDateString()
  @IsOptional()
  availableUntil?: DateString;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  showLeaderboard?: boolean;
}

export class AddQuizQuestionDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  @IsOptional()
  questionId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  @IsOptional()
  bankId?: string;

  @ApiPropertyOptional({ minimum: 1, example: 5 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  pickCount?: number;

  @ApiPropertyOptional({ example: 'medium' })
  @IsString()
  @IsOptional()
  difficultyFilter?: string;

  @ApiPropertyOptional({ type: [String], example: ['grammar', 'vocab'] })
  @IsString({ each: true })
  @IsOptional()
  tagFilter?: string[];

  @ApiPropertyOptional({ minimum: 0, example: 10 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  scoreOverride?: number;
}

export class CloneQuizDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  targetLessonId: string;
}
