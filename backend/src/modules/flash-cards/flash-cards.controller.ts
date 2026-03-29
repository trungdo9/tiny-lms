import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { FlashCardsService } from './flash-cards.service';
import { CreateDeckDto, UpdateDeckDto, CreateCardDto, UpdateCardDto, CompleteSessionDto } from './dto/flash-card.dto';

// ─── Nested under /lessons/:lessonId ─────────────────────────────────────────

@ApiTags('flash-cards')
@ApiBearerAuth()
@Controller('lessons/:lessonId/flash-cards')
@UseGuards(SupabaseAuthGuard)
export class LessonFlashCardsController {
  constructor(private service: FlashCardsService) { }

  /** Get flash card deck for a lesson. */
  @ApiOperation({ summary: 'Get flash card deck for a lesson' })
  @ApiResponse({ status: 200, description: 'Flash card deck' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  @Get()
  findByLesson(@Param('lessonId') lessonId: string) {
    return this.service.findByLesson(lessonId);
  }

  /** Create flash card deck for a lesson. */
  @ApiOperation({ summary: 'Create a flash card deck for a lesson' })
  @ApiResponse({ status: 201, description: 'Deck created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  @Post()
  create(
    @Request() req: any,
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateDeckDto,
  ) {
    return this.service.createDeck(req.user.id, lessonId, dto, req.user.role);
  }

  /** Update flash card deck. */
  @ApiOperation({ summary: 'Update the flash card deck for a lesson' })
  @ApiResponse({ status: 200, description: 'Deck updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  @Put()
  update(
    @Request() req: any,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateDeckDto,
  ) {
    return this.service.updateDeck(req.user.id, lessonId, dto, req.user.role);
  }

  /** Delete flash card deck. */
  @ApiOperation({ summary: 'Delete the flash card deck for a lesson' })
  @ApiResponse({ status: 200, description: 'Deck deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  @Delete()
  delete(@Request() req: any, @Param('lessonId') lessonId: string) {
    return this.service.deleteDeck(req.user.id, lessonId, req.user.role);
  }
}

// ─── Standalone /flash-cards-deck routes ───────────────────────────────────────

@ApiTags('flash-cards')
@ApiBearerAuth()
@Controller('flash-cards-deck')
@UseGuards(SupabaseAuthGuard)
export class FlashCardsController {
  constructor(private service: FlashCardsService) { }

  /** Get all flash card decks for instructor. */
  @ApiOperation({ summary: 'List all flash card decks for the current instructor' })
  @ApiResponse({ status: 200, description: 'List of decks' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  findAll(@Request() req: any) {
    return this.service.findAllByInstructor(req.user.id, req.user.role);
  }

  /** Get all cards in a deck. */
  @ApiOperation({ summary: 'Get all cards in a deck' })
  @ApiResponse({ status: 200, description: 'List of cards' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  @Get(':deckId/cards')
  getCards(@Param('deckId') deckId: string) {
    return this.service.getCards(deckId);
  }

  /** Add a card to a deck. */
  @ApiOperation({ summary: 'Add a card to a deck' })
  @ApiResponse({ status: 201, description: 'Card added' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  @Post(':deckId/cards')
  addCard(
    @Request() req: any,
    @Param('deckId') deckId: string,
    @Body() dto: CreateCardDto,
  ) {
    return this.service.createCard(req.user.id, deckId, dto, req.user.role);
  }

  /** Update a card. */
  @ApiOperation({ summary: 'Update a flash card' })
  @ApiResponse({ status: 200, description: 'Card updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  @Put('cards/:cardId')
  updateCard(
    @Request() req: any,
    @Param('cardId') cardId: string,
    @Body() dto: UpdateCardDto,
  ) {
    return this.service.updateCard(req.user.id, cardId, dto, req.user.role);
  }

  /** Delete a card. */
  @ApiOperation({ summary: 'Delete a flash card' })
  @ApiResponse({ status: 200, description: 'Card deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  @Delete('cards/:cardId')
  deleteCard(@Request() req: any, @Param('cardId') cardId: string) {
    return this.service.deleteCard(req.user.id, cardId, req.user.role);
  }

  /** Reorder cards in a deck. */
  @ApiOperation({ summary: 'Reorder cards within a deck' })
  @ApiResponse({ status: 200, description: 'Cards reordered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  @Put(':deckId/cards/reorder')
  reorderCards(
    @Request() req: any,
    @Param('deckId') deckId: string,
    @Body() body: { cardIds: string[] },
  ) {
    return this.service.reorderCards(req.user.id, deckId, body.cardIds, req.user.role);
  }

  /** Start a study session. */
  @ApiOperation({ summary: 'Start a flash card study session' })
  @ApiResponse({ status: 201, description: 'Session started' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  @Post(':deckId/start')
  startSession(@Request() req: any, @Param('deckId') deckId: string) {
    return this.service.startSession(req.user.id, deckId);
  }

  /** Get user's study history for a deck. */
  @ApiOperation({ summary: 'Get study history for a deck' })
  @ApiResponse({ status: 200, description: 'Study history' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  @Get(':deckId/history')
  getHistory(@Request() req: any, @Param('deckId') deckId: string) {
    return this.service.getHistory(req.user.id, deckId);
  }
}

// ─── Session routes ────────────────────────────────────────────────────────────

@ApiTags('flash-cards')
@ApiBearerAuth()
@Controller('flash-cards-sessions')
@UseGuards(SupabaseAuthGuard)
export class FlashCardsSessionController {
  constructor(private service: FlashCardsService) { }

  /** Complete a study session. */
  @ApiOperation({ summary: 'Complete a flash card study session' })
  @ApiResponse({ status: 201, description: 'Session completed' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @Post(':sessionId/complete')
  complete(
    @Request() req: any,
    @Param('sessionId') sessionId: string,
    @Body() dto: CompleteSessionDto,
  ) {
    return this.service.completeSession(req.user.id, sessionId, dto);
  }
}
