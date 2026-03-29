import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionBankDto {
  @ApiProperty({ example: 'Chapter 1 Questions' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Questions covering chapter 1 topics.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  @IsOptional()
  courseId?: string;
}

export class UpdateQuestionBankDto {
  @ApiPropertyOptional({ example: 'Chapter 1 Questions' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Questions covering chapter 1 topics.' })
  @IsString()
  @IsOptional()
  description?: string;
}
