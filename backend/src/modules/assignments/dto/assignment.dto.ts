import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({ description: 'Assignment instructions' })
  @IsString()
  instructions: string;

  @ApiPropertyOptional({ description: 'Maximum achievable score' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxScore?: number;

  @ApiPropertyOptional({ description: 'Due date (ISO 8601 date string)' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Whether late submissions are accepted' })
  @IsBoolean()
  @IsOptional()
  allowLateSubmission?: boolean;

  @ApiPropertyOptional({ description: 'Maximum allowed file size in bytes' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxFileSize?: number;

  @ApiPropertyOptional({ type: [String], description: 'Allowed file MIME types or extensions' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedFileTypes?: string[];
}

export class UpdateAssignmentDto extends CreateAssignmentDto {}

export class SubmitAssignmentDto {
  @ApiProperty({ description: 'URL of the submitted file' })
  @IsString()
  fileUrl: string;

  @ApiProperty({ description: 'Original file name' })
  @IsString()
  fileName: string;

  @ApiPropertyOptional({ description: 'Optional comment from the student' })
  @IsString()
  @IsOptional()
  comment?: string;
}

export class GradeSubmissionDto {
  @ApiProperty({ description: 'Score awarded' })
  @IsNumber()
  @Type(() => Number)
  score: number;

  @ApiPropertyOptional({ description: 'Instructor feedback' })
  @IsString()
  @IsOptional()
  feedback?: string;
}
