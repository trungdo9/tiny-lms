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
exports.ContactSyncLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let ContactSyncLogService = class ContactSyncLogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.contactSyncLog.create({
            data: {
                userId: data.userId,
                email: data.email,
                provider: data.provider,
                operation: data.operation,
                trigger: data.trigger,
                status: data.status || 'pending',
                payload: data.payload,
            },
        });
    }
    async markSuccess(id, externalId) {
        return this.prisma.contactSyncLog.update({
            where: { id },
            data: { status: 'success', externalId },
        });
    }
    async markFailed(id, errorMessage) {
        return this.prisma.contactSyncLog.update({
            where: { id },
            data: { status: 'failed', errorMessage },
        });
    }
    async findAll(params) {
        const { page = 1, limit = 20, status, provider, trigger } = params;
        const where = {};
        if (status)
            where.status = status;
        if (provider)
            where.provider = provider;
        if (trigger)
            where.trigger = trigger;
        const [data, total] = await Promise.all([
            this.prisma.contactSyncLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.contactSyncLog.count({ where }),
        ]);
        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async getStats() {
        const [total, success, failed, pending] = await Promise.all([
            this.prisma.contactSyncLog.count(),
            this.prisma.contactSyncLog.count({ where: { status: 'success' } }),
            this.prisma.contactSyncLog.count({ where: { status: 'failed' } }),
            this.prisma.contactSyncLog.count({ where: { status: 'pending' } }),
        ]);
        return { total, success, failed, pending };
    }
};
exports.ContactSyncLogService = ContactSyncLogService;
exports.ContactSyncLogService = ContactSyncLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContactSyncLogService);
//# sourceMappingURL=contact-sync-log.service.js.map