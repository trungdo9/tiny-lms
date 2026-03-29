import { Module } from '@nestjs/common';
import { ContactSyncController } from './contact-sync.controller';
import { ContactSyncWebhookController } from './contact-sync-webhook.controller';
import { ContactSyncService } from './contact-sync.service';
import { ContactSyncLogService } from './contact-sync-log.service';
import { ContactSyncEventsService } from './contact-sync-events.service';
import { SettingsModule } from '../settings/settings.module';
import { PrismaService } from '../../common/prisma.service';

@Module({
  imports: [SettingsModule],
  controllers: [ContactSyncController, ContactSyncWebhookController],
  providers: [ContactSyncService, ContactSyncLogService, ContactSyncEventsService, PrismaService],
  exports: [ContactSyncService],
})
export class ContactSyncModule {}
