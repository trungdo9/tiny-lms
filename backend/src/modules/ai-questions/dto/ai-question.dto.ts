import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AIOption {
  @ApiProperty()
  content: string;

  @ApiProperty()
  isCorrect: boolean;

  @ApiPropertyOptional()
  matchKey?: string;

  @ApiPropertyOptional()
  matchValue?: string;

  @ApiPropertyOptional()
  orderIndex?: number;
}

export class AIGeneratedQuestion {
  @ApiProperty()
  type: string;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional()
  explanation?: string;

  @ApiProperty()
  difficulty: string;

  @ApiProperty()
  defaultScore: number;

  @ApiProperty({ type: [AIOption] })
  options: AIOption[];

  @ApiProperty({ type: [String] })
  tags: string[];
}
