import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { SepayWebhookDto } from './dto/webhook.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async createPayment(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, slug: true, isFree: true, price: true, status: true },
    });

    if (!course) throw new NotFoundException('Course not found');
    if (course.status !== 'published') throw new BadRequestException('Course is not published');
    if (course.isFree) throw new BadRequestException('Course is free — use enrollment endpoint');

    // Check already enrolled
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (enrollment) throw new BadRequestException('Already enrolled in this course');

    const amount = Number(course.price);
    const timeoutMins = this.config.get<number>('app.sepay.paymentTimeoutMinutes') || 15;
    const expiresAt = new Date(Date.now() + timeoutMins * 60 * 1000);
    const bankAccount = this.config.get<string>('app.sepay.bankAccount');
    const bankId = this.config.get<string>('app.sepay.bankId');

    // Atomic: check existing, delete if stale, create new
    const payment = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.payment.findUnique({
        where: { userId_courseId: { userId, courseId } },
        include: { course: { select: { title: true } } },
      });

      if (existing) {
        if (existing.status === 'completed') {
          throw new BadRequestException('Already paid for this course');
        }
        if (existing.status === 'pending' && existing.expiresAt && existing.expiresAt > new Date()) {
          return existing;
        }
        // Expired or failed — delete and recreate
        await tx.payment.delete({ where: { id: existing.id } });
      }

      // Unique payment code embedded in transfer description for matching
      const paymentCode = `LMS${courseId.replace(/-/g, '').substring(0, 8).toUpperCase()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const qrCodeUrl = `https://qr.sepay.vn/img?bank=${bankId}&acc=${bankAccount}&amount=${amount}&des=${paymentCode}&template=compact`;

      return tx.payment.create({
        data: {
          userId,
          courseId,
          amount,
          currency: 'VND',
          status: 'pending',
          method: 'qr_code',
          paymentCode,
          qrCodeUrl,
          expiresAt,
        },
        include: { course: { select: { title: true } } },
      });
    });

    return this.formatPayment(payment, course.slug);
  }

  async processWebhook(
    payload: SepayWebhookDto,
    authHeader?: string,
  ): Promise<{ success: boolean; message: string }> {
    // Validate Bearer token if secret is configured
    const secret = this.config.get<string>('app.sepay.webhookSecret');
    if (secret) {
      const provided = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
      const secretBuf = Buffer.from(secret);
      const providedBuf = Buffer.from(provided);
      const valid =
        secretBuf.length === providedBuf.length &&
        crypto.timingSafeEqual(secretBuf, providedBuf);
      if (!valid) {
        throw new UnauthorizedException('Invalid webhook secret');
      }
    }

    // Only process incoming transfers
    if (payload.transferType !== 1) {
      return { success: true, message: 'Ignored: outgoing transfer' };
    }

    // Find payment by code in transfer content
    const code = payload.code || '';
    const content = payload.content || payload.description || '';
    const matched = content.match(/LMS[A-Z0-9]{14}/)?.[0] || code.match(/LMS[A-Z0-9]{14}/)?.[0];

    if (!matched) {
      this.logger.warn(`Webhook: no payment code found in content: "${content}"`);
      return { success: true, message: 'No matching payment code' };
    }

    const payment = await this.prisma.payment.findFirst({
      where: { paymentCode: matched, status: 'pending' },
      include: { course: { select: { title: true } } },
    });

    if (!payment) {
      // Already processed or not found — idempotent
      return { success: true, message: 'Payment not found or already processed' };
    }

    if (payment.expiresAt && payment.expiresAt < new Date()) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'expired' },
      });
      return { success: false, message: 'Payment expired' };
    }

    if (new Prisma.Decimal(payload.transferAmount).lessThan(payment.amount)) {
      this.logger.warn(`Amount mismatch: expected ${payment.amount}, got ${payload.transferAmount}`);
      return { success: false, message: 'Amount mismatch' };
    }

    // Complete payment + create enrollment atomically
    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'completed',
          transactionId: String(payload.id),
          completedAt: new Date(),
          webhookData: payload as any,
        },
      });

      // Upsert enrollment (idempotent)
      await tx.enrollment.upsert({
        where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
        create: { userId: payment.userId, courseId: payment.courseId },
        update: {},
      });
    });

    this.logger.log(`Payment ${payment.id} completed — user ${payment.userId} enrolled in ${payment.courseId}`);
    return { success: true, message: 'Payment completed and enrollment created' };
  }

  async getPaymentStatus(paymentId: string, userId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, userId },
      include: { course: { select: { title: true, slug: true } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return this.formatPayment(payment, payment.course.slug);
  }

  async getUserPayments(userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      include: { course: { select: { title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return payments.map(p => this.formatPayment(p, p.course.slug));
  }

  async expireOldPayments() {
    const result = await this.prisma.payment.updateMany({
      where: { status: 'pending', expiresAt: { lt: new Date() } },
      data: { status: 'expired' },
    });
    if (result.count > 0) this.logger.log(`Expired ${result.count} pending payments`);
  }

  private formatPayment(payment: any, courseSlug: string) {
    return {
      id: payment.id,
      courseId: payment.courseId,
      courseTitle: payment.course?.title,
      courseSlug,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      paymentCode: payment.paymentCode,
      qrCodeUrl: payment.qrCodeUrl,
      expiresAt: payment.expiresAt,
      completedAt: payment.completedAt,
      createdAt: payment.createdAt,
    };
  }
}
