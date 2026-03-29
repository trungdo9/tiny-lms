import { Module, Global } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { SupabaseService } from '../../common/supabase.service';

@Global()
@Module({
  providers: [SupabaseAuthGuard, SupabaseService],
  exports: [SupabaseAuthGuard, SupabaseService],
})
export class SharedModule {}
