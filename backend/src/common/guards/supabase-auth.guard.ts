import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { SupabaseService } from '../supabase.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = jwt.decode(token) as any;

      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Fetch role from database to ensure it's up to date
      try {
        const { data: profile } = await this.supabase.adminClient
          .from('profiles')
          .select('role')
          .eq('id', payload.sub)
          .single();

        const userRole = profile?.role || 'student';

        // Attach user to request
        request.user = {
          id: payload.sub,
          email: payload.email,
          role: userRole,
        };
      } catch {
        // Fallback to JWT role if database query fails
        request.user = {
          id: payload.sub,
          email: payload.email,
          role: payload.role || 'student',
        };
      }

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
