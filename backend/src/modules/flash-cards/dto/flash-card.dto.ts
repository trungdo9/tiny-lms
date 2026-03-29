import { IsString, IsOptional, IsBoolean, IsInt, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeckDto {
  @ApiProperty({ description: 'Deck title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Deck description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether cards should be presented in random order' })
  @IsBoolean()
  @IsOptional()
  shuffleCards?: boolean;

  @ApiPropertyOptional({ description: 'Whether the deck is published and visible to learners' })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class UpdateDeckDto {
  @ApiPropertyOptional({ description: 'Deck title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Deck description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether cards should be presented in random order' })
  @IsBoolean()
  @IsOptional()
  shuffleCards?: boolean;

  @ApiPropertyOptional({ description: 'Whether the deck is published and visible to learners' })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class CreateCardDto {
  @ApiProperty({ description: 'Front face content of the flash card' })
  @IsString()
  front: string;

  @ApiProperty({ description: 'Back face content of the flash card' })
  @IsString()
  back: string;

  @ApiPropertyOptional({ description: 'Optional hint shown to the learner' })
  @IsString()
  @IsOptional()
  hint?: string;

  @ApiPropertyOptional({ description: 'URL of an image associated with the card' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Display order index within the deck' })
  @IsInt()
  @IsOptional()
  orderIndex?: number;
}

export class UpdateCardDto {
  @ApiPropertyOptional({ description: 'Front face content of the flash card' })
  @IsString()
  @IsOptional()
  front?: string;

  @ApiPropertyOptional({ description: 'Back face content of the flash card' })
  @IsString()
  @IsOptional()
  back?: string;

  @ApiPropertyOptional({ description: 'Optional hint shown to the learner' })
  @IsString()
  @IsOptional()
  hint?: string;

  @ApiPropertyOptional({ description: 'URL of an image associated with the card' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Display order index within the deck' })
  @IsInt()
  @IsOptional()
  orderIndex?: number;
}

export class CompleteSessionDto {
  @ApiProperty({ description: 'Number of cards the learner marked as known' })
  @IsInt()
  knownCards: number;

  @ApiPropertyOptional({ description: 'Total time spent in the session, in seconds' })
  @IsInt()
  @IsOptional()
  timeSpentSecs?: number;
}
