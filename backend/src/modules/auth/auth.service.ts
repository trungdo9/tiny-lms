import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SupabaseService } from '../../common/supabase.service';
import { JwtService } from '@nestjs/jwt';
import { SettingsService } from '../settings/settings.service';
import { CONTACT_SYNC_EVENTS } from '../contact-sync/contact-sync.events';

@Injectable()
export class AuthService {
  constructor(
    private supabase: SupabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private settingsService: SettingsService,
    private eventEmitter: EventEmitter2,
  ) {}

  async register(email: string, password: string, fullName?: string) {
    // Check if email verification is required
    const requireVerification = await this.settingsService
      .get('auth.require_email_verification')
      .then(s => s?.value === true)
      .catch(() => false);

    const { data, error } = await this.supabase.adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: !requireVerification,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    // Create profile record
    if (data.user) {
      const { error: profileError } = await this.supabase.adminClient.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      } else {
        this.eventEmitter.emit(CONTACT_SYNC_EVENTS.USER_REGISTERED, { userId: data.user.id });
      }
    }

    if (requireVerification) {
      return {
        requiresVerification: true,
        message: 'Please check your email to verify your account.',
      };
    }

    // Generate JWT for the user
    const token = this.jwtService.sign({ sub: data.user?.id, email });

    return {
      user: data.user,
      session: {
        access_token: token,
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: '',
        user: data.user,
      },
    };
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  async logout(token: string) {
    const { error } = await this.supabase.client.auth.signOut();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { success: true };
  }

  async refreshToken(refreshToken: string) {
    const { data, error } = await this.supabase.client.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  async getProfile(userId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async updateProfile(userId: string, updateData: { full_name?: string; bio?: string; phone?: string }) {
    const { data, error } = await this.supabase.adminClient
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async forgotPassword(email: string) {
    const { error } = await this.supabase.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password`,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { success: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const { data, error } = await this.supabase.client.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { user: data.user };
  }

  generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}
