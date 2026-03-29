import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
  Res,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CertificatesService } from './certificates.service';

@ApiTags('certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private certificatesService: CertificatesService) {}

  @Post('issue/:courseId')
  @UseGuards(SupabaseAuthGuard)
  async issueCertificate(@Request() req: any, @Param('courseId') courseId: string) {
    return this.certificatesService.issueCertificate(req.user.id, courseId);
  }

  @Get('my')
  @UseGuards(SupabaseAuthGuard)
  async getMyCertificates(@Request() req: any) {
    return this.certificatesService.getMyCertificates(req.user.id);
  }

  @Get('eligible/:courseId')
  @UseGuards(SupabaseAuthGuard)
  async checkEligibility(@Request() req: any, @Param('courseId') courseId: string) {
    return this.certificatesService.isEligibleForCertificate(req.user.id, courseId);
  }

  @Get('verify/:certificateNumber')
  async verifyCertificate(@Param('certificateNumber') certificateNumber: string) {
    return this.certificatesService.findByNumber(certificateNumber);
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  async getCertificate(@Param('id') id: string) {
    return this.certificatesService.getCertificateById(id);
  }

  @Get(':id/pdf')
  @UseGuards(SupabaseAuthGuard)
  async getCertificatePdf(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.certificatesService.generatePdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificate-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.status(HttpStatus.OK).send(pdfBuffer);
  }
}
