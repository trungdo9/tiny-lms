import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EmailTemplatesService } from './email-templates.service';
import { PrismaService } from '../../../common/prisma.service';
import { createMockPrismaService, MockPrismaService } from '../../../../test/helpers/mock-prisma';
import { buildEmailTemplate } from '../../../../test/helpers/mock-factories';

describe('EmailTemplatesService', () => {
  let service: EmailTemplatesService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailTemplatesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EmailTemplatesService>(EmailTemplatesService);
  });

  describe('findAll', () => {
    it('should return all templates ordered by name', async () => {
      const templates = [buildEmailTemplate({ slug: 'a' }), buildEmailTemplate({ slug: 'b' })];
      prisma.emailTemplate.findMany.mockResolvedValue(templates);

      const result = await service.findAll();

      expect(result).toEqual(templates);
      expect(prisma.emailTemplate.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
    });
  });

  describe('findBySlug', () => {
    it('should return template by slug', async () => {
      const template = buildEmailTemplate({ slug: 'welcome' });
      prisma.emailTemplate.findUnique.mockResolvedValue(template);

      const result = await service.findBySlug('welcome');

      expect(result).toEqual(template);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.emailTemplate.findUnique.mockResolvedValue(null);
      await expect(service.findBySlug('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new template with default isActive', async () => {
      const data = { slug: 'new', name: 'New Template', subject: 'Subject', body: '<p>Body</p>' };
      const created = buildEmailTemplate(data);
      prisma.emailTemplate.create.mockResolvedValue(created);

      const result = await service.create(data);

      expect(result).toEqual(created);
      expect(prisma.emailTemplate.create).toHaveBeenCalledWith({
        data: { ...data, isActive: true },
      });
    });
  });

  describe('update', () => {
    it('should update an existing template', async () => {
      const existing = buildEmailTemplate({ slug: 'welcome' });
      prisma.emailTemplate.findUnique.mockResolvedValue(existing);
      prisma.emailTemplate.update.mockResolvedValue({ ...existing, name: 'Updated' });

      const result = await service.update('welcome', { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException if slug not found', async () => {
      prisma.emailTemplate.findUnique.mockResolvedValue(null);
      await expect(service.update('nonexistent', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete template by slug', async () => {
      prisma.emailTemplate.findUnique.mockResolvedValue(buildEmailTemplate());
      prisma.emailTemplate.delete.mockResolvedValue({});

      const result = await service.delete('welcome');

      expect(result).toEqual({ success: true });
    });
  });

  describe('render', () => {
    it('should replace {{variables}} in subject and body', () => {
      const template = { subject: 'Hello {{user_name}}', body: '<p>Welcome to {{site_name}}</p>' };
      const vars = { user_name: 'John', site_name: 'Tiny LMS' };

      const result = service.render(template, vars);

      expect(result.subject).toBe('Hello John');
      expect(result.body).toBe('<p>Welcome to Tiny LMS</p>');
    });

    it('should replace multiple occurrences of same variable', () => {
      const template = { subject: '{{name}} - {{name}}', body: '{{name}}' };

      const result = service.render(template, { name: 'Test' });

      expect(result.subject).toBe('Test - Test');
      expect(result.body).toBe('Test');
    });

    it('should leave unmatched placeholders as-is', () => {
      const template = { subject: 'Hello {{unknown}}', body: '' };

      const result = service.render(template, {});

      expect(result.subject).toBe('Hello {{unknown}}');
    });
  });

  describe('seedDefaults', () => {
    it('should seed 4 default templates', async () => {
      prisma.emailTemplate.upsert.mockResolvedValue({});

      const result = await service.seedDefaults();

      expect(result).toEqual({ seeded: 4 });
      expect(prisma.emailTemplate.upsert).toHaveBeenCalledTimes(4);
    });
  });
});
