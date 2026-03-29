import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SepayWebhookDto } from './dto/webhook.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createPayment(dto: CreatePaymentDto, req: any): Promise<{
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
    handleWebhook(payload: SepayWebhookDto, auth: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getMyPayments(req: any): Promise<{
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
    getStatus(id: string, req: any): Promise<{
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
}
