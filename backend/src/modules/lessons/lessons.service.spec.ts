import { Test, TestingModule } from '@nestjs/testing';
import { LessonsService } from './lessons.service';
import { PrismaService } from '../../common/prisma.service';
import { CoursesService } from '../courses/courses.service';
import { createMockPrismaService, MockPrismaService } from '../../../test/helpers/mock-prisma';
import { buildLesson } from '../../../test/helpers/mock-factories';

describe('LessonsService', () => {
  let service: LessonsService;
  let prisma: MockPrismaService;
  let coursesService: { canManageCourse: jest.Mock };

  beforeEach(async () => {
    prisma = createMockPrismaService();
    coursesService = { canManageCourse: jest.fn().mockResolvedValue(true) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonsService,
        { provide: PrismaService, useValue: prisma },
        { provide: CoursesService, useValue: coursesService },
      ],
    }).compile();

    service = module.get<LessonsService>(LessonsService);
  });

  describe('create', () => {
    it('recomputes course.lessonCount after creating a lesson', async () => {
      prisma.section.findUnique.mockResolvedValue({ id: 'section-1', courseId: 'course-1' });
      prisma.lesson.findFirst.mockResolvedValue({ orderIndex: 2 });
      prisma.lesson.create.mockResolvedValue(buildLesson({ id: 'lesson-1', sectionId: 'section-1', courseId: 'course-1', orderIndex: 3 }));
      prisma.lesson.count.mockResolvedValue(4);
      prisma.course.update.mockResolvedValue({ id: 'course-1', lessonCount: 4 });

      const result = await service.create(
        'section-1',
        { title: 'New Lesson', type: 'video' } as any,
        'user-1',
        'instructor',
      );

      expect(prisma.lesson.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          sectionId: 'section-1',
          courseId: 'course-1',
          title: 'New Lesson',
          type: 'video',
          orderIndex: 3,
        }),
      });
      expect(prisma.lesson.count).toHaveBeenCalledWith({ where: { courseId: 'course-1' } });
      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: 'course-1' },
        data: { lessonCount: 4 },
      });
      expect(result.id).toBe('lesson-1');
    });
  });

  describe('delete', () => {
    it('recomputes course.lessonCount after deleting a lesson', async () => {
      prisma.lesson.findUnique.mockResolvedValue(buildLesson({ id: 'lesson-1', courseId: 'course-1', sectionId: 'section-1' }));
      prisma.lesson.delete.mockResolvedValue(buildLesson({ id: 'lesson-1', courseId: 'course-1', sectionId: 'section-1' }));
      prisma.lesson.count.mockResolvedValue(2);
      prisma.course.update.mockResolvedValue({ id: 'course-1', lessonCount: 2 });

      const result = await service.delete('lesson-1', 'user-1', 'instructor');

      expect(prisma.lesson.delete).toHaveBeenCalledWith({ where: { id: 'lesson-1' } });
      expect(prisma.lesson.count).toHaveBeenCalledWith({ where: { courseId: 'course-1' } });
      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: 'course-1' },
        data: { lessonCount: 2 },
      });
      expect(result).toEqual({ success: true });
    });
  });
});
