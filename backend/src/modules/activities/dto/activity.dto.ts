import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActivityDto {
  @ApiProperty({ enum: ['quiz', 'flashcard', 'video', 'file'], example: 'video' })
  @IsString()
  activityType: 'quiz' | 'flashcard' | 'video' | 'file';

  @ApiProperty({ example: 'Intro Video' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  // For video/file types
  @ApiPropertyOptional({ example: 'https://example.com/video.mp4' })
  @IsString()
  @IsOptional()
  contentUrl?: string;

  @ApiPropertyOptional({ example: 'video/mp4' })
  @IsString()
  @IsOptional()
  contentType?: string;
}

export class UpdateActivityDto {
  @ApiPropertyOptional({ example: 'Intro Video' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/video.mp4' })
  @IsString()
  @IsOptional()
  contentUrl?: string;

  @ApiPropertyOptional({ example: 'video/mp4' })
  @IsString()
  @IsOptional()
  contentType?: string;
}

export class ReorderActivitiesDto {
  @ApiProperty({ type: [String], example: ['uuid-1', 'uuid-2'] })
  @IsString({ each: true })
  activityIds: string[];
}
