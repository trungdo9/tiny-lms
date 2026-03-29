import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ContactSyncService } from './contact-sync.service';
import { ContactSyncLogService } from './contact-sync-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('contact-sync')
@ApiBearerAuth()
@Controller('contact-sync')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ContactSyncController {
  private readonly logger = new Logger(ContactSyncController.name);

  constructor(
    private readonly syncService: ContactSyncService,
    private readonly logService: ContactSyncLogService,
  ) {}

  @Get('status')
  async getStatus() {
    return this.syncService.getStatus();
  }

  @Post('verify')
  async verifyConnection() {
    return this.syncService.verifyConnection();
  }

  @Get('logs')
  async getLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('provider') provider?: string,
    @Query('trigger') trigger?: string,
  ) {
    return this.logService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: Math.min(limit ? parseInt(limit, 10) : 20, 100),
      status,
      provider,
      trigger,
    });
  }

  @Get('logs/stats')
  async getLogStats() {
    return this.logService.getStats();
  }

  @Post('bulk-sync')
  @HttpCode(HttpStatus.ACCEPTED)
  async bulkSync() {
    // Fire-and-forget: start bulk sync in background, return 202 immediately
    this.syncService.bulkSync().catch((err) => {
      this.logger.error('Bulk sync failed:', err);
    });
    return { message: 'Bulk sync started. Check logs for progress.' };
  }

  @Post('sync-user/:userId')
  async syncUser(@Param('userId') userId: string) {
    const result = await this.syncService.syncUser(userId, 'manual');
    if (!result) {
      return { message: 'Contact sync is not enabled or user not found' };
    }
    return result;
  }
}
