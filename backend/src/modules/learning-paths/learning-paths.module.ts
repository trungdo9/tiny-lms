import { Module } from '@nestjs/common';
import { LearningPathsController } from './learning-paths.controller';
import { LearningPathsService } from './learning-paths.service';
import { PrismaService } from '../../common/prisma.service';
import { CertificatesModule } from '../certificates/certificates.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [CertificatesModule, NotificationsModule],
  controllers: [LearningPathsController],
  providers: [LearningPathsService, PrismaService],
  exports: [LearningPathsService],
})
export class LearningPathsModule {}
