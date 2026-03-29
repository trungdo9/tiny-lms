import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FlashCardsService } from './flash-cards.service';
import { PrismaService } from '../../common/prisma.service';
import { createMockPrismaService, MockPrismaService } from '../../../test/helpers/mock-prisma';
import { buildFlashCardDeck, buildFlashCard } from '../../../test/helpers/mock-factories';

describe('FlashCardsService', () => {
  let service: FlashCardsService;
  let prisma: MockPrismaService;

  const userId = 'user-1';
  const lessonId = 'lesson-1';
  const deckId = 'deck-1';

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlashCardsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<FlashCardsService>(FlashCardsService);
  });

  describe('findByLesson', () => {
    it('should return deck with cards', async () => {
      const deck = buildFlashCardDeck({ lessonId, cards: [buildFlashCard()] });
      prisma.flashCardDeck.findUnique.mockResolvedValue(deck);

      const result = await service.findByLesson(lessonId);

      expect(result).toEqual(deck);
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException if deck not found', async () => {
      prisma.flashCardDeck.findUnique.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createDeck', () => {
    const dto = { title: 'Test Deck', description: 'Desc' };

    it('should create deck for lesson owner', async () => {
      prisma.lesson.findUnique.mockResolvedValue({
        id: lessonId,
        course: { id: 'course-1', instructorId: userId },
        section: { id: 'section-1' },
      });
      prisma.flashCardDeck.findUnique.mockResolvedValue(null); // no existing deck
      prisma.flashCardDeck.create.mockResolvedValue(buildFlashCardDeck(dto));

      const result = await service.createDeck(userId, lessonId, dto as any, 'instructor');

      expect(result.title).toBe('Test Deck');
    });

    it('should allow admin to create deck for any course', async () => {
      prisma.lesson.findUnique.mockResolvedValue({
        id: lessonId,
        course: { id: 'course-1', instructorId: 'other-user' },
        section: { id: 'section-1' },
      });
      prisma.flashCardDeck.findUnique.mockResolvedValue(null);
      prisma.flashCardDeck.create.mockResolvedValue(buildFlashCardDeck(dto));

      await expect(service.createDeck(userId, lessonId, dto as any, 'admin')).resolves.toBeDefined();
    });

    it('should throw ForbiddenException if not course owner', async () => {
      prisma.lesson.findUnique.mockResolvedValue({
        id: lessonId,
        course: { id: 'course-1', instructorId: 'other-user' },
        section: { id: 'section-1' },
      });

      await expect(service.createDeck(userId, lessonId, dto as any, 'student')).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if deck already exists', async () => {
      prisma.lesson.findUnique.mockResolvedValue({
        id: lessonId,
        course: { id: 'course-1', instructorId: userId },
        section: { id: 'section-1' },
      });
      prisma.flashCardDeck.findUnique.mockResolvedValue(buildFlashCardDeck());

      await expect(service.createDeck(userId, lessonId, dto as any, 'instructor')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if lesson not found', async () => {
      prisma.lesson.findUnique.mockResolvedValue(null);
      await expect(service.createDeck(userId, lessonId, dto as any, 'instructor')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateDeck', () => {
    it('should throw BadRequestException when publishing deck with no cards', async () => {
      prisma.flashCardDeck.findUnique.mockResolvedValue({
        ...buildFlashCardDeck({ lessonId }),
        lesson: { course: { instructorId: userId } },
        cards: [],
      });

      await expect(
        service.updateDeck(userId, lessonId, { isPublished: true } as any, 'instructor'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteDeck', () => {
    it('should delete deck owned by instructor', async () => {
      prisma.flashCardDeck.findUnique.mockResolvedValue({
        ...buildFlashCardDeck({ id: deckId, lessonId }),
        lesson: { course: { instructorId: userId } },
      });
      prisma.flashCardDeck.delete.mockResolvedValue({});

      const result = await service.deleteDeck(userId, lessonId, 'instructor');

      expect(result).toEqual({ success: true });
    });

    it('should throw ForbiddenException for non-owner', async () => {
      prisma.flashCardDeck.findUnique.mockResolvedValue({
        ...buildFlashCardDeck({ lessonId }),
        lesson: { course: { instructorId: 'other-user' } },
      });

      await expect(service.deleteDeck(userId, lessonId, 'student')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createCard', () => {
    it('should create card with auto-increment order', async () => {
      prisma.flashCardDeck.findUnique.mockResolvedValue({
        ...buildFlashCardDeck({ id: deckId }),
        lesson: { course: { instructorId: userId } },
      });
      prisma.flashCard.aggregate.mockResolvedValue({ _max: { orderIndex: 2 } });
      prisma.flashCard.create.mockResolvedValue(buildFlashCard({ orderIndex: 3 }));

      const result = await service.createCard(userId, deckId, { front: 'Q?', back: 'A' } as any, 'instructor');

      expect(prisma.flashCard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ orderIndex: 3 }),
        }),
      );
    });
  });

  describe('startSession', () => {
    it('should create session for published deck', async () => {
      const cards = [buildFlashCard({ id: 'c1' }), buildFlashCard({ id: 'c2' })];
      prisma.flashCardDeck.findUnique.mockResolvedValue({
        ...buildFlashCardDeck({ id: deckId, isPublished: true, shuffleCards: false }),
        cards,
      });
      prisma.flashCardSession.create.mockResolvedValue({ id: 'session-1', totalCards: 2 });

      const result = await service.startSession(userId, deckId);

      expect(result.sessionId).toBe('session-1');
      expect(result.totalCards).toBe(2);
      expect(result.cards).toHaveLength(2);
    });

    it('should throw BadRequestException for unpublished deck', async () => {
      prisma.flashCardDeck.findUnique.mockResolvedValue({
        ...buildFlashCardDeck({ id: deckId, isPublished: false }),
        cards: [],
      });

      await expect(service.startSession(userId, deckId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('completeSession', () => {
    it('should complete session owned by user', async () => {
      const session = { id: 'session-1', userId, totalCards: 10 };
      prisma.flashCardSession.findUnique.mockResolvedValue(session);
      prisma.flashCardSession.update.mockResolvedValue({ ...session, knownCards: 8, unknownCards: 2 });

      const result = await service.completeSession(userId, 'session-1', { knownCards: 8, timeSpentSecs: 120 } as any);

      expect(prisma.flashCardSession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ knownCards: 8, unknownCards: 2 }),
        }),
      );
    });

    it('should throw ForbiddenException for other user session', async () => {
      prisma.flashCardSession.findUnique.mockResolvedValue({ id: 'session-1', userId: 'other-user', totalCards: 5 });

      await expect(
        service.completeSession(userId, 'session-1', { knownCards: 3, timeSpentSecs: 60 } as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('reorderCards', () => {
    it('should reorder cards in a transaction', async () => {
      prisma.flashCardDeck.findUnique.mockResolvedValue({
        ...buildFlashCardDeck({ id: deckId }),
        lesson: { course: { instructorId: userId } },
      });

      await service.reorderCards(userId, deckId, ['c1', 'c2', 'c3'], 'instructor');

      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
