import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { EventEmitterModule } from '@nestjs/event-emitter';
import * as path from 'path';
import appConfig from './config/app.config';
import { SharedModule } from './modules/shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { SectionsModule } from './modules/sections/sections.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { ProgressModule } from './modules/progress/progress.module';
import { QuestionBanksModule } from './modules/question-banks/question-banks.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { AttemptsModule } from './modules/attempts/attempts.module';
import { GradingModule } from './modules/grading/grading.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { SettingsModule } from './modules/settings/settings.module';
import { EmailsModule } from './modules/emails/emails.module';
import { FlashCardsModule } from './modules/flash-cards/flash-cards.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { ScormModule } from './modules/scorm/scorm.module';
import { LearningPathsModule } from './modules/learning-paths/learning-paths.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { ContactSyncModule } from './modules/contact-sync/contact-sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: path.resolve(__dirname, '..', '.env'),
    }),
    MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
    EventEmitterModule.forRoot(),
    SharedModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    SectionsModule,
    LessonsModule,
    EnrollmentsModule,
    ProgressModule,
    QuestionBanksModule,
    QuestionsModule,
    QuizzesModule,
    AttemptsModule,
    GradingModule,
    ReportsModule,
    NotificationsModule,
    CertificatesModule,
    SettingsModule,
    EmailsModule,
    FlashCardsModule,
    ActivitiesModule,
    PaymentsModule,
    OrganizationModule,
    DepartmentsModule,
    ScormModule,
    LearningPathsModule,
    AssignmentsModule,
    ContactSyncModule,
  ],
})
export class AppModule {}
