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
var EmailsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailsService = void 0;
const common_1 = require("@nestjs/common");
const settings_service_1 = require("../settings/settings.service");
const email_templates_service_1 = require("./templates/email-templates.service");
const email_logs_service_1 = require("./logs/email-logs.service");
const smtp_provider_1 = require("./providers/smtp.provider");
const resend_provider_1 = require("./providers/resend.provider");
let EmailsService = EmailsService_1 = class EmailsService {
    settingsService;
    templatesService;
    logsService;
    logger = new common_1.Logger(EmailsService_1.name);
    constructor(settingsService, templatesService, logsService) {
        this.settingsService = settingsService;
        this.templatesService = templatesService;
        this.logsService = logsService;
    }
    async getProvider() {
        const providerType = await this.settingsService.get('email_provider');
        const value = providerType?.value;
        if (value === 'resend') {
            const apiKey = await this.settingsService.get('resend_api_key');
            const fromName = await this.settingsService.get('email_from_name');
            const fromEmail = await this.settingsService.get('email_from_email');
            const config = {
                apiKey: apiKey?.value,
                fromName: fromName?.value || 'Tiny LMS',
                fromEmail: fromEmail?.value || 'noreply@tinylms.com',
            };
            this.logger.log('Using Resend email provider');
            return new resend_provider_1.ResendProvider(config);
        }
        else {
            const smtpHost = await this.settingsService.get('email_smtp_host');
            const smtpPort = await this.settingsService.get('email_smtp_port');
            const smtpUser = await this.settingsService.get('email_smtp_user');
            const smtpPass = await this.settingsService.get('email_smtp_pass');
            const smtpSecure = await this.settingsService.get('email_smtp_secure');
            const fromName = await this.settingsService.get('email_from_name');
            const fromEmail = await this.settingsService.get('email_from_email');
            const config = {
                host: smtpHost?.value || 'smtp.gmail.com',
                port: Number(smtpPort?.value) || 587,
                user: smtpUser?.value || '',
                pass: smtpPass?.value || '',
                secure: smtpSecure?.value === 'true' || smtpSecure?.value === true,
                fromName: fromName?.value || 'Tiny LMS',
                fromEmail: fromEmail?.value || 'noreply@tinylms.com',
            };
            this.logger.log('Using SMTP email provider');
            return new smtp_provider_1.SmtpProvider(config);
        }
    }
    async send(options) {
        try {
            const provider = await this.getProvider();
            const result = await provider.send(options);
            if (result.success) {
                this.logger.log(`Email sent successfully to ${options.to}`);
            }
            else {
                this.logger.error(`Failed to send email: ${result.error}`);
            }
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Email send error: ${errorMessage}`);
            return { success: false, error: errorMessage };
        }
    }
    async sendWithTemplate(templateSlug, to, variables) {
        try {
            const template = await this.templatesService.findBySlug(templateSlug);
            const { subject, body } = this.templatesService.render({ subject: template.subject, body: template.body }, variables);
            const siteName = await this.settingsService.get('site_name');
            const siteUrl = await this.settingsService.get('site_url');
            const footerText = await this.settingsService.get('brand_footer_text');
            const enrichedVars = {
                site_name: siteName?.value || 'Tiny LMS',
                site_url: siteUrl?.value || '',
                footer_text: footerText?.value || '',
                ...variables,
            };
            const finalRendered = this.templatesService.render({ subject: template.subject, body: template.body }, enrichedVars);
            const log = await this.logsService.create({
                templateSlug,
                to: Array.isArray(to) ? to.join(', ') : to,
                subject: finalRendered.subject,
                body: finalRendered.body,
                status: 'pending',
            });
            const result = await this.send({
                to,
                subject: finalRendered.subject,
                html: finalRendered.body,
            });
            if (result.success) {
                await this.logsService.markAsSent(log.id, result.messageId || '');
            }
            else {
                await this.logsService.markAsFailed(log.id, result.error || 'Unknown error');
            }
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Failed to send email with template: ${errorMessage}`);
            return { success: false, error: errorMessage };
        }
    }
};
exports.EmailsService = EmailsService;
exports.EmailsService = EmailsService = EmailsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [settings_service_1.SettingsService,
        email_templates_service_1.EmailTemplatesService,
        email_logs_service_1.EmailLogsService])
], EmailsService);
//# sourceMappingURL=emails.service.js.map