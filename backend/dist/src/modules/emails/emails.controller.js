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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailsController = void 0;
const common_1 = require("@nestjs/common");
const emails_service_1 = require("./emails.service");
const email_templates_service_1 = require("./templates/email-templates.service");
const email_logs_service_1 = require("./logs/email-logs.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const settings_service_1 = require("../settings/settings.service");
let EmailsController = class EmailsController {
    emailsService;
    templatesService;
    logsService;
    settingsService;
    constructor(emailsService, templatesService, logsService, settingsService) {
        this.emailsService = emailsService;
        this.templatesService = templatesService;
        this.logsService = logsService;
        this.settingsService = settingsService;
    }
    getTemplates() {
        return this.templatesService.findAll();
    }
    getTemplate(slug) {
        return this.templatesService.findBySlug(slug);
    }
    createTemplate(body) {
        return this.templatesService.create(body);
    }
    updateTemplate(slug, body) {
        return this.templatesService.update(slug, body);
    }
    deleteTemplate(slug) {
        return this.templatesService.delete(slug);
    }
    seedTemplates() {
        return this.templatesService.seedDefaults();
    }
    getLogs(page, limit, status, templateSlug) {
        return this.logsService.findAll({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
            status,
            templateSlug,
        });
    }
    getLogStats() {
        return this.logsService.getStats();
    }
    async previewTemplate(slug, body) {
        const template = await this.templatesService.findBySlug(slug);
        const siteName = await this.settingsService.get('site_name');
        const siteUrl = await this.settingsService.get('site_url');
        const footerText = await this.settingsService.get('brand_footer_text');
        const vars = {
            site_name: siteName?.value || 'Tiny LMS',
            site_url: siteUrl?.value || 'http://localhost:3000',
            footer_text: footerText?.value || '',
            ...body.variables,
        };
        return this.templatesService.render(template, vars);
    }
    async duplicateTemplate(slug) {
        const original = await this.templatesService.findBySlug(slug);
        const newSlug = `${slug}-copy-${Date.now()}`;
        return this.templatesService.create({
            slug: newSlug,
            name: `${original.name} (Copy)`,
            subject: original.subject,
            body: original.body,
            isActive: false,
        });
    }
    async sendTestWithTemplate(slug, body) {
        const template = await this.templatesService.findBySlug(slug);
        const siteName = await this.settingsService.get('site_name');
        const siteUrl = await this.settingsService.get('site_url');
        const footerText = await this.settingsService.get('brand_footer_text');
        const vars = {
            site_name: siteName?.value || 'Tiny LMS',
            site_url: siteUrl?.value || 'http://localhost:3000',
            footer_text: footerText?.value || '',
            user_name: 'Test User',
            ...body.variables,
        };
        const rendered = this.templatesService.render(template, vars);
        const result = await this.emailsService.send({
            to: body.to,
            subject: rendered.subject,
            html: rendered.body,
        });
        await this.logsService.create({
            templateSlug: slug,
            to: body.to,
            subject: rendered.subject,
            body: rendered.body,
            status: result.success ? 'sent' : 'failed',
            errorMessage: result.error,
            messageId: result.messageId,
        });
        return result;
    }
    async sendTestEmail(body) {
        const siteName = await this.settingsService.get('site_name');
        const siteUrl = await this.settingsService.get('site_url');
        const footerText = await this.settingsService.get('brand_footer_text');
        const result = await this.emailsService.send({
            to: body.to,
            subject: 'Test Email from Tiny LMS',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Test Email</h1>
          <p>This is a test email from ${siteName?.value || 'Tiny LMS'}.</p>
          <p>If you received this, your email configuration is working correctly!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            ${footerText?.value || ''}
          </p>
        </div>
      `,
        });
        await this.logsService.create({
            to: body.to,
            subject: 'Test Email from Tiny LMS',
            status: result.success ? 'sent' : 'failed',
            errorMessage: result.error,
            messageId: result.messageId,
        });
        return result;
    }
};
exports.EmailsController = EmailsController;
__decorate([
    (0, common_1.Get)('templates'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmailsController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)('templates/:slug'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmailsController.prototype, "getTemplate", null);
__decorate([
    (0, common_1.Post)('templates'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmailsController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Put)('templates/:slug'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EmailsController.prototype, "updateTemplate", null);
__decorate([
    (0, common_1.Delete)('templates/:slug'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmailsController.prototype, "deleteTemplate", null);
__decorate([
    (0, common_1.Post)('templates/seed'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmailsController.prototype, "seedTemplates", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('templateSlug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", void 0)
], EmailsController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Get)('logs/stats'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmailsController.prototype, "getLogStats", null);
__decorate([
    (0, common_1.Post)('templates/:slug/preview'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "previewTemplate", null);
__decorate([
    (0, common_1.Post)('templates/:slug/duplicate'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "duplicateTemplate", null);
__decorate([
    (0, common_1.Post)('templates/:slug/test'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "sendTestWithTemplate", null);
__decorate([
    (0, common_1.Post)('test'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "sendTestEmail", null);
exports.EmailsController = EmailsController = __decorate([
    (0, common_1.Controller)('emails'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [emails_service_1.EmailsService,
        email_templates_service_1.EmailTemplatesService,
        email_logs_service_1.EmailLogsService,
        settings_service_1.SettingsService])
], EmailsController);
//# sourceMappingURL=emails.controller.js.map