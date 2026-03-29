import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { SepayWebhookDto } from './dto/webhook.dto';
export declare class PaymentsService {
    private prisma;
    private config;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService);
    createPayment(userId: string, courseId: string): Promise<{
        id: any;
        courseId: any;
        courseTitle: any;
        courseSlug: string;
        amount: number;
        currency: any;
        status: any;
        paymentCode: any;
        qrCodeUrl: any;
        expiresAt: any;
        completedAt: any;
        createdAt: any;
    }>;
    processWebhook(payload: SepayWebhookDto, authHeader?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getPaymentStatus(paymentId: string, userId: string): Promise<{
        id: any;
        courseId: any;
        courseTitle: any;
        courseSlug: string;
        amount: number;
        currency: any;
        status: any;
        paymentCode: any;
        qrCodeUrl: any;
        expiresAt: any;
        completedAt: any;
        createdAt: any;
    }>;
    getUserPayments(userId: string): Promise<{
        id: any;
        courseId: any;
        courseTitle: any;
        courseSlug: string;
        amount: number;
        currency: any;
        status: any;
        paymentCode: any;
        qrCodeUrl: any;
        expiresAt: any;
        completedAt: any;
        createdAt: any;
    }[]>;
    expireOldPayments(): Promise<void>;
    private formatPayment;
}
