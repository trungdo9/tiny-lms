"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningPathsModule = void 0;
const common_1 = require("@nestjs/common");
const learning_paths_controller_1 = require("./learning-paths.controller");
const learning_paths_service_1 = require("./learning-paths.service");
const prisma_service_1 = require("../../common/prisma.service");
const certificates_module_1 = require("../certificates/certificates.module");
const notifications_module_1 = require("../notifications/notifications.module");
let LearningPathsModule = class LearningPathsModule {
};
exports.LearningPathsModule = LearningPathsModule;
exports.LearningPathsModule = LearningPathsModule = __decorate([
    (0, common_1.Module)({
        imports: [certificates_module_1.CertificatesModule, notifications_module_1.NotificationsModule],
        controllers: [learning_paths_controller_1.LearningPathsController],
        providers: [learning_paths_service_1.LearningPathsService, prisma_service_1.PrismaService],
        exports: [learning_paths_service_1.LearningPathsService],
    })
], LearningPathsModule);
//# sourceMappingURL=learning-paths.module.js.map