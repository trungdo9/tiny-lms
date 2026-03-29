import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  client: SupabaseClient;
  adminClient: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('app.supabase.url') || '';
    const anonKey = this.configService.get<string>('app.supabase.anonKey') || '';
    const serviceKey = this.configService.get<string>('app.supabase.serviceRoleKey') || '';

    this.client = createClient(url, anonKey);
    this.adminClient = createClient(url, serviceKey);
  }
}
