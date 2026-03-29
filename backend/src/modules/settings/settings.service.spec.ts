import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { PrismaService } from '../../common/prisma.service';
import { SupabaseService } from '../../common/supabase.service';
import { createMockPrismaService, MockPrismaService } from '../../../test/helpers/mock-prisma';
import { buildSetting } from '../../../test/helpers/mock-factories';

describe('SettingsService', () => {
  let service: SettingsService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: prisma },
        { provide: SupabaseService, useValue: { adminClient: { from: jest.fn() } } },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  describe('get', () => {
    it('should return parsed setting value', async () => {
      prisma.setting.findUnique.mockResolvedValue(
        buildSetting({ key: 'site_name', value: 'My LMS', type: 'string' }),
      );

      const result = await service.get('site_name');

      expect(result).toEqual({ key: 'site_name', value: 'My LMS', type: 'string', isSecret: false });
    });

    it('should parse number type', async () => {
      prisma.setting.findUnique.mockResolvedValue(
        buildSetting({ key: 'smtp_port', value: '587', type: 'number' }),
      );

      const result = await service.get('smtp_port');

      expect(result!.value).toBe(587);
    });

    it('should parse boolean type', async () => {
      prisma.setting.findUnique.mockResolvedValue(
        buildSetting({ key: 'dark_mode', value: 'true', type: 'boolean' }),
      );

      const result = await service.get('dark_mode');

      expect(result!.value).toBe(true);
    });

    it('should parse json type', async () => {
      prisma.setting.findUnique.mockResolvedValue(
        buildSetting({ key: 'config', value: '{"a":1}', type: 'json' }),
      );

      const result = await service.get('config');

      expect(result!.value).toEqual({ a: 1 });
    });

    it('should return null for non-existent key', async () => {
      prisma.setting.findUnique.mockResolvedValue(null);

      const result = await service.get('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle invalid json gracefully', async () => {
      prisma.setting.findUnique.mockResolvedValue(
        buildSetting({ key: 'config', value: 'invalid{', type: 'json' }),
      );

      const result = await service.get('config');

      expect(result!.value).toEqual({});
    });
  });

  describe('set', () => {
    it('should upsert a string setting', async () => {
      prisma.setting.upsert.mockResolvedValue(buildSetting());

      await service.set('site_name', 'New Name', 'string', false);

      expect(prisma.setting.upsert).toHaveBeenCalledWith({
        where: { key: 'site_name' },
        create: { key: 'site_name', value: 'New Name', type: 'string', isSecret: false },
        update: { value: 'New Name', type: 'string', isSecret: false },
      });
    });

    it('should stringify non-string values', async () => {
      prisma.setting.upsert.mockResolvedValue(buildSetting());

      await service.set('config', { a: 1 }, 'json', false);

      expect(prisma.setting.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ value: '{"a":1}' }),
        }),
      );
    });
  });

  describe('getByCategory', () => {
    it('should return parsed settings for a category', async () => {
      prisma.setting.findMany.mockResolvedValue([
        buildSetting({ key: 'brand_name', value: 'Test', type: 'string', category: 'branding' }),
        buildSetting({ key: 'brand_dark_mode', value: 'false', type: 'boolean', category: 'branding' }),
      ]);

      const result = await service.getByCategory('branding');

      expect(result).toHaveLength(2);
      expect(result[1].value).toBe(false);
    });
  });

  describe('getPublic', () => {
    it('should return non-secret branding settings as key-value map', async () => {
      prisma.setting.findMany.mockResolvedValue([
        buildSetting({ key: 'brand_name', value: 'Test', type: 'string', isSecret: false }),
        buildSetting({ key: 'secret_key', value: 'abc', type: 'string', isSecret: true }),
      ]);

      const result = await service.getPublic();

      expect(result).toEqual({ brand_name: 'Test' });
      expect(result).not.toHaveProperty('secret_key');
    });
  });

  describe('getAll', () => {
    it('should mask secret values', async () => {
      prisma.setting.findMany.mockResolvedValue([
        buildSetting({ key: 'public_key', value: 'visible', type: 'string', isSecret: false }),
        buildSetting({ key: 'smtp_pass', value: 'secret123', type: 'string', isSecret: true }),
      ]);

      const result = await service.getAll();

      expect(result.find(s => s.key === 'public_key')!.value).toBe('visible');
      expect(result.find(s => s.key === 'smtp_pass')!.value).toBe('***');
    });
  });

  describe('delete', () => {
    it('should delete setting by key', async () => {
      prisma.setting.delete.mockResolvedValue({});

      const result = await service.delete('some_key');

      expect(result).toEqual({ success: true });
    });
  });

  describe('seedDefaults', () => {
    it('should seed all default settings', async () => {
      prisma.setting.upsert.mockResolvedValue({});

      const result = await service.seedDefaults();

      expect(result.seeded).toBeGreaterThan(25);
      expect(prisma.setting.upsert).toHaveBeenCalledTimes(result.seeded);
    });
  });
});
