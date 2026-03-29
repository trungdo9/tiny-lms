import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { PrismaService } from '../../common/prisma.service';
import { createMockPrismaService, MockPrismaService } from '../../../test/helpers/mock-prisma';
import { buildDepartment, buildOrganization } from '../../../test/helpers/mock-factories';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
  });

  describe('findAll', () => {
    it('should return flat list when flat=true', async () => {
      const depts = [buildDepartment({ id: 'd1' }), buildDepartment({ id: 'd2' })];
      prisma.department.findMany.mockResolvedValue(depts);

      const result = await service.findAll(true);

      expect(result).toEqual(depts);
    });

    it('should return tree structure when flat=false', async () => {
      const parent = buildDepartment({ id: 'p1', parentId: null, name: 'Engineering' });
      const child = buildDepartment({ id: 'c1', parentId: 'p1', name: 'Frontend' });
      prisma.department.findMany.mockResolvedValue([parent, child]);

      const result = await service.findAll(false) as any[];

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p1');
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].id).toBe('c1');
    });
  });

  describe('findOne', () => {
    it('should return department with children', async () => {
      const dept = buildDepartment({ id: 'd1', children: [] });
      prisma.department.findUnique.mockResolvedValue(dept);

      const result = await service.findOne('d1');

      expect(result).toEqual(dept);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.department.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create department with auto-generated slug', async () => {
      const org = buildOrganization({ id: 'org-1' });
      prisma.organization.findFirst.mockResolvedValue(org);
      prisma.department.create.mockImplementation(async ({ data }) => ({
        id: 'new-id',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const result = await service.create({ name: 'Engineering', description: 'Eng team' } as any);

      expect(result.name).toBe('Engineering');
      expect(result.slug).toMatch(/^engineering-/);
      expect(result.organizationId).toBe('org-1');
    });

    it('should throw BadRequestException if no organization exists', async () => {
      prisma.organization.findFirst.mockResolvedValue(null);
      await expect(service.create({ name: 'Test' } as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update department and regenerate slug if name changed', async () => {
      prisma.department.update.mockImplementation(async ({ data }) => ({
        id: 'd1',
        ...data,
      }));

      const result = await service.update('d1', { name: 'New Name' } as any);

      expect(prisma.department.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'd1' },
          data: expect.objectContaining({ name: 'New Name' }),
        }),
      );
    });

    it('should throw BadRequestException if parentId is self', async () => {
      await expect(service.update('d1', { parentId: 'd1' } as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete department and nullify profile references', async () => {
      prisma.department.count.mockResolvedValue(0);
      prisma.profile.updateMany.mockResolvedValue({ count: 2 });
      prisma.department.delete.mockResolvedValue({});

      await service.delete('d1');

      expect(prisma.profile.updateMany).toHaveBeenCalledWith({
        where: { departmentId: 'd1' },
        data: { departmentId: null },
      });
      expect(prisma.department.delete).toHaveBeenCalledWith({ where: { id: 'd1' } });
    });

    it('should throw BadRequestException if has children', async () => {
      prisma.department.count.mockResolvedValue(2);
      await expect(service.delete('d1')).rejects.toThrow(BadRequestException);
    });
  });
});
