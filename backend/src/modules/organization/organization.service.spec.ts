import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { PrismaService } from '../../common/prisma.service';
import { createMockPrismaService, MockPrismaService } from '../../../test/helpers/mock-prisma';
import { buildOrganization } from '../../../test/helpers/mock-factories';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
  });

  describe('get', () => {
    it('should return the first organization', async () => {
      const org = buildOrganization();
      prisma.organization.findFirst.mockResolvedValue(org);

      const result = await service.get();

      expect(result).toEqual(org);
    });

    it('should return null when no organization exists', async () => {
      prisma.organization.findFirst.mockResolvedValue(null);

      const result = await service.get();

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update organization', async () => {
      const org = buildOrganization({ id: 'org-1' });
      const updated = { ...org, name: 'Updated Org' };
      prisma.organization.findFirst.mockResolvedValue(org);
      prisma.organization.update.mockResolvedValue(updated);

      const result = await service.update({ name: 'Updated Org' } as any);

      expect(result.name).toBe('Updated Org');
      expect(prisma.organization.update).toHaveBeenCalledWith({
        where: { id: 'org-1' },
        data: { name: 'Updated Org' },
      });
    });

    it('should throw NotFoundException if no organization exists', async () => {
      prisma.organization.findFirst.mockResolvedValue(null);
      await expect(service.update({ name: 'X' } as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('seed', () => {
    it('should upsert default organization', async () => {
      const org = buildOrganization({ slug: 'default', name: 'Tiny LMS' });
      prisma.organization.upsert.mockResolvedValue(org);

      const result = await service.seed();

      expect(result).toEqual(org);
      expect(prisma.organization.upsert).toHaveBeenCalledWith({
        where: { slug: 'default' },
        update: {},
        create: { slug: 'default', name: 'Tiny LMS', country: 'Vietnam' },
      });
    });
  });
});
