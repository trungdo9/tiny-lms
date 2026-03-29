import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SepayWebhookDto } from './dto/webhook.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiHeader } from '@nestjs/swagger';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /** Create a payment for a paid course */
  @Post()
  @UseGuards(SupabaseAuthGuard)
  createPayment(@Body() dto: CreatePaymentDto, @Request() req: any) {
    return this.paymentsService.createPayment(req.user.id, dto.courseId);
  }

  /** Sepay webhook — validated by Bearer token secret */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(
    @Body() payload: SepayWebhookDto,
    @Headers('authorization') auth: string,
  ) {
    return this.paymentsService.processWebhook(payload, auth);
  }

  /** Get all payments for current user */
  @Get('my')
  @UseGuards(SupabaseAuthGuard)
  getMyPayments(@Request() req: any) {
    return this.paymentsService.getUserPayments(req.user.id);
  }

  /** Check status of a specific payment */
  @Get(':id/status')
  @UseGuards(SupabaseAuthGuard)
  getStatus(@Param('id') id: string, @Request() req: any) {
    return this.paymentsService.getPaymentStatus(id, req.user.id);
  }
}
