import { Injectable, ExecutionContext } from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase-auth.guard';

@Injectable()
export class JwtAuthGuard extends SupabaseAuthGuard {}
