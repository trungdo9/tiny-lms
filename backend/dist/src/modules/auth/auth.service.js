"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const supabase_service_1 = require("../../common/supabase.service");
const jwt_1 = require("@nestjs/jwt");
const settings_service_1 = require("../settings/settings.service");
const contact_sync_events_1 = require("../contact-sync/contact-sync.events");
let AuthService = class AuthService {
    supabase;
    jwtService;
    configService;
    settingsService;
    eventEmitter;
    constructor(supabase, jwtService, configService, settingsService, eventEmitter) {
        this.supabase = supabase;
        this.jwtService = jwtService;
        this.configService = configService;
        this.settingsService = settingsService;
        this.eventEmitter = eventEmitter;
    }
    async register(email, password, fullName) {
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
            throw new common_1.BadRequestException(error.message);
        }
        if (data.user) {
            const { error: profileError } = await this.supabase.adminClient.from('profiles').insert({
                id: data.user.id,
                full_name: fullName,
            });
            if (profileError) {
                console.error('Profile creation error:', profileError);
            }
            else {
                this.eventEmitter.emit(contact_sync_events_1.CONTACT_SYNC_EVENTS.USER_REGISTERED, { userId: data.user.id });
            }
        }
        if (requireVerification) {
            return {
                requiresVerification: true,
                message: 'Please check your email to verify your account.',
            };
        }
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
    async login(email, password) {
        const { data, error } = await this.supabase.client.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            throw new common_1.UnauthorizedException(error.message);
        }
        return {
            user: data.user,
            session: data.session,
        };
    }
    async logout(token) {
        const { error } = await this.supabase.client.auth.signOut();
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return { success: true };
    }
    async refreshToken(refreshToken) {
        const { data, error } = await this.supabase.client.auth.refreshSession({
            refresh_token: refreshToken,
        });
        if (error) {
            throw new common_1.UnauthorizedException(error.message);
        }
        return {
            user: data.user,
            session: data.session,
        };
    }
    async getProfile(userId) {
        const { data, error } = await this.supabase.adminClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return data;
    }
    async updateProfile(userId, updateData) {
        const { data, error } = await this.supabase.adminClient
            .from('profiles')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return data;
    }
    async forgotPassword(email) {
        const { error } = await this.supabase.client.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password`,
        });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return { success: true };
    }
    async resetPassword(token, newPassword) {
        const { data, error } = await this.supabase.client.auth.updateUser({
            password: newPassword,
        });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return { user: data.user };
    }
    generateTokens(userId, email) {
        const payload = { sub: userId, email };
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        jwt_1.JwtService,
        config_1.ConfigService,
        settings_service_1.SettingsService,
        event_emitter_1.EventEmitter2])
], AuthService);
//# sourceMappingURL=auth.service.js.map