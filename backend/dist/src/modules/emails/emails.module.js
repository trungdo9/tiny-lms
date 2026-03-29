"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailsModule = void 0;
const common_1 = require("@nestjs/common");
const emails_controller_1 = require("./emails.controller");
const emails_service_1 = require("./emails.service");
const email_templates_service_1 = require("./templates/email-templates.service");
const email_logs_service_1 = require("./logs/email-logs.service");
const settings_module_1 = require("../settings/settings.module");
const prisma_service_1 = require("../../common/prisma.service");
let EmailsModule = class EmailsModule {
};
exports.EmailsModule = EmailsModule;
exports.EmailsModule = EmailsModule = __decorate([
    (0, common_1.Module)({
        imports: [settings_module_1.SettingsModule],
        controllers: [emails_controller_1.EmailsController],
        providers: [emails_service_1.EmailsService, email_templates_service_1.EmailTemplatesService, email_logs_service_1.EmailLogsService, prisma_service_1.PrismaService],
        exports: [emails_service_1.EmailsService, email_templates_service_1.EmailTemplatesService, email_logs_service_1.EmailLogsService],
    })
], EmailsModule);
//# sourceMappingURL=emails.module.js.map