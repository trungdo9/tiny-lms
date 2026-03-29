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
var ContactSyncEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactSyncEventsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const contact_sync_service_1 = require("./contact-sync.service");
const contact_sync_events_1 = require("./contact-sync.events");
let ContactSyncEventsService = ContactSyncEventsService_1 = class ContactSyncEventsService {
    contactSyncService;
    logger = new common_1.Logger(ContactSyncEventsService_1.name);
    constructor(contactSyncService) {
        this.contactSyncService = contactSyncService;
    }
    async handleUserRegistered(event) {
        try {
            await this.contactSyncService.syncUser(event.userId, 'register');
        }
        catch (error) {
            this.logger.error(`Failed to sync registered user ${event.userId}:`, error);
        }
    }
    async handleEnrollmentCreated(event) {
        try {
            await this.contactSyncService.addEnrollmentTag(event.userId, event.courseId, 'enroll');
        }
        catch (error) {
            this.logger.error(`Failed to sync enrollment for user ${event.userId}:`, error);
        }
    }
    async handleProfileUpdated(event) {
        try {
            await this.contactSyncService.syncUser(event.userId, 'profile_update');
        }
        catch (error) {
            this.logger.error(`Failed to sync profile update for user ${event.userId}:`, error);
        }
    }
    async handleCourseCompleted(event) {
        try {
            await this.contactSyncService.addCompletionTag(event.userId, event.courseId, 'completion');
        }
        catch (error) {
            this.logger.error(`Failed to sync course completion for user ${event.userId}:`, error);
        }
    }
};
exports.ContactSyncEventsService = ContactSyncEventsService;
__decorate([
    (0, event_emitter_1.OnEvent)(contact_sync_events_1.CONTACT_SYNC_EVENTS.USER_REGISTERED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContactSyncEventsService.prototype, "handleUserRegistered", null);
__decorate([
    (0, event_emitter_1.OnEvent)(contact_sync_events_1.CONTACT_SYNC_EVENTS.ENROLLMENT_CREATED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContactSyncEventsService.prototype, "handleEnrollmentCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(contact_sync_events_1.CONTACT_SYNC_EVENTS.PROFILE_UPDATED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContactSyncEventsService.prototype, "handleProfileUpdated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(contact_sync_events_1.CONTACT_SYNC_EVENTS.COURSE_COMPLETED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContactSyncEventsService.prototype, "handleCourseCompleted", null);
exports.ContactSyncEventsService = ContactSyncEventsService = ContactSyncEventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [contact_sync_service_1.ContactSyncService])
], ContactSyncEventsService);
//# sourceMappingURL=contact-sync-events.service.js.map