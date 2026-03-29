import { EmailsService } from './emails.service';
import { EmailTemplatesService } from './templates/email-templates.service';
import { EmailLogsService } from './logs/email-logs.service';
import { SettingsService } from '../settings/settings.service';
export declare class EmailsController {
    private readonly emailsService;
    private readonly templatesService;
    private readonly logsService;
    private readonly settingsService;
    constructor(emailsService: EmailsService, templatesService: EmailTemplatesService, logsService: EmailLogsService, settingsService: SettingsService);
    getTemplates(): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        subject: string;
        body: string;
    }[]>;
    getTemplate(slug: string): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        subject: string;
        body: string;
    }>;
    createTemplate(body: {
        slug: string;
        name: string;
        subject: string;
        body: string;
    }): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        subject: string;
        body: string;
    }>;
    updateTemplate(slug: string, body: {
        name?: string;
        subject?: string;
        body?: string;
        isActive?: boolean;
    }): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        subject: string;
        body: string;
    }>;
    deleteTemplate(slug: string): Promise<{
        success: boolean;
    }>;
    seedTemplates(): Promise<{
        seeded: number;
    }>;
    getLogs(page?: number, limit?: number, status?: string, templateSlug?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            status: string;
            subject: string;
            body: string | null;
            to: string;
            templateSlug: string | null;
            errorMessage: string | null;
            messageId: string | null;
            sentAt: Date | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getLogStats(): Promise<{
        total: number;
        sent: number;
        failed: number;
        pending: number;
    }>;
    previewTemplate(slug: string, body: {
        variables?: Record<string, string>;
    }): Promise<{
        subject: string;
        body: string;
    }>;
    duplicateTemplate(slug: string): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        subject: string;
        body: string;
    }>;
    sendTestWithTemplate(slug: string, body: {
        to: string;
        variables?: Record<string, string>;
    }): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    sendTestEmail(body: {
        to: string;
    }): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
