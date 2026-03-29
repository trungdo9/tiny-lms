import { Controller, Post, Body, UseGuards, Request, Param, UseInterceptors, UploadedFile, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { SupabaseAuthGuard } from '../../../common/guards/supabase-auth.guard';
import { ImportService } from './import.service';

@ApiTags('question-banks')
@ApiBearerAuth()
@Controller('question-banks')
@UseGuards(SupabaseAuthGuard)
export class ImportController {
  constructor(private importService: ImportService) {}

  @ApiOperation({ summary: 'Preview questions parsed from CSV or Excel content' })
  @ApiResponse({ status: 201, description: 'Parsed question preview' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question bank not found' })
  @Post(':id/import/preview')
  preview(@Param('id') bankId: string, @Body('content') content: string) {
    const isExcel = content.startsWith('UklGR');
    if (isExcel) {
      const buffer = Buffer.from(content, 'base64');
      return this.importService.parseExcel(buffer);
    }
    return this.importService.parseCSV(content);
  }

  @ApiOperation({ summary: 'Download CSV import template for a question bank' })
  @ApiResponse({ status: 201, description: 'CSV template file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question bank not found' })
  @Post(':id/import/template')
  getTemplate(@Res() res: Response) {
    const template = this.importService.generateTemplate();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=questions_template.csv');
    res.send(template);
  }
}
