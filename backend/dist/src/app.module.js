"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const platform_express_1 = require("@nestjs/platform-express");
const event_emitter_1 = require("@nestjs/event-emitter");
const path = __importStar(require("path"));
const app_config_1 = __importDefault(require("./config/app.config"));
const shared_module_1 = require("./modules/shared/shared.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const courses_module_1 = require("./modules/courses/courses.module");
const sections_module_1 = require("./modules/sections/sections.module");
const lessons_module_1 = require("./modules/lessons/lessons.module");
const enrollments_module_1 = require("./modules/enrollments/enrollments.module");
const progress_module_1 = require("./modules/progress/progress.module");
const question_banks_module_1 = require("./modules/question-banks/question-banks.module");
const questions_module_1 = require("./modules/questions/questions.module");
const quizzes_module_1 = require("./modules/quizzes/quizzes.module");
const attempts_module_1 = require("./modules/attempts/attempts.module");
const grading_module_1 = require("./modules/grading/grading.module");
const reports_module_1 = require("./modules/reports/reports.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const certificates_module_1 = require("./modules/certificates/certificates.module");
const settings_module_1 = require("./modules/settings/settings.module");
const emails_module_1 = require("./modules/emails/emails.module");
const flash_cards_module_1 = require("./modules/flash-cards/flash-cards.module");
const activities_module_1 = require("./modules/activities/activities.module");
const payments_module_1 = require("./modules/payments/payments.module");
const organization_module_1 = require("./modules/organization/organization.module");
const departments_module_1 = require("./modules/departments/departments.module");
const scorm_module_1 = require("./modules/scorm/scorm.module");
const learning_paths_module_1 = require("./modules/learning-paths/learning-paths.module");
const assignments_module_1 = require("./modules/assignments/assignments.module");
const contact_sync_module_1 = require("./modules/contact-sync/contact-sync.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [app_config_1.default],
                envFilePath: path.resolve(process.cwd(), '.env'),
            }),
            platform_express_1.MulterModule.register({
                limits: { fileSize: 5 * 1024 * 1024 },
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            shared_module_1.SharedModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            courses_module_1.CoursesModule,
            sections_module_1.SectionsModule,
            lessons_module_1.LessonsModule,
            enrollments_module_1.EnrollmentsModule,
            progress_module_1.ProgressModule,
            question_banks_module_1.QuestionBanksModule,
            questions_module_1.QuestionsModule,
            quizzes_module_1.QuizzesModule,
            attempts_module_1.AttemptsModule,
            grading_module_1.GradingModule,
            reports_module_1.ReportsModule,
            notifications_module_1.NotificationsModule,
            certificates_module_1.CertificatesModule,
            settings_module_1.SettingsModule,
            emails_module_1.EmailsModule,
            flash_cards_module_1.FlashCardsModule,
            activities_module_1.ActivitiesModule,
            payments_module_1.PaymentsModule,
            organization_module_1.OrganizationModule,
            departments_module_1.DepartmentsModule,
            scorm_module_1.ScormModule,
            learning_paths_module_1.LearningPathsModule,
            assignments_module_1.AssignmentsModule,
            contact_sync_module_1.ContactSyncModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map