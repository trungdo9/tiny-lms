import { Module } from '@nestjs/common';
import { EmailsController } from './emails.controller';
import { EmailsService } from './emails.service';
import { EmailTemplatesService } from './templates/email-templates.service';
import { EmailLogsService } from './logs/email-logs.service';
import { SettingsModule } from '../settings/settings.module';
import { PrismaService } from '../../common/prisma.service';

@Module({
  imports: [SettingsModule],
  controllers: [EmailsController],
  providers: [EmailsService, EmailTemplatesService, EmailLogsService, PrismaService],
  exports: [EmailsService, EmailTemplatesService, EmailLogsService],
})
export class EmailsModule {}
