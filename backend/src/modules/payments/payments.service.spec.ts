import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../common/prisma.service';
import { createMockPrismaService, MockPrismaService } from '../../../test/helpers/mock-prisma';
import { buildCourse, buildPayment } from '../../../test/helpers/mock-factories';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: MockPrismaService;
  let configService: { get: jest.Mock };

  const userId = 'user-1';
  const courseId = 'course-1';

  beforeEach(async () => {
    prisma = createMockPrismaService();
    configService = {
      get: jest.fn((key: string) => {
        const map: Record<string, any> = {
          'app.sepay.paymentTimeoutMinutes': 15,
          'app.sepay.bankAccount': '123456',
          'app.sepay.bankId': 'VNBANK',
          'app.sepay.webhookSecret': 'test-secret',
        };
        return map[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('createPayment', () => {
    it('should throw NotFoundException if course not found', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      await expect(service.createPayment(userId, courseId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for unpublished course', async () => {
      prisma.course.findUnique.mockResolvedValue(
        buildCourse({ id: courseId, status: 'draft', isFree: false, price: new Prisma.Decimal(100000) }),
      );
      await expect(service.createPayment(userId, courseId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for free course', async () => {
      prisma.course.findUnique.mockResolvedValue(
        buildCourse({ id: courseId, status: 'published', isFree: true, price: new Prisma.Decimal(0) }),
      );
      await expect(service.createPayment(userId, courseId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if already enrolled', async () => {
      prisma.course.findUnique.mockResolvedValue(
        buildCourse({ id: courseId, status: 'published', isFree: false, price: new Prisma.Decimal(100000) }),
      );
      prisma.enrollment.findUnique.mockResolvedValue({ id: 'e1' });

      await expect(service.createPayment(userId, courseId)).rejects.toThrow(BadRequestException);
    });

    it('should create new payment when no existing', async () => {
      const course = buildCourse({
        id: courseId,
        slug: 'test-course',
        status: 'published',
        isFree: false,
        price: new Prisma.Decimal(100000),
      });
      prisma.course.findUnique.mockResolvedValue(course);
      prisma.enrollment.findUnique.mockResolvedValue(null);

      // Mock transaction - the callback receives 'tx' which is the mock prisma itself
      const payment = buildPayment({ userId, courseId, course: { title: 'Test Course' } });
      prisma.payment.findUnique.mockResolvedValue(null); // no existing
      prisma.payment.create.mockResolvedValue(payment);

      const result = await service.createPayment(userId, courseId);

      expect(result).toHaveProperty('paymentCode');
      expect(result).toHaveProperty('amount');
    });
  });

  describe('processWebhook', () => {
    const webhookPayload = {
      id: 12345,
      transferType: 1,
      transferAmount: 100000,
      content: 'LMS12345678ABCDEF12',
      code: '',
      description: '',
    };

    it('should reject invalid webhook secret', async () => {
      await expect(
        service.processWebhook(webhookPayload as any, 'Bearer wrong-secret'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should ignore outgoing transfers', async () => {
      const result = await service.processWebhook(
        { ...webhookPayload, transferType: 2 } as any,
        'Bearer test-secret',
      );

      expect(result.message).toBe('Ignored: outgoing transfer');
    });

    it('should return success when no matching payment code', async () => {
      const result = await service.processWebhook(
        { ...webhookPayload, content: 'no match here' } as any,
        'Bearer test-secret',
      );

      expect(result.message).toBe('No matching payment code');
    });

    it('should complete payment and create enrollment', async () => {
      const payment = buildPayment({
        id: 'pay-1',
        userId,
        courseId,
        paymentCode: 'LMS12345678ABCDEF12',
        amount: new Prisma.Decimal(100000),
        expiresAt: new Date(Date.now() + 600000),
        course: { title: 'Test' },
      });

      prisma.payment.findFirst.mockResolvedValue(payment);
      prisma.payment.update.mockResolvedValue({});
      prisma.enrollment.upsert.mockResolvedValue({});

      const result = await service.processWebhook(webhookPayload as any, 'Bearer test-secret');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Payment completed and enrollment created');
    });

    it('should mark expired payment', async () => {
      const payment = buildPayment({
        paymentCode: 'LMS12345678ABCDEF12',
        amount: new Prisma.Decimal(100000),
        expiresAt: new Date(Date.now() - 600000), // already expired
      });

      prisma.payment.findFirst.mockResolvedValue(payment);
      prisma.payment.update.mockResolvedValue({});

      const result = await service.processWebhook(webhookPayload as any, 'Bearer test-secret');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Payment expired');
    });

    it('should reject amount mismatch', async () => {
      const payment = buildPayment({
        paymentCode: 'LMS12345678ABCDEF12',
        amount: new Prisma.Decimal(200000), // expects 200k
        expiresAt: new Date(Date.now() + 600000),
      });

      prisma.payment.findFirst.mockResolvedValue(payment);

      const result = await service.processWebhook(webhookPayload as any, 'Bearer test-secret');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Amount mismatch');
    });
  });

  describe('getPaymentStatus', () => {
    it('should return formatted payment for owner', async () => {
      const payment = buildPayment({
        id: 'pay-1',
        userId,
        course: { title: 'Test', slug: 'test' },
      });
      prisma.payment.findFirst.mockResolvedValue(payment);

      const result = await service.getPaymentStatus('pay-1', userId);

      expect(result).toHaveProperty('courseSlug', 'test');
    });

    it('should throw NotFoundException for wrong user', async () => {
      prisma.payment.findFirst.mockResolvedValue(null);
      await expect(service.getPaymentStatus('pay-1', userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserPayments', () => {
    it('should return formatted list of user payments', async () => {
      prisma.payment.findMany.mockResolvedValue([
        buildPayment({ userId, course: { title: 'Course 1', slug: 'c1' } }),
        buildPayment({ userId, course: { title: 'Course 2', slug: 'c2' } }),
      ]);

      const result = await service.getUserPayments(userId);

      expect(result).toHaveLength(2);
    });
  });

  describe('expireOldPayments', () => {
    it('should update pending payments past expiry', async () => {
      prisma.payment.updateMany.mockResolvedValue({ count: 3 });

      await service.expireOldPayments();

      expect(prisma.payment.updateMany).toHaveBeenCalledWith({
        where: { status: 'pending', expiresAt: { lt: expect.any(Date) } },
        data: { status: 'expired' },
      });
    });
  });
});
