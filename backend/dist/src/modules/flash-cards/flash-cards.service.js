"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlashCardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let FlashCardsService = class FlashCardsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByLesson(lessonId) {
        return this.prisma.flashCardDeck.findFirst({
            where: { activity: { lessonId } },
            include: {
                cards: { orderBy: { orderIndex: 'asc' } },
            },
        });
    }
    async findById(deckId) {
        const deck = await this.prisma.flashCardDeck.findUnique({
            where: { id: deckId },
            include: {
                cards: { orderBy: { orderIndex: 'asc' } },
            },
        });
        if (!deck)
            throw new common_1.NotFoundException('Deck not found');
        return deck;
    }
    async findAllByInstructor(userId, userRole = 'student') {
        const courses = await this.prisma.course.findMany({
            where: userRole === 'admin' ? {} : { instructorId: userId },
            select: { id: true },
        });
        const courseIds = courses.map((c) => c.id);
        const lessons = await this.prisma.lesson.findMany({
            where: { courseId: { in: courseIds } },
            select: { id: true, title: true, courseId: true },
        });
        const lessonIds = lessons.map((l) => l.id);
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
    async createDeck(userId, lessonId, dto, userRole = 'student') {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                section: { select: { id: true } },
                course: { select: { id: true, instructorId: true } },
            },
        });
        if (!lesson)
            throw new common_1.NotFoundException('Lesson not found');
        if (userRole !== 'admin' && lesson.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You can only create flash cards for your own courses');
        }
        const existing = await this.prisma.activity.findFirst({ where: { lessonId, activityType: 'flashcard' } });
        if (existing) {
            throw new common_1.BadRequestException('This lesson already has a flash card deck');
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
    async updateDeck(userId, lessonId, dto, userRole = 'student') {
        const deck = await this.prisma.flashCardDeck.findFirst({
            where: { activity: { lessonId } },
            include: {
                activity: { include: { lesson: { include: { course: true } } } },
                cards: true,
            },
        });
        if (!deck)
            throw new common_1.NotFoundException('Deck not found');
        if (userRole !== 'admin' && deck.activity?.lesson.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You can only edit your own flash cards');
        }
        if (dto.isPublished && deck.cards.length === 0) {
            throw new common_1.BadRequestException('Cannot publish deck with no cards');
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
    async deleteDeck(userId, lessonId, userRole = 'student') {
        const deck = await this.prisma.flashCardDeck.findFirst({
            where: { activity: { lessonId } },
            include: { activity: { include: { lesson: { include: { course: true } } } } },
        });
        if (!deck)
            throw new common_1.NotFoundException('Deck not found');
        if (userRole !== 'admin' && deck.activity?.lesson.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own flash cards');
        }
        await this.prisma.activity.delete({ where: { id: deck.activityId } });
        return { success: true };
    }
    async getCards(deckId) {
        return this.prisma.flashCard.findMany({
            where: { deckId },
            orderBy: { orderIndex: 'asc' },
        });
    }
    async createCard(userId, deckId, dto, userRole = 'student') {
        const deck = await this.prisma.flashCardDeck.findUnique({
            where: { id: deckId },
            include: { activity: { include: { lesson: { include: { course: true } } } } },
        });
        if (!deck)
            throw new common_1.NotFoundException('Deck not found');
        if (userRole !== 'admin' && deck.activity?.lesson.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You can only add cards to your own decks');
        }
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
    async updateCard(userId, cardId, dto, userRole = 'student') {
        const card = await this.prisma.flashCard.findUnique({
            where: { id: cardId },
            include: { deck: { include: { activity: { include: { lesson: { include: { course: true } } } } } } },
        });
        if (!card)
            throw new common_1.NotFoundException('Card not found');
        if (userRole !== 'admin' && card.deck.activity?.lesson.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You can only edit your own cards');
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
    async deleteCard(userId, cardId, userRole = 'student') {
        const card = await this.prisma.flashCard.findUnique({
            where: { id: cardId },
            include: { deck: { include: { activity: { include: { lesson: { include: { course: true } } } } } } },
        });
        if (!card)
            throw new common_1.NotFoundException('Card not found');
        if (userRole !== 'admin' && card.deck.activity?.lesson.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own cards');
        }
        await this.prisma.flashCard.delete({ where: { id: cardId } });
        return { success: true };
    }
    async reorderCards(userId, deckId, cardIds, userRole = 'student') {
        const deck = await this.prisma.flashCardDeck.findUnique({
            where: { id: deckId },
            include: { activity: { include: { lesson: { include: { course: true } } } } },
        });
        if (!deck)
            throw new common_1.NotFoundException('Deck not found');
        if (userRole !== 'admin' && deck.activity?.lesson.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You can only reorder your own cards');
        }
        await this.prisma.$transaction(cardIds.map((id, index) => this.prisma.flashCard.update({
            where: { id },
            data: { orderIndex: index },
        })));
        return { success: true };
    }
    async startSession(userId, deckId) {
        const deck = await this.prisma.flashCardDeck.findUnique({
            where: { id: deckId },
            include: { cards: true },
        });
        if (!deck)
            throw new common_1.NotFoundException('Deck not found');
        if (!deck.isPublished) {
            throw new common_1.BadRequestException('Cannot study unpublished deck');
        }
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
    async completeSession(userId, sessionId, dto) {
        const session = await this.prisma.flashCardSession.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.userId !== userId) {
            throw new common_1.ForbiddenException('This session does not belong to you');
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
    async getHistory(userId, deckId) {
        return this.prisma.flashCardSession.findMany({
            where: { deckId, userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }
};
exports.FlashCardsService = FlashCardsService;
exports.FlashCardsService = FlashCardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FlashCardsService);
//# sourceMappingURL=flash-cards.service.js.map