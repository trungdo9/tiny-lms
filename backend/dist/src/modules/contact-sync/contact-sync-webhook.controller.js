"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ContactSyncWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactSyncWebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const crypto = __importStar(require("crypto"));
const settings_service_1 = require("../settings/settings.service");
const contact_sync_log_service_1 = require("./contact-sync-log.service");
let ContactSyncWebhookController = ContactSyncWebhookController_1 = class ContactSyncWebhookController {
    settingsService;
    logService;
    logger = new common_1.Logger(ContactSyncWebhookController_1.name);
    constructor(settingsService, logService) {
        this.settingsService = settingsService;
        this.logService = logService;
    }
    verifyMailchimp() {
        return 'OK';
    }
    async handleMailchimp(body, secret) {
        const storedSecret = await this.settingsService.get('mailchimp_webhook_secret');
        if (!storedSecret?.value || storedSecret.value !== secret) {
            this.logger.warn('Mailchimp webhook: invalid secret');
            return;
        }
        const type = body?.type;
        const email = body?.data?.email || body?.data?.merges?.EMAIL;
        if (!email) {
            this.logger.warn('Mailchimp webhook: no email in payload');
            return;
        }
        if (type === 'unsubscribe' || type === 'cleaned') {
            await this.logService.create({
                email,
                provider: 'mailchimp',
                operation: 'webhook_event',
                trigger: 'webhook',
                status: 'success',
                payload: { type, reason: body?.data?.reason },
            });
            this.logger.log(`Mailchimp webhook: ${type} for ${email}`);
        }
    }
    async handleBrevo(body, signature) {
        const storedSecret = await this.settingsService.get('brevo_webhook_secret');
        if (storedSecret?.value && signature) {
            const expectedSignature = crypto
                .createHmac('sha256', storedSecret.value)
                .update(JSON.stringify(body))
                .digest('hex');
            try {
                const sigBuf = Buffer.from(signature, 'hex');
                const expBuf = Buffer.from(expectedSignature, 'hex');
                if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
                    this.logger.warn('Brevo webhook: invalid signature');
                    return;
                }
            }
            catch {
                this.logger.warn('Brevo webhook: invalid signature format');
                return;
            }
        }
        else if (storedSecret?.value && !signature) {
            this.logger.warn('Brevo webhook: missing signature');
            return;
        }
        const event = body?.event;
        const email = body?.email;
        if (!email) {
            this.logger.warn('Brevo webhook: no email in payload');
            return;
        }
        if (event === 'unsubscribed' || event === 'hard_bounce') {
            await this.logService.create({
                email,
                provider: 'brevo',
                operation: 'webhook_event',
                trigger: 'webhook',
                status: 'success',
                payload: { event, reason: body?.reason },
            });
            this.logger.log(`Brevo webhook: ${event} for ${email}`);
        }
    }
};
exports.ContactSyncWebhookController = ContactSyncWebhookController;
__decorate([
    (0, common_1.Get)('mailchimp'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], ContactSyncWebhookController.prototype, "verifyMailchimp", null);
__decorate([
    (0, common_1.Post)('mailchimp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ContactSyncWebhookController.prototype, "handleMailchimp", null);
__decorate([
    (0, common_1.Post)('brevo'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-sib-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ContactSyncWebhookController.prototype, "handleBrevo", null);
exports.ContactSyncWebhookController = ContactSyncWebhookController = ContactSyncWebhookController_1 = __decorate([
    (0, swagger_1.ApiTags)('contact-sync'),
    (0, common_1.Controller)('contact-sync/webhooks'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService,
        contact_sync_log_service_1.ContactSyncLogService])
], ContactSyncWebhookController);
//# sourceMappingURL=contact-sync-webhook.controller.js.map