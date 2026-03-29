import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ScormService } from './scorm.service';
import { PrismaService } from '../../common/prisma.service';
import { createMockPrismaService, MockPrismaService } from '../../../test/helpers/mock-prisma';
import { buildScormPackage, buildScormAttempt } from '../../../test/helpers/mock-factories';

describe('ScormService', () => {
  let service: ScormService;
  let prisma: MockPrismaService;

  const userId = 'user-1';
  const packageId = 'pkg-1';

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScormService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ScormService>(ScormService);
  });

  describe('getPackageByLesson', () => {
    it('should return SCORM package for lesson', async () => {
      const pkg = buildScormPackage({ lessonId: 'lesson-1' });
      prisma.scormPackage.findUnique.mockResolvedValue(pkg);

      const result = await service.getPackageByLesson('lesson-1');

      expect(result).toEqual(pkg);
    });

    it('should throw NotFoundException if no package found', async () => {
      prisma.scormPackage.findUnique.mockResolvedValue(null);
      await expect(service.getPackageByLesson('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPackageByCourse', () => {
    it('should return SCORM package for course', async () => {
      const pkg = buildScormPackage({ courseId: 'course-1' });
      prisma.scormPackage.findUnique.mockResolvedValue(pkg);

      const result = await service.getPackageByCourse('course-1');

      expect(result).toEqual(pkg);
    });

    it('should throw NotFoundException if no package found', async () => {
      prisma.scormPackage.findUnique.mockResolvedValue(null);
      await expect(service.getPackageByCourse('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('initAttempt', () => {
    it('should create or resume an attempt and return cmi data', async () => {
      const pkg = buildScormPackage({ id: packageId, version: '1.2', lessonId: 'lesson-1' });
      const attempt = buildScormAttempt({ userId, packageId, lessonStatus: null, suspendData: null });
      prisma.scormPackage.findUnique.mockResolvedValue(pkg);
      prisma.scormAttempt.upsert.mockResolvedValue(attempt);

      const result = await service.initAttempt(userId, packageId, 'lesson-1', 'course-1');

      expect(result).toHaveProperty('attemptId');
      expect(result).toHaveProperty('cmiData');
      expect(result).toHaveProperty('version', '1.2');
      expect(prisma.scormAttempt.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId_packageId: { userId, packageId } },
        }),
      );
    });

    it('should throw NotFoundException if package not found', async () => {
      prisma.scormPackage.findUnique.mockResolvedValue(null);
      await expect(service.initAttempt(userId, 'bad-pkg', 'l1', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateAttempt', () => {
    const attemptId = 'attempt-1';

    it('should update attempt values for owner', async () => {
      const attempt = buildScormAttempt({ id: attemptId, userId });
      prisma.scormAttempt.findUnique.mockResolvedValue(attempt);
      prisma.scormAttempt.update.mockResolvedValue({ ...attempt, location: '5' });

      const result = await service.updateAttempt(attemptId, { 'cmi.core.lesson_location': '5' }, userId);

      expect(prisma.scormAttempt.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if attempt not found', async () => {
      prisma.scormAttempt.findUnique.mockResolvedValue(null);
      await expect(service.updateAttempt('bad-id', {}, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner', async () => {
      prisma.scormAttempt.findUnique.mockResolvedValue(
        buildScormAttempt({ id: attemptId, userId: 'other-user' }),
      );
      await expect(service.updateAttempt(attemptId, {}, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('finishAttempt', () => {
    const attemptId = 'attempt-1';

    it('should mark completed and sync lesson progress when passed', async () => {
      const attempt = buildScormAttempt({
        id: attemptId,
        userId,
        lessonId: 'lesson-1',
        courseId: 'course-1',
        lessonStatus: 'passed',
      });
      prisma.scormAttempt.findUnique.mockResolvedValue({ ...attempt, package: buildScormPackage() });
      prisma.scormAttempt.update.mockResolvedValue({ ...attempt, isCompleted: true });
      prisma.lesson.findUnique.mockResolvedValue({ id: 'lesson-1', courseId: 'course-1' });
      prisma.lessonProgress.upsert.mockResolvedValue({});

      await service.finishAttempt(attemptId, userId);

      expect(prisma.scormAttempt.update).toHaveBeenCalledWith({
        where: { id: attemptId },
        data: { isCompleted: true },
      });
      expect(prisma.lessonProgress.upsert).toHaveBeenCalled();
    });

    it('should not sync lesson progress when not completed', async () => {
      const attempt = buildScormAttempt({
        id: attemptId,
        userId,
        lessonId: 'lesson-1',
        lessonStatus: 'incomplete',
      });
      prisma.scormAttempt.findUnique.mockResolvedValue({ ...attempt, package: buildScormPackage() });
      prisma.scormAttempt.update.mockResolvedValue({ ...attempt, isCompleted: false });

      await service.finishAttempt(attemptId, userId);

      expect(prisma.lessonProgress.upsert).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException for non-owner', async () => {
      prisma.scormAttempt.findUnique.mockResolvedValue({
        ...buildScormAttempt({ id: attemptId, userId: 'other-user' }),
        package: buildScormPackage(),
      });
      await expect(service.finishAttempt(attemptId, userId)).rejects.toThrow(ForbiddenException);
    });
  });
});
