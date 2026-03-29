"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../common/prisma.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    prisma;
    config;
    logger = new common_1.Logger(PaymentsService_1.name);
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async createPayment(userId, courseId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true, title: true, slug: true, isFree: true, price: true, status: true },
        });
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        if (course.status !== 'published')
            throw new common_1.BadRequestException('Course is not published');
        if (course.isFree)
            throw new common_1.BadRequestException('Course is free — use enrollment endpoint');
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });
        if (enrollment)
            throw new common_1.BadRequestException('Already enrolled in this course');
        const amount = Number(course.price);
        const timeoutMins = this.config.get('app.sepay.paymentTimeoutMinutes') || 15;
        const expiresAt = new Date(Date.now() + timeoutMins * 60 * 1000);
        const bankAccount = this.config.get('app.sepay.bankAccount');
        const bankId = this.config.get('app.sepay.bankId');
        const payment = await this.prisma.$transaction(async (tx) => {
            const existing = await tx.payment.findUnique({
                where: { userId_courseId: { userId, courseId } },
                include: { course: { select: { title: true } } },
            });
            if (existing) {
                if (existing.status === 'completed') {
                    throw new common_1.BadRequestException('Already paid for this course');
                }
                if (existing.status === 'pending' && existing.expiresAt && existing.expiresAt > new Date()) {
                    return existing;
                }
                await tx.payment.delete({ where: { id: existing.id } });
            }
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
    async processWebhook(payload, authHeader) {
        const secret = this.config.get('app.sepay.webhookSecret');
        if (secret) {
            const provided = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
            const secretBuf = Buffer.from(secret);
            const providedBuf = Buffer.from(provided);
            const valid = secretBuf.length === providedBuf.length &&
                crypto.timingSafeEqual(secretBuf, providedBuf);
            if (!valid) {
                throw new common_1.UnauthorizedException('Invalid webhook secret');
            }
        }
        if (payload.transferType !== 1) {
            return { success: true, message: 'Ignored: outgoing transfer' };
        }
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
            return { success: true, message: 'Payment not found or already processed' };
        }
        if (payment.expiresAt && payment.expiresAt < new Date()) {
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'expired' },
            });
            return { success: false, message: 'Payment expired' };
        }
        if (new client_1.Prisma.Decimal(payload.transferAmount).lessThan(payment.amount)) {
            this.logger.warn(`Amount mismatch: expected ${payment.amount}, got ${payload.transferAmount}`);
            return { success: false, message: 'Amount mismatch' };
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'completed',
                    transactionId: String(payload.id),
                    completedAt: new Date(),
                    webhookData: payload,
                },
            });
            await tx.enrollment.upsert({
                where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
                create: { userId: payment.userId, courseId: payment.courseId },
                update: {},
            });
        });
        this.logger.log(`Payment ${payment.id} completed — user ${payment.userId} enrolled in ${payment.courseId}`);
        return { success: true, message: 'Payment completed and enrollment created' };
    }
    async getPaymentStatus(paymentId, userId) {
        const payment = await this.prisma.payment.findFirst({
            where: { id: paymentId, userId },
            include: { course: { select: { title: true, slug: true } } },
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        return this.formatPayment(payment, payment.course.slug);
    }
    async getUserPayments(userId) {
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
        if (result.count > 0)
            this.logger.log(`Expired ${result.count} pending payments`);
    }
    formatPayment(payment, courseSlug) {
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map