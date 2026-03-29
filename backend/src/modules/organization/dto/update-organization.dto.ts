import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'Acme Corp' })
  @IsString() @IsOptional() name?: string;

  @ApiPropertyOptional({ example: 'Acme' })
  @IsString() @IsOptional() shortName?: string;

  @ApiPropertyOptional({ example: 'contact@acme.com' })
  @IsString() @IsOptional() email?: string;

  @ApiPropertyOptional({ example: '+1-800-555-0199' })
  @IsString() @IsOptional() phone?: string;

  @ApiPropertyOptional({ example: '123 Main St' })
  @IsString() @IsOptional() address?: string;

  @ApiPropertyOptional({ example: 'San Francisco' })
  @IsString() @IsOptional() city?: string;

  @ApiPropertyOptional({ example: 'US' })
  @IsString() @IsOptional() country?: string;

  @ApiPropertyOptional({ example: 'https://acme.com' })
  @IsString() @IsOptional() website?: string;

  @ApiPropertyOptional({ example: 'We build great products.' })
  @IsString() @IsOptional() description?: string;

  @ApiPropertyOptional({ example: 'https://acme.com/logo.png' })
  @IsString() @IsOptional() logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://acme.com/favicon.ico' })
  @IsString() @IsOptional() faviconUrl?: string;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsString() @IsOptional() taxCode?: string;

  @ApiPropertyOptional({ minimum: 1900, maximum: 2100, example: 2010 })
  @IsInt() @Min(1900) @Max(2100) @IsOptional() foundedYear?: number;

  @ApiPropertyOptional({ example: 'https://facebook.com/acme' })
  @IsString() @IsOptional() facebookUrl?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/company/acme' })
  @IsString() @IsOptional() linkedinUrl?: string;
}
