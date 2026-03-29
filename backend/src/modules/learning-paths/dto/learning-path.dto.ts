import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLearningPathDto {
  @ApiProperty({ example: 'Frontend Developer Path' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'A curated path to become a frontend developer.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/thumbnail.png' })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;
}

export class UpdateLearningPathDto {
  @ApiPropertyOptional({ example: 'Frontend Developer Path' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'A curated path to become a frontend developer.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/thumbnail.png' })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class AddCourseToPathDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  courseId: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;
}

export class ReorderPathCoursesDto {
  @ApiProperty({ type: [String], example: ['uuid-1', 'uuid-2'] })
  @IsArray()
  @IsString({ each: true })
  courseIds: string[];
}
