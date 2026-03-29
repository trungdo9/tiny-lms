import { IsString, IsOptional, IsNumber, MinLength, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Engineering', minLength: 1, maxLength: 200 })
  @IsString() @MinLength(1) @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Handles all engineering work.' })
  @IsString() @IsOptional()
  description?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsString() @IsOptional() @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ example: 'active' })
  @IsString() @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber() @IsOptional()
  orderIndex?: number;
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ example: 'Engineering', minLength: 1, maxLength: 200 })
  @IsString() @IsOptional() @MinLength(1) @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'Handles all engineering work.' })
  @IsString() @IsOptional()
  description?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsString() @IsOptional() @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ example: 'active' })
  @IsString() @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber() @IsOptional()
  orderIndex?: number;
}
