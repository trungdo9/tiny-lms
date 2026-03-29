import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

export interface EmailLogDto {
  templateSlug?: string;
  to: string;
  subject: string;
  body?: string;
  status?: 'pending' | 'sent' | 'failed';
  errorMessage?: string;
  messageId?: string;
}

@Injectable()
export class EmailLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    status?: string;
    templateSlug?: string;
  }) {
    const { page = 1, limit = 20, status, templateSlug } = params;

    const where: any = {};
    if (status) where.status = status;
    if (templateSlug) where.templateSlug = templateSlug;

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

  async create(data: EmailLogDto) {
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

  async markAsSent(id: string, messageId: string) {
    return this.prisma.emailLog.update({
      where: { id },
      data: {
        status: 'sent',
        messageId,
        sentAt: new Date(),
      },
    });
  }

  async markAsFailed(id: string, errorMessage: string) {
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
}
