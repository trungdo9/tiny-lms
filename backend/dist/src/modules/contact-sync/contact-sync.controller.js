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
var ContactSyncController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactSyncController = void 0;
const common_1 = require("@nestjs/common");
const contact_sync_service_1 = require("./contact-sync.service");
const contact_sync_log_service_1 = require("./contact-sync-log.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
let ContactSyncController = ContactSyncController_1 = class ContactSyncController {
    syncService;
    logService;
    logger = new common_1.Logger(ContactSyncController_1.name);
    constructor(syncService, logService) {
        this.syncService = syncService;
        this.logService = logService;
    }
    async getStatus() {
        return this.syncService.getStatus();
    }
    async verifyConnection() {
        return this.syncService.verifyConnection();
    }
    async getLogs(page, limit, status, provider, trigger) {
        return this.logService.findAll({
            page: page ? parseInt(page, 10) : 1,
            limit: Math.min(limit ? parseInt(limit, 10) : 20, 100),
            status,
            provider,
            trigger,
        });
    }
    async getLogStats() {
        return this.logService.getStats();
    }
    async bulkSync() {
        this.syncService.bulkSync().catch((err) => {
            this.logger.error('Bulk sync failed:', err);
        });
        return { message: 'Bulk sync started. Check logs for progress.' };
    }
    async syncUser(userId) {
        const result = await this.syncService.syncUser(userId, 'manual');
        if (!result) {
            return { message: 'Contact sync is not enabled or user not found' };
        }
        return result;
    }
};
exports.ContactSyncController = ContactSyncController;
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContactSyncController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('verify'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContactSyncController.prototype, "verifyConnection", null);
__decorate([
    (0, common_1.Get)('logs'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('provider')),
    __param(4, (0, common_1.Query)('trigger')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ContactSyncController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Get)('logs/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContactSyncController.prototype, "getLogStats", null);
__decorate([
    (0, common_1.Post)('bulk-sync'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContactSyncController.prototype, "bulkSync", null);
__decorate([
    (0, common_1.Post)('sync-user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactSyncController.prototype, "syncUser", null);
exports.ContactSyncController = ContactSyncController = ContactSyncController_1 = __decorate([
    (0, common_1.Controller)('contact-sync'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __metadata("design:paramtypes", [contact_sync_service_1.ContactSyncService,
        contact_sync_log_service_1.ContactSyncLogService])
], ContactSyncController);
//# sourceMappingURL=contact-sync.controller.js.map