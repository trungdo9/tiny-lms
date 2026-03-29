import { IsUUID, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitAttemptDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  packageId: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  @IsOptional()
  lessonId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  @IsOptional()
  courseId?: string;
}

export class UpdateAttemptDto {
  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' }, example: { 'cmi.score.raw': '85' } })
  @IsObject()
  values: Record<string, string>;
}
