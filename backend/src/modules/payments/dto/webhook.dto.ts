import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SepayWebhookDto {
  @ApiProperty({ example: 'TXN-001' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'VCB' })
  @IsString()
  @IsNotEmpty()
  gateway: string;

  @ApiProperty({ example: '2025-01-15 10:30:00' })
  @IsString()
  @IsNotEmpty()
  transactionDate: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({ example: 'PAY-abc123' })
  @IsString()
  code: string; // payment code in transfer description

  @ApiProperty({ example: 'THANH TOAN KHOA HOC PAY-abc123' })
  @IsString()
  content: string; // full transfer description

  @ApiProperty({ enum: [1, 2], example: 1 })
  @IsNumber()
  transferType: number; // 1 = in, 2 = out

  @ApiProperty({ example: 500000 })
  @IsNumber()
  transferAmount: number;

  @ApiProperty({ example: 1500000 })
  @IsNumber()
  accumulated: number;

  @ApiProperty({ example: 'REF-xyz789' })
  @IsString()
  referenceCode: string;

  @ApiProperty({ example: 'Payment for course enrollment' })
  @IsString()
  description: string;
}
