"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactSyncModule = void 0;
const common_1 = require("@nestjs/common");
const contact_sync_controller_1 = require("./contact-sync.controller");
const contact_sync_webhook_controller_1 = require("./contact-sync-webhook.controller");
const contact_sync_service_1 = require("./contact-sync.service");
const contact_sync_log_service_1 = require("./contact-sync-log.service");
const contact_sync_events_service_1 = require("./contact-sync-events.service");
const settings_module_1 = require("../settings/settings.module");
const prisma_service_1 = require("../../common/prisma.service");
let ContactSyncModule = class ContactSyncModule {
};
exports.ContactSyncModule = ContactSyncModule;
exports.ContactSyncModule = ContactSyncModule = __decorate([
    (0, common_1.Module)({
        imports: [settings_module_1.SettingsModule],
        controllers: [contact_sync_controller_1.ContactSyncController, contact_sync_webhook_controller_1.ContactSyncWebhookController],
        providers: [contact_sync_service_1.ContactSyncService, contact_sync_log_service_1.ContactSyncLogService, contact_sync_events_service_1.ContactSyncEventsService, prisma_service_1.PrismaService],
        exports: [contact_sync_service_1.ContactSyncService],
    })
], ContactSyncModule);
//# sourceMappingURL=contact-sync.module.js.map