"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailLogsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
let EmailLogsService = class EmailLogsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(params) {
        const { page = 1, limit = 20, status, templateSlug } = params;
        const where = {};
        if (status)
            where.status = status;
        if (templateSlug)
            where.templateSlug = templateSlug;
        const [logs, total] = await Promise.all([
            this.prisma.emailLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.emailLog.count({ where }),
        ]);
        return {
            data: logs,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async create(data) {
        return this.prisma.emailLog.create({
            data: {
                templateSlug: data.templateSlug,
                to: data.to,
                subject: data.subject,
                body: data.body,
                status: data.status || 'pending',
                errorMessage: data.errorMessage,
                messageId: data.messageId,
            },
        });
    }
    async markAsSent(id, messageId) {
        return this.prisma.emailLog.update({
            where: { id },
            data: {
                status: 'sent',
                messageId,
                sentAt: new Date(),
            },
        });
    }
    async markAsFailed(id, errorMessage) {
        return this.prisma.emailLog.update({
            where: { id },
            data: {
                status: 'failed',
                errorMessage,
            },
        });
    }
    async getStats() {
        const [total, sent, failed, pending] = await Promise.all([
            this.prisma.emailLog.count(),
            this.prisma.emailLog.count({ where: { status: 'sent' } }),
            this.prisma.emailLog.count({ where: { status: 'failed' } }),
            this.prisma.emailLog.count({ where: { status: 'pending' } }),
        ]);
        return { total, sent, failed, pending };
    }
};
exports.EmailLogsService = EmailLogsService;
exports.EmailLogsService = EmailLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmailLogsService);
//# sourceMappingURL=email-logs.service.js.map