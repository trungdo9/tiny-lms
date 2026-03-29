import { registerAs } from '@nestjs/config';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env file before reading process.env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

export default registerAs('app', () => ({
  port: process.env.PORT || 3001,
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: '15m',
    refreshExpiresIn: '7d',
  },
  sepay: {
    bankAccount: process.env.SEPAY_BANK_ACCOUNT || '',
    bankId: process.env.SEPAY_BANK_ID || '',
    webhookSecret: process.env.SEPAY_WEBHOOK_SECRET || '',
    paymentTimeoutMinutes: parseInt(process.env.SEPAY_PAYMENT_TIMEOUT_MINUTES || '15'),
  },
}));
