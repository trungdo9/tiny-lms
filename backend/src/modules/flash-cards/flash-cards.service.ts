import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateDeckDto, UpdateDeckDto, CreateCardDto, UpdateCardDto, CompleteSessionDto } from './dto/flash-card.dto';

@Injectable()
export class FlashCardsService {
  constructor(private prisma: PrismaService) { }

  // ─── Deck Operations ───────────────────────────────────────────────────────

  async findByLesson(lessonId: string) {
    return this.prisma.flashCardDeck.findFirst({
      where: { activity: { lessonId } },
      include: {
        cards: { orderBy: { orderIndex: 'asc' } },
      },
    });
  }

  async findById(deckId: string) {
    const deck = await this.prisma.flashCardDeck.findUnique({
      where: { id: deckId },
      include: {
        cards: { orderBy: { orderIndex: 'asc' } },
      },
    });
    if (!deck) throw new NotFoundException('Deck not found');
    return deck;
  }

  async findAllByInstructor(userId: string, userRole: string = 'student') {
    // Get all courses owned by instructor (admin sees all)
    const courses = await this.prisma.course.findMany({
      where: userRole === 'admin' ? {} : { instructorId: userId },
      select: { id: true },
    });
    const courseIds = courses.map((c) => c.id);

    // Get all lessons from those courses
    const lessons = await this.prisma.lesson.findMany({
      where: { courseId: { in: courseIds } },
      select: { id: true, title: true, courseId: true },
    });
    const lessonIds = lessons.map((l) => l.id);

    // Get all flash card decks for these lessons
    const decks = await this.prisma.flashCardDeck.findMany({
      where: { activity: { lessonId: { in: lessonIds } } },
      include: {
        cards: { select: { id: true } },
        activity: { select: { lesson: { select: { title: true, courseId: true, id: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return decks.map((deck) => ({
      id: deck.id,
      title: deck.title,
      description: deck.description,
      is_published: deck.isPublished,
      card_count: deck.cards.length,
      lesson_title: deck.activity?.lesson.title,
      lesson_id: deck.activity?.lesson.id,
      course_id: deck.activity?.lesson.courseId,
      created_at: deck.createdAt,
    }));
  }

  async createDeck(userId: string, lessonId: string, dto: CreateDeckDto, userRole: string = 'student') {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: { select: { id: true } },
        course: { select: { id: true, instructorId: true } },
      },
    });

    if (!lesson) throw new NotFoundException('Lesson not found');
    // Admin can bypass ownership check
    if (userRole !== 'admin' && lesson.course.instructorId !== userId) {
      throw new ForbiddenException('You can only create flash cards for your own courses');
    }

    // Check if deck already exists via activity
    const existing = await this.prisma.activity.findFirst({ where: { lessonId, activityType: 'flashcard' } });
    if (existing) {
      throw new BadRequestException('This lesson already has a flash card deck');
    }

    return this.prisma.$transaction(async (tx) => {
      const activity = await tx.activity.create({
        data: {
          lessonId,
          activityType: 'flashcard',
          title: dto.title,
          isPublished: dto.isPublished ?? false,
        },
      });

      return tx.flashCardDeck.create({
        data: {
          title: dto.title,
          description: dto.description,
          shuffleCards: dto.shuffleCards ?? false,
          isPublished: dto.isPublished ?? false,
          activityId: activity.id,
        },
        include: { cards: { orderBy: { orderIndex: 'asc' } } },
      });
    });
  }

  async updateDeck(userId: string, lessonId: string, dto: UpdateDeckDto, userRole: string = 'student') {
    const deck = await this.prisma.flashCardDeck.findFirst({
      where: { activity: { lessonId } },
      include: {
        activity: { include: { lesson: { include: { course: true } } } },
        cards: true,
      },
    });

    if (!deck) throw new NotFoundException('Deck not found');
    // Admin can bypass ownership check
    if (userRole !== 'admin' && deck.activity?.lesson.course.instructorId !== userId) {
      throw new ForbiddenException('You can only edit your own flash cards');
    }

    // Cannot publish deck with no cards
    if (dto.isPublished && deck.cards.length === 0) {
      throw new BadRequestException('Cannot publish deck with no cards');
    }

    return this.prisma.flashCardDeck.update({
      where: { id: deck.id },
      data: {
        title: dto.title,
        description: dto.description,
        shuffleCards: dto.shuffleCards,
        isPublished: dto.isPublished,
      },
      include: { cards: { orderBy: { orderIndex: 'asc' } } },
    });
  }

  async deleteDeck(userId: string, lessonId: string, userRole: string = 'student') {
    const deck = await this.prisma.flashCardDeck.findFirst({
      where: { activity: { lessonId } },
      include: { activity: { include: { lesson: { include: { course: true } } } } },
    });

    if (!deck) throw new NotFoundException('Deck not found');
    // Admin can bypass ownership check
    if (userRole !== 'admin' && deck.activity?.lesson.course.instructorId !== userId) {
      throw new ForbiddenException('You can only delete your own flash cards');
    }

    // Because activity cascades down to deck, we delete the activity
    await this.prisma.activity.delete({ where: { id: deck.activityId } });
    return { success: true };
  }

  // ─── Card Operations ───────────────────────────────────────────────────────

  async getCards(deckId: string) {
    return this.prisma.flashCard.findMany({
      where: { deckId },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async createCard(userId: string, deckId: string, dto: CreateCardDto, userRole: string = 'student') {
    const deck = await this.prisma.flashCardDeck.findUnique({
      where: { id: deckId },
      include: { activity: { include: { lesson: { include: { course: true } } } } },
    });

    if (!deck) throw new NotFoundException('Deck not found');
    // Admin can bypass ownership check
    if (userRole !== 'admin' && deck.activity?.lesson.course.instructorId !== userId) {
      throw new ForbiddenException('You can only add cards to your own decks');
    }

    // Get max order index
    const maxOrder = await this.prisma.flashCard.aggregate({
      where: { deckId },
      _max: { orderIndex: true },
    });

    return this.prisma.flashCard.create({
      data: {
        front: dto.front,
        back: dto.back,
        hint: dto.hint,
        imageUrl: dto.imageUrl,
        orderIndex: dto.orderIndex ?? (maxOrder._max.orderIndex ?? -1) + 1,
        deckId,
      },
    });
  }

  async updateCard(userId: string, cardId: string, dto: UpdateCardDto, userRole: string = 'student') {
    const card = await this.prisma.flashCard.findUnique({
      where: { id: cardId },
      include: { deck: { include: { activity: { include: { lesson: { include: { course: true } } } } } } },
    });

    if (!card) throw new NotFoundException('Card not found');
    // Admin can bypass ownership check
    if (userRole !== 'admin' && card.deck.activity?.lesson.course.instructorId !== userId) {
      throw new ForbiddenException('You can only edit your own cards');
    }

    return this.prisma.flashCard.update({
      where: { id: cardId },
      data: {
        front: dto.front,
        back: dto.back,
        hint: dto.hint,
        imageUrl: dto.imageUrl,
        orderIndex: dto.orderIndex,
      },
    });
  }

  async deleteCard(userId: string, cardId: string, userRole: string = 'student') {
    const card = await this.prisma.flashCard.findUnique({
      where: { id: cardId },
      include: { deck: { include: { activity: { include: { lesson: { include: { course: true } } } } } } },
    });

    if (!card) throw new NotFoundException('Card not found');
    // Admin can bypass ownership check
    if (userRole !== 'admin' && card.deck.activity?.lesson.course.instructorId !== userId) {
      throw new ForbiddenException('You can only delete your own cards');
    }

    await this.prisma.flashCard.delete({ where: { id: cardId } });
    return { success: true };
  }

  async reorderCards(userId: string, deckId: string, cardIds: string[], userRole: string = 'student') {
    const deck = await this.prisma.flashCardDeck.findUnique({
      where: { id: deckId },
      include: { activity: { include: { lesson: { include: { course: true } } } } },
    });

    if (!deck) throw new NotFoundException('Deck not found');
    // Admin can bypass ownership check
    if (userRole !== 'admin' && deck.activity?.lesson.course.instructorId !== userId) {
      throw new ForbiddenException('You can only reorder your own cards');
    }

    // Update order for each card
    await this.prisma.$transaction(
      cardIds.map((id, index) =>
        this.prisma.flashCard.update({
          where: { id },
          data: { orderIndex: index },
        }),
      ),
    );

    return { success: true };
  }

  // ─── Study Session ─────────────────────────────────────────────────────────

  async startSession(userId: string, deckId: string) {
    const deck = await this.prisma.flashCardDeck.findUnique({
      where: { id: deckId },
      include: { cards: true },
    });

    if (!deck) throw new NotFoundException('Deck not found');
    if (!deck.isPublished) {
      throw new BadRequestException('Cannot study unpublished deck');
    }

    // Shuffle cards if needed
    let cards = deck.cards;
    if (deck.shuffleCards) {
      cards = [...cards].sort(() => Math.random() - 0.5);
    }

    const session = await this.prisma.flashCardSession.create({
      data: {
        deckId,
        userId,
        totalCards: cards.length,
      },
    });

    return {
      sessionId: session.id,
      totalCards: cards.length,
      cards: cards.map((c) => ({ id: c.id, front: c.front, hint: c.hint })),
    };
  }

  async completeSession(userId: string, sessionId: string, dto: CompleteSessionDto) {
    const session = await this.prisma.flashCardSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) {
      throw new ForbiddenException('This session does not belong to you');
    }

    const unknownCards = session.totalCards - dto.knownCards;

    return this.prisma.flashCardSession.update({
      where: { id: sessionId },
      data: {
        knownCards: dto.knownCards,
        unknownCards,
        timeSpentSecs: dto.timeSpentSecs,
        completedAt: new Date(),
      },
    });
  }

  async getHistory(userId: string, deckId: string) {
    return this.prisma.flashCardSession.findMany({
      where: { deckId, userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
