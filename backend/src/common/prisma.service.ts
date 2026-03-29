import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { decorateDatabaseConnectionError, getDatabaseUrl } from './database-url';

// Allow self-signed certificates for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly connectionUrl: string;

  constructor() {
    const connectionUrl = getDatabaseUrl();
    const pool = new Pool({
      connectionString: connectionUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.connectionUrl = connectionUrl;
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      throw decorateDatabaseConnectionError(error, this.connectionUrl);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
