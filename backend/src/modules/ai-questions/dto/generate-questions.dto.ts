import { IsString, IsOptional, IsArray, ArrayMinSize, IsIn, IsInt, Min, Max, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateQuestionsDto {
  @ApiProperty({ description: 'Topic for question generation (e.g. "JavaScript closures")', minLength: 3, maxLength: 500 })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  topic: string;

  @ApiPropertyOptional({ description: 'Additional context or excerpt for generating more relevant questions', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  context?: string;

  @ApiProperty({ description: 'Question types to generate', type: [String], enum: ['single', 'multi', 'true_false', 'short_answer', 'essay'] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  types: ('single' | 'multi' | 'true_false' | 'short_answer' | 'essay')[];

  @ApiProperty({ description: 'Difficulty level', enum: ['easy', 'medium', 'hard', 'mixed'] })
  @IsString()
  @IsIn(['easy', 'medium', 'hard', 'mixed'])
  difficulty: string;

  @ApiProperty({ description: 'Number of questions to generate (1-20)', minimum: 1, maximum: 20 })
  @IsInt()
  @Min(1)
  @Max(20)
  count: number;
}
