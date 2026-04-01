"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiQuestionsModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ai_questions_controller_1 = require("./ai-questions.controller");
const ai_questions_service_1 = require("./ai-questions.service");
let AiQuestionsModule = class AiQuestionsModule {
};
exports.AiQuestionsModule = AiQuestionsModule;
exports.AiQuestionsModule = AiQuestionsModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        controllers: [ai_questions_controller_1.AiQuestionsController],
        providers: [ai_questions_service_1.AiQuestionsService],
        exports: [ai_questions_service_1.AiQuestionsService],
    })
], AiQuestionsModule);
//# sourceMappingURL=ai-questions.module.js.map