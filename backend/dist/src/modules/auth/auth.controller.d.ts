import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(body: RegisterDto): Promise<{
        user: import("@supabase/auth-js").User | undefined;
        access_token: string | undefined;
        refresh_token: string | undefined;
    }>;
    login(body: LoginDto): Promise<{
        user: import("@supabase/auth-js").User;
        access_token: string;
        refresh_token: string;
    }>;
    logout(req: any): Promise<{
        success: boolean;
    }>;
    refresh(body: RefreshTokenDto): Promise<{
        user: import("@supabase/auth-js").User | null;
        access_token: string | undefined;
        refresh_token: string | undefined;
    }>;
    me(req: any): Promise<any>;
    forgotPassword(body: ForgotPasswordDto): Promise<{
        success: boolean;
    }>;
    resetPassword(body: ResetPasswordDto): Promise<{
        user: import("@supabase/auth-js").User;
    }>;
}
