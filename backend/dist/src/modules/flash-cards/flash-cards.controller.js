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
exports.FlashCardsSessionController = exports.FlashCardsController = exports.LessonFlashCardsController = void 0;
const common_1 = require("@nestjs/common");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const flash_cards_service_1 = require("./flash-cards.service");
const flash_card_dto_1 = require("./dto/flash-card.dto");
let LessonFlashCardsController = class LessonFlashCardsController {
    service;
    constructor(service) {
        this.service = service;
    }
    findByLesson(lessonId) {
        return this.service.findByLesson(lessonId);
    }
    create(req, lessonId, dto) {
        return this.service.createDeck(req.user.id, lessonId, dto, req.user.role);
    }
    update(req, lessonId, dto) {
        return this.service.updateDeck(req.user.id, lessonId, dto, req.user.role);
    }
    delete(req, lessonId) {
        return this.service.deleteDeck(req.user.id, lessonId, req.user.role);
    }
};
exports.LessonFlashCardsController = LessonFlashCardsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('lessonId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LessonFlashCardsController.prototype, "findByLesson", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('lessonId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, flash_card_dto_1.CreateDeckDto]),
    __metadata("design:returntype", void 0)
], LessonFlashCardsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('lessonId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, flash_card_dto_1.UpdateDeckDto]),
    __metadata("design:returntype", void 0)
], LessonFlashCardsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('lessonId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LessonFlashCardsController.prototype, "delete", null);
exports.LessonFlashCardsController = LessonFlashCardsController = __decorate([
    (0, common_1.Controller)('lessons/:lessonId/flash-cards'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [flash_cards_service_1.FlashCardsService])
], LessonFlashCardsController);
let FlashCardsController = class FlashCardsController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(req) {
        return this.service.findAllByInstructor(req.user.id, req.user.role);
    }
    getCards(deckId) {
        return this.service.getCards(deckId);
    }
    addCard(req, deckId, dto) {
        return this.service.createCard(req.user.id, deckId, dto, req.user.role);
    }
    updateCard(req, cardId, dto) {
        return this.service.updateCard(req.user.id, cardId, dto, req.user.role);
    }
    deleteCard(req, cardId) {
        return this.service.deleteCard(req.user.id, cardId, req.user.role);
    }
    reorderCards(req, deckId, body) {
        return this.service.reorderCards(req.user.id, deckId, body.cardIds, req.user.role);
    }
    startSession(req, deckId) {
        return this.service.startSession(req.user.id, deckId);
    }
    getHistory(req, deckId) {
        return this.service.getHistory(req.user.id, deckId);
    }
};
exports.FlashCardsController = FlashCardsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FlashCardsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':deckId/cards'),
    __param(0, (0, common_1.Param)('deckId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FlashCardsController.prototype, "getCards", null);
__decorate([
    (0, common_1.Post)(':deckId/cards'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('deckId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, flash_card_dto_1.CreateCardDto]),
    __metadata("design:returntype", void 0)
], FlashCardsController.prototype, "addCard", null);
__decorate([
    (0, common_1.Put)('cards/:cardId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('cardId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, flash_card_dto_1.UpdateCardDto]),
    __metadata("design:returntype", void 0)
], FlashCardsController.prototype, "updateCard", null);
__decorate([
    (0, common_1.Delete)('cards/:cardId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('cardId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FlashCardsController.prototype, "deleteCard", null);
__decorate([
    (0, common_1.Put)(':deckId/cards/reorder'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('deckId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], FlashCardsController.prototype, "reorderCards", null);
__decorate([
    (0, common_1.Post)(':deckId/start'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('deckId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FlashCardsController.prototype, "startSession", null);
__decorate([
    (0, common_1.Get)(':deckId/history'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('deckId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FlashCardsController.prototype, "getHistory", null);
exports.FlashCardsController = FlashCardsController = __decorate([
    (0, common_1.Controller)('flash-cards-deck'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [flash_cards_service_1.FlashCardsService])
], FlashCardsController);
let FlashCardsSessionController = class FlashCardsSessionController {
    service;
    constructor(service) {
        this.service = service;
    }
    complete(req, sessionId, dto) {
        return this.service.completeSession(req.user.id, sessionId, dto);
    }
};
exports.FlashCardsSessionController = FlashCardsSessionController;
__decorate([
    (0, common_1.Post)(':sessionId/complete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, flash_card_dto_1.CompleteSessionDto]),
    __metadata("design:returntype", void 0)
], FlashCardsSessionController.prototype, "complete", null);
exports.FlashCardsSessionController = FlashCardsSessionController = __decorate([
    (0, common_1.Controller)('flash-cards-sessions'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [flash_cards_service_1.FlashCardsService])
], FlashCardsSessionController);
//# sourceMappingURL=flash-cards.controller.js.map