import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { EmailsService } from './emails.service';
import { EmailTemplatesService } from './templates/email-templates.service';
import { EmailLogsService } from './logs/email-logs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { SettingsService } from '../settings/settings.service';

@ApiTags('emails')
@ApiBearerAuth()
@Controller('emails')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmailsController {
  constructor(
    private readonly emailsService: EmailsService,
    private readonly templatesService: EmailTemplatesService,
    private readonly logsService: EmailLogsService,
    private readonly settingsService: SettingsService,
  ) {}

  // Email Templates
  @Get('templates')
  @Roles(Role.ADMIN)
  getTemplates() {
    return this.templatesService.findAll();
  }

  @Get('templates/:slug')
  @Roles(Role.ADMIN)
  getTemplate(@Param('slug') slug: string) {
    return this.templatesService.findBySlug(slug);
  }

  @Post('templates')
  @Roles(Role.ADMIN)
  createTemplate(@Body() body: { slug: string; name: string; subject: string; body: string }) {
    return this.templatesService.create(body);
  }

  @Put('templates/:slug')
  @Roles(Role.ADMIN)
  updateTemplate(
    @Param('slug') slug: string,
    @Body() body: { name?: string; subject?: string; body?: string; isActive?: boolean },
  ) {
    return this.templatesService.update(slug, body);
  }

  @Delete('templates/:slug')
  @Roles(Role.ADMIN)
  deleteTemplate(@Param('slug') slug: string) {
    return this.templatesService.delete(slug);
  }

  @Post('templates/seed')
  @Roles(Role.ADMIN)
  seedTemplates() {
    return this.templatesService.seedDefaults();
  }

  // Email Logs
  @Get('logs')
  @Roles(Role.ADMIN)
  getLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('templateSlug') templateSlug?: string,
  ) {
    return this.logsService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      status,
      templateSlug,
    });
  }

  @Get('logs/stats')
  @Roles(Role.ADMIN)
  getLogStats() {
    return this.logsService.getStats();
  }

  // Preview template with variables
  @Post('templates/:slug/preview')
  @Roles(Role.ADMIN)
  async previewTemplate(
    @Param('slug') slug: string,
    @Body() body: { variables?: Record<string, string> },
  ) {
    const template = await this.templatesService.findBySlug(slug);
    const siteName = await this.settingsService.get('site_name');
    const siteUrl = await this.settingsService.get('site_url');
    const footerText = await this.settingsService.get('brand_footer_text');

    const vars: Record<string, string> = {
      site_name: (siteName?.value as string) || 'Tiny LMS',
      site_url: (siteUrl?.value as string) || 'http://localhost:3000',
      footer_text: (footerText?.value as string) || '',
      ...body.variables,
    };

    return this.templatesService.render(template, vars);
  }

  // Duplicate template
  @Post('templates/:slug/duplicate')
  @Roles(Role.ADMIN)
  async duplicateTemplate(@Param('slug') slug: string) {
    const original = await this.templatesService.findBySlug(slug);
    const newSlug = `${slug}-copy-${Date.now()}`;
    return this.templatesService.create({
      slug: newSlug,
      name: `${original.name} (Copy)`,
      subject: original.subject,
      body: original.body,
      isActive: false,
    });
  }

  // Send test email with template and custom variables
  @Post('templates/:slug/test')
  @Roles(Role.ADMIN)
  async sendTestWithTemplate(
    @Param('slug') slug: string,
    @Body() body: { to: string; variables?: Record<string, string> },
  ) {
    const template = await this.templatesService.findBySlug(slug);
    const siteName = await this.settingsService.get('site_name');
    const siteUrl = await this.settingsService.get('site_url');
    const footerText = await this.settingsService.get('brand_footer_text');

    const vars: Record<string, string> = {
      site_name: (siteName?.value as string) || 'Tiny LMS',
      site_url: (siteUrl?.value as string) || 'http://localhost:3000',
      footer_text: (footerText?.value as string) || '',
      user_name: 'Test User',
      ...body.variables,
    };

    const rendered = this.templatesService.render(template, vars);

    const result = await this.emailsService.send({
      to: body.to,
      subject: rendered.subject,
      html: rendered.body,
    });

    await this.logsService.create({
      templateSlug: slug,
      to: body.to,
      subject: rendered.subject,
      body: rendered.body,
      status: result.success ? 'sent' : 'failed',
      errorMessage: result.error,
      messageId: result.messageId,
    });

    return result;
  }

  // Send test email
  @Post('test')
  @Roles(Role.ADMIN)
  async sendTestEmail(@Body() body: { to: string }) {
    const siteName = await this.settingsService.get('site_name');
    const siteUrl = await this.settingsService.get('site_url');
    const footerText = await this.settingsService.get('brand_footer_text');

    const result = await this.emailsService.send({
      to: body.to,
      subject: 'Test Email from Tiny LMS',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Test Email</h1>
          <p>This is a test email from ${(siteName?.value as string) || 'Tiny LMS'}.</p>
          <p>If you received this, your email configuration is working correctly!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            ${(footerText?.value as string) || ''}
          </p>
        </div>
      `,
    });

    // Log the test email
    await this.logsService.create({
      to: body.to,
      subject: 'Test Email from Tiny LMS',
      status: result.success ? 'sent' : 'failed',
      errorMessage: result.error,
      messageId: result.messageId,
    });

    return result;
  }
}
