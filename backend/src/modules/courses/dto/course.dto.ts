import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsUUID, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ description: 'Course title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Course description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'URL of the course thumbnail image' })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ enum: ['beginner', 'intermediate', 'advanced'], description: 'Difficulty level' })
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  @IsOptional()
  level?: string;

  @ApiPropertyOptional({ description: 'Whether the course is free' })
  @IsBoolean()
  @IsOptional()
  isFree?: boolean;

  @ApiPropertyOptional({ description: 'Course price' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ format: 'uuid', description: 'Category ID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;
}

export class UpdateCourseDto {
  @ApiPropertyOptional({ description: 'Course title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Course description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'URL of the course thumbnail image' })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ enum: ['beginner', 'intermediate', 'advanced'], description: 'Difficulty level' })
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  @IsOptional()
  level?: string;

  @ApiPropertyOptional({ enum: ['draft', 'published', 'archived'], description: 'Publication status' })
  @IsEnum(['draft', 'published', 'archived'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Whether the course is free' })
  @IsBoolean()
  @IsOptional()
  isFree?: boolean;

  @ApiPropertyOptional({ description: 'Course price' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ format: 'uuid', description: 'Category ID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;
}

export class CourseQueryDto {
  @ApiPropertyOptional({ minimum: 1, description: 'Page number', default: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, description: 'Items per page', default: 10 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by category ID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ enum: ['beginner', 'intermediate', 'advanced'], description: 'Filter by difficulty level' })
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  @IsOptional()
  level?: string;

  @ApiPropertyOptional({ description: 'Filter by free courses' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isFree?: boolean;

  @ApiPropertyOptional({ enum: ['draft', 'published', 'archived'], description: 'Filter by publication status' })
  @IsEnum(['draft', 'published', 'archived'])
  @IsOptional()
  status?: string;
}

export class CloneCourseDto {
  @ApiProperty({ description: 'Title for the cloned course' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Description for the cloned course' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ['none', 'clone_all', 'import_from_quizzes'], description: 'How to handle quiz import' })
  @IsEnum(['none', 'clone_all', 'import_from_quizzes'])
  importQuizMode: 'none' | 'clone_all' | 'import_from_quizzes';

  /**
   * Required when importQuizMode = 'import_from_quizzes'.
   * Quiz IDs whose questions will be imported into the cloned course's quizzes.
   */
  @ApiPropertyOptional({ type: [String], description: 'Quiz IDs to import questions from (required when importQuizMode is import_from_quizzes)' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  importFromQuizIds?: string[];
}

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'URL slug' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Parent category ID' })
  @IsUUID()
  @IsOptional()
  parentId?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: 'Category name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'URL slug' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Parent category ID' })
  @IsUUID()
  @IsOptional()
  parentId?: string;
}
