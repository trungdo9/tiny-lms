import { IsString, IsUUID, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignInstructorDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ enum: ['primary', 'co_instructor'], example: 'co_instructor' })
  @IsString()
  @IsOptional()
  @IsIn(['primary', 'co_instructor'])
  role?: string;
}

export class UpdateInstructorRoleDto {
  @ApiProperty({ enum: ['primary', 'co_instructor'], example: 'primary' })
  @IsString()
  @IsIn(['primary', 'co_instructor'])
  role: string;
}
