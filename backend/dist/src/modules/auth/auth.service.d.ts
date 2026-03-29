import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SupabaseService } from '../../common/supabase.service';
import { JwtService } from '@nestjs/jwt';
import { SettingsService } from '../settings/settings.service';
export declare class AuthService {
    private supabase;
    private jwtService;
    private configService;
    private settingsService;
    private eventEmitter;
    constructor(supabase: SupabaseService, jwtService: JwtService, configService: ConfigService, settingsService: SettingsService, eventEmitter: EventEmitter2);
    register(email: string, password: string, fullName?: string): Promise<{
        requiresVerification: boolean;
        message: string;
        user?: undefined;
        session?: undefined;
    } | {
        user: import("@supabase/auth-js").User;
        session: {
            access_token: string;
            token_type: string;
            expires_in: number;
            refresh_token: string;
            user: import("@supabase/auth-js").User;
        };
        requiresVerification?: undefined;
        message?: undefined;
    }>;
    login(email: string, password: string): Promise<{
        user: import("@supabase/auth-js").User;
        session: import("@supabase/auth-js").Session;
    }>;
    logout(token: string): Promise<{
        success: boolean;
    }>;
    refreshToken(refreshToken: string): Promise<{
        user: import("@supabase/auth-js").User | null;
        session: import("@supabase/auth-js").Session | null;
    }>;
    getProfile(userId: string): Promise<any>;
    updateProfile(userId: string, updateData: {
        full_name?: string;
        bio?: string;
        phone?: string;
    }): Promise<any>;
    forgotPassword(email: string): Promise<{
        success: boolean;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        user: import("@supabase/auth-js").User;
    }>;
    generateTokens(userId: string, email: string): {
        access_token: string;
        refresh_token: string;
    };
}
