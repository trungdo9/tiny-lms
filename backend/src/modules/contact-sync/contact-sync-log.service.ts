import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

export interface ContactSyncLogDto {
  userId?: string;
  email: string;
  provider: string;
  operation: string;
  trigger: string;
  status?: string;
  errorMessage?: string;
  payload?: any;
  externalId?: string;
}

@Injectable()
export class ContactSyncLogService {
  constructor(private prisma: PrismaService) {}

  async create(data: ContactSyncLogDto) {
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

  async markSuccess(id: string, externalId?: string) {
    return this.prisma.contactSyncLog.update({
      where: { id },
      data: { status: 'success', externalId },
    });
  }

  async markFailed(id: string, errorMessage: string) {
    return this.prisma.contactSyncLog.update({
      where: { id },
      data: { status: 'failed', errorMessage },
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    status?: string;
    provider?: string;
    trigger?: string;
  }) {
    const { page = 1, limit = 20, status, provider, trigger } = params;

    const where: any = {};
    if (status) where.status = status;
    if (provider) where.provider = provider;
    if (trigger) where.trigger = trigger;

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
}
