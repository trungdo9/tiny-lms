import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({ description: 'Lesson title' })
  @IsString()
  title: string;

  @ApiProperty({ enum: ['video', 'text', 'pdf', 'quiz', 'scorm'], description: 'Lesson content type' })
  @IsEnum(['video', 'text', 'pdf', 'quiz', 'scorm'])
  type: string;

  @ApiPropertyOptional({ description: 'Rich-text or markdown content (for text lessons)' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Video URL' })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional({ enum: ['youtube', 'vimeo', 's3', 'upload'], description: 'Video hosting provider' })
  @IsEnum(['youtube', 'vimeo', 's3', 'upload'])
  @IsOptional()
  videoProvider?: string;

  @ApiPropertyOptional({ description: 'PDF file URL' })
  @IsString()
  @IsOptional()
  pdfUrl?: string;

  @ApiPropertyOptional({ description: 'Estimated duration in minutes' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  durationMins?: number;

  @ApiPropertyOptional({ description: 'Display order index within the module' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  orderIndex?: number;

  @ApiPropertyOptional({ description: 'Whether this lesson is available as a free preview' })
  @IsBoolean()
  @IsOptional()
  isPreview?: boolean;

  @ApiPropertyOptional({ description: 'Whether the lesson is published' })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({ format: 'uuid', description: 'ID of the lesson that must be completed first' })
  @IsUUID()
  @IsOptional()
  prerequisiteLessonId?: string;

  @ApiPropertyOptional({ description: 'Number of days after enrollment before this lesson becomes available' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  availableAfterDays?: number;
}

export class UpdateLessonDto {
  @ApiPropertyOptional({ description: 'Lesson title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ enum: ['video', 'text', 'pdf', 'quiz', 'scorm'], description: 'Lesson content type' })
  @IsEnum(['video', 'text', 'pdf', 'quiz', 'scorm'])
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: 'Rich-text or markdown content (for text lessons)' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Video URL' })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional({ enum: ['youtube', 'vimeo', 's3', 'upload'], description: 'Video hosting provider' })
  @IsEnum(['youtube', 'vimeo', 's3', 'upload'])
  @IsOptional()
  videoProvider?: string;

  @ApiPropertyOptional({ description: 'PDF file URL' })
  @IsString()
  @IsOptional()
  pdfUrl?: string;

  @ApiPropertyOptional({ description: 'Estimated duration in minutes' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  durationMins?: number;

  @ApiPropertyOptional({ description: 'Display order index within the module' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  orderIndex?: number;

  @ApiPropertyOptional({ description: 'Whether this lesson is available as a free preview' })
  @IsBoolean()
  @IsOptional()
  isPreview?: boolean;

  @ApiPropertyOptional({ description: 'Whether the lesson is published' })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({ format: 'uuid', description: 'ID of the lesson that must be completed first' })
  @IsUUID()
  @IsOptional()
  prerequisiteLessonId?: string;

  @ApiPropertyOptional({ description: 'Number of days after enrollment before this lesson becomes available' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  availableAfterDays?: number;
}

export class ReorderLessonsDto {
  @ApiProperty({ type: [String], description: 'Lesson IDs in the desired display order' })
  @IsArray()
  @IsString({ each: true })
  lessonIds: string[];
}
