"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlashCardsModule = void 0;
const common_1 = require("@nestjs/common");
const flash_cards_controller_1 = require("./flash-cards.controller");
const flash_cards_service_1 = require("./flash-cards.service");
const prisma_service_1 = require("../../common/prisma.service");
let FlashCardsModule = class FlashCardsModule {
};
exports.FlashCardsModule = FlashCardsModule;
exports.FlashCardsModule = FlashCardsModule = __decorate([
    (0, common_1.Module)({
        controllers: [flash_cards_controller_1.FlashCardsController, flash_cards_controller_1.LessonFlashCardsController],
        providers: [flash_cards_service_1.FlashCardsService, prisma_service_1.PrismaService],
        exports: [flash_cards_service_1.FlashCardsService],
    })
], FlashCardsModule);
//# sourceMappingURL=flash-cards.module.js.map