import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from './users.service';
import { PrismaService } from '../../common/prisma.service';
import { SupabaseService } from '../../common/supabase.service';
import { createMockPrismaService, MockPrismaService } from '../../../test/helpers/mock-prisma';
import { buildUser } from '../../../test/helpers/mock-factories';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: MockPrismaService;
  let supabase: { adminClient: any };
  let eventEmitter: { emit: jest.Mock };

  const userId = 'user-1';

  beforeEach(async () => {
    prisma = createMockPrismaService();
    supabase = {
      adminClient: {
        from: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: buildUser(), error: null }),
        auth: {
          admin: {
            createUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'new-user-id' } },
              error: null,
            }),
            deleteUser: jest.fn().mockResolvedValue({ error: null }),
            updateUserById: jest.fn().mockResolvedValue({ error: null }),
            getUserById: jest.fn().mockResolvedValue({
              data: { user: { id: userId, email: 'john@test.com', user_metadata: { full_name: 'John From Auth' } } },
              error: null,
            }),
          },
        },
      },
    };

    eventEmitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: SupabaseService, useValue: supabase },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findById', () => {
    it('should return user profile', async () => {
      const user = buildUser({ id: userId });
      prisma.profile.findUnique.mockResolvedValue(user);

      const result = await service.findById(userId);

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.profile.findUnique.mockResolvedValue(null);
      await expect(service.findById('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProfile', () => {
    it('should merge profile with provided data', async () => {
      const user = buildUser({ id: userId, fullName: 'John', email: 'john@test.com' });
      prisma.profile.findUnique.mockResolvedValue(user);

      const result = await service.getProfile(userId, 'john@test.com');

      expect(result.id).toBe(userId);
      expect(result.fullName).toBe('John');
      expect(result.email).toBe('john@test.com');
    });

    it('should auto-create a missing profile from auth data', async () => {
      prisma.profile.findUnique.mockResolvedValue(null);
      prisma.profile.upsert.mockResolvedValue(
        buildUser({ id: userId, email: 'john@test.com', fullName: 'John From Auth', role: 'student' }),
      );

      const result = await service.getProfile(userId, 'john@test.com');

      expect(supabase.adminClient.auth.admin.getUserById).toHaveBeenCalledWith(userId);
      expect(prisma.profile.upsert).toHaveBeenCalledWith({
        where: { id: userId },
        update: expect.objectContaining({ email: 'john@test.com', fullName: 'John From Auth', isActive: true }),
        create: expect.objectContaining({ id: userId, email: 'john@test.com', fullName: 'John From Auth', role: 'student', isActive: true }),
      });
      expect(result.email).toBe('john@test.com');
      expect(result.fullName).toBe('John From Auth');
    });

    it('should sync email when provided email differs from stored profile email', async () => {
      prisma.profile.findUnique.mockResolvedValue(buildUser({ id: userId, email: 'old@test.com' }));
      prisma.profile.update.mockResolvedValue(buildUser({ id: userId, email: 'new@test.com' }));

      const result = await service.getProfile(userId, 'new@test.com');

      expect(prisma.profile.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { email: 'new@test.com' },
      });
      expect(result.email).toBe('new@test.com');
    });
  });

  describe('updateAvatar', () => {
    it('should update avatar URL', async () => {
      const updated = buildUser({ id: userId, avatarUrl: 'https://new-url.com' });
      prisma.profile.update.mockResolvedValue(updated);

      const result = await service.updateAvatar(userId, 'https://new-url.com');

      expect(result.avatarUrl).toBe('https://new-url.com');
    });
  });

  describe('searchUsers', () => {
    it('should return paginated users', async () => {
      const users = [buildUser({ id: 'u1' }), buildUser({ id: 'u2' })];
      prisma.profile.findMany.mockResolvedValue(users);
      prisma.profile.count.mockResolvedValue(2);

      const result = await service.searchUsers('', 1, 20);

      expect(result.users).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should apply search query to OR filter', async () => {
      prisma.profile.findMany.mockResolvedValue([]);
      prisma.profile.count.mockResolvedValue(0);

      await service.searchUsers('john', 1, 20);

      expect(prisma.profile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ fullName: expect.any(Object) }),
            ]),
          }),
        }),
      );
    });

    it('should apply role and isActive filters', async () => {
      prisma.profile.findMany.mockResolvedValue([]);
      prisma.profile.count.mockResolvedValue(0);

      await service.searchUsers('', 1, 20, { role: 'admin', isActive: true });

      expect(prisma.profile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ role: 'admin', isActive: true }),
        }),
      );
    });

    it('should calculate correct offset for page 2', async () => {
      prisma.profile.findMany.mockResolvedValue([]);
      prisma.profile.count.mockResolvedValue(50);

      await service.searchUsers('', 2, 20);

      expect(prisma.profile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 20 }),
      );
    });
  });

  describe('updateUser', () => {
    it('should update selective fields', async () => {
      const updated = buildUser({ id: userId, role: 'instructor' });
      prisma.profile.update.mockResolvedValue(updated);

      const result = await service.updateUser(userId, { role: 'instructor' });

      expect(prisma.profile.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { role: 'instructor' },
      });
    });
  });

  describe('deactivateUser / reactivateUser', () => {
    it('should deactivate user', async () => {
      prisma.profile.update.mockResolvedValue(buildUser({ isActive: false }));

      const result = await service.deactivateUser(userId);

      expect(prisma.profile.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { isActive: false },
      });
    });

    it('should reactivate user', async () => {
      prisma.profile.update.mockResolvedValue(buildUser({ isActive: true }));

      const result = await service.reactivateUser(userId);

      expect(prisma.profile.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { isActive: true },
      });
    });
  });

  describe('createUser', () => {
    it('should create supabase auth user and profile', async () => {
      prisma.profile.create.mockResolvedValue(
        buildUser({ id: 'new-user-id', email: 'new@test.com', role: 'student' }),
      );

      const result = await service.createUser({
        email: 'new@test.com',
        password: 'password123',
        fullName: 'New User',
      });

      expect(supabase.adminClient.auth.admin.createUser).toHaveBeenCalled();
      expect(prisma.profile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 'new-user-id',
          email: 'new@test.com',
          role: 'student',
        }),
      });
    });
  });

  describe('getUserStats', () => {
    it('should return role-based user counts', async () => {
      prisma.profile.count
        .mockResolvedValueOnce(100)  // total
        .mockResolvedValueOnce(70)   // students
        .mockResolvedValueOnce(20)   // instructors
        .mockResolvedValueOnce(5)    // admins
        .mockResolvedValueOnce(8);   // inactive

      const result = await service.getUserStats();

      expect(result).toEqual({
        total: 100,
        students: 70,
        instructors: 20,
        admins: 5,
        inactive: 8,
      });
    });
  });

  describe('resetUserPassword', () => {
    it('should update password via supabase', async () => {
      const result = await service.resetUserPassword(userId, 'newpass123');

      expect(result).toEqual({ success: true });
      expect(supabase.adminClient.auth.admin.updateUserById).toHaveBeenCalledWith(userId, {
        password: 'newpass123',
      });
    });
  });
});
