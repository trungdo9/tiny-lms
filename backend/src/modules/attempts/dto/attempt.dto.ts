import { IsString, IsOptional, IsArray, IsUUID, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaveAnswerDto {
  @ApiProperty({ format: 'uuid', description: 'Question ID being answered' })
  @IsUUID()
  questionId: string;

  @ApiPropertyOptional({ type: [String], description: 'Selected option IDs (UUIDs) for choice-based questions' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  selectedOptions?: string[];

  @ApiPropertyOptional({ description: 'Free-text answer' })
  @IsString()
  @IsOptional()
  textAnswer?: string;

  @ApiPropertyOptional({ type: [String], description: 'Ordered option IDs for ordering questions' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  orderAnswer?: string[];

  @ApiPropertyOptional({ description: 'Key-value pairs for matching questions', type: 'object', additionalProperties: { type: 'string' } })
  @IsOptional()
  matchAnswer?: Record<string, string>;
}

export class SubmitAttemptDto {
  @ApiPropertyOptional({ description: 'Set to true to finalize the attempt' })
  @IsOptional()
  submit?: boolean;
}
