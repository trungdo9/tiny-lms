import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AttemptsService } from './attempts.service';

function makePrisma(quizOverrides: any = {}) {
  const quiz = {
    id: 'quiz-1',
    isPublished: true,
    availableFrom: null,
    availableUntil: null,
    maxAttempts: null,
    shuffleQuestions: false,
    shuffleAnswers: false,
    paginationMode: 'all',
    questionsPerPage: null,
    timeLimitMinutes: null,
    showCorrectAnswer: false,
    questions: [],
    ...quizOverrides,
  };

  const attempt = {
    id: 'attempt-1',
    userId: 'user-1',
    status: 'in_progress',
    quiz: { ...quiz, showCorrectAnswer: false, questions: [] },
    attemptQuestions: [],
    answers: [],
  };

  return {
    quiz: { findUnique: jest.fn().mockResolvedValue(quiz) },
    quizAttempt: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue({ id: 'attempt-1' }),
      findUnique: jest.fn().mockResolvedValue(attempt),
    },
    attemptQuestion: {
      create: jest.fn().mockResolvedValue({}),
    },
  } as any;
}

function makeQuestion(id: string, difficulty: string) {
  return {
    id,
    content: `Question ${id}`,
    difficulty,
    type: 'single',
    options: [],
    tags: [],
  };
}

describe('AttemptsService — difficultyFilter random-pick', () => {
  it('picks only easy questions when difficultyFilter is easy', async () => {
    const bankQuestions = [
      makeQuestion('q-easy-1', 'easy'),
      makeQuestion('q-easy-2', 'easy'),
      makeQuestion('q-medium-1', 'medium'),
      makeQuestion('q-hard-1', 'hard'),
    ];

    const prisma = makePrisma({
      questions: [
        {
          id: 'qq-1',
          question: null,
          bankId: 'bank-1',
          pickCount: 2,
          difficultyFilter: 'easy',
          tagFilter: [],
          orderIndex: 0,
          bank: { questions: bankQuestions },
        },
      ],
    });

    const service = new AttemptsService(prisma);
    await service.start('quiz-1', 'user-1');

    const pickedIds = prisma.attemptQuestion.create.mock.calls.map((c: any) => c[0].data.questionId);
    expect(pickedIds).toHaveLength(2);
    pickedIds.forEach((id: string) => expect(id).toMatch(/^q-easy-/));
  });

  it('picks only hard questions when difficultyFilter is hard', async () => {
    const bankQuestions = [
      makeQuestion('q-easy-1', 'easy'),
      makeQuestion('q-hard-1', 'hard'),
      makeQuestion('q-hard-2', 'hard'),
      makeQuestion('q-hard-3', 'hard'),
    ];

    const prisma = makePrisma({
      questions: [
        {
          id: 'qq-1',
          question: null,
          bankId: 'bank-1',
          pickCount: 2,
          difficultyFilter: 'hard',
          tagFilter: [],
          orderIndex: 0,
          bank: { questions: bankQuestions },
        },
      ],
    });

    const service = new AttemptsService(prisma);
    await service.start('quiz-1', 'user-1');

    const pickedIds = prisma.attemptQuestion.create.mock.calls.map((c: any) => c[0].data.questionId);
    expect(pickedIds).toHaveLength(2);
    pickedIds.forEach((id: string) => expect(id).toMatch(/^q-hard-/));
  });

  it('picks from all difficulties when difficultyFilter is null', async () => {
    const bankQuestions = [
      makeQuestion('q-easy-1', 'easy'),
      makeQuestion('q-medium-1', 'medium'),
      makeQuestion('q-hard-1', 'hard'),
    ];

    const prisma = makePrisma({
      questions: [
        {
          id: 'qq-1',
          question: null,
          bankId: 'bank-1',
          pickCount: 3,
          difficultyFilter: null,
          tagFilter: [],
          orderIndex: 0,
          bank: { questions: bankQuestions },
        },
      ],
    });

    const service = new AttemptsService(prisma);
    await service.start('quiz-1', 'user-1');

    expect(prisma.attemptQuestion.create.mock.calls).toHaveLength(3);
    const pickedIds = prisma.attemptQuestion.create.mock.calls.map((c: any) => c[0].data.questionId);
    expect(pickedIds).toContain('q-easy-1');
    expect(pickedIds).toContain('q-medium-1');
    expect(pickedIds).toContain('q-hard-1');
  });

  it('creates no attemptQuestions when difficultyFilter matches nothing', async () => {
    const bankQuestions = [
      makeQuestion('q-easy-1', 'easy'),
      makeQuestion('q-easy-2', 'easy'),
    ];

    const prisma = makePrisma({
      questions: [
        {
          id: 'qq-1',
          question: null,
          bankId: 'bank-1',
          pickCount: 2,
          difficultyFilter: 'hard',
          tagFilter: [],
          orderIndex: 0,
          bank: { questions: bankQuestions },
        },
      ],
    });

    const service = new AttemptsService(prisma);
    await service.start('quiz-1', 'user-1');

    expect(prisma.attemptQuestion.create.mock.calls).toHaveLength(0);
  });

  it('throws NotFoundException when quiz does not exist', async () => {
    const prisma = {
      quiz: { findUnique: jest.fn().mockResolvedValue(null) },
      quizAttempt: { count: jest.fn() },
    } as any;

    const service = new AttemptsService(prisma);
    await expect(service.start('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when quiz is not published', async () => {
    const prisma = makePrisma({ isPublished: false });
    const service = new AttemptsService(prisma);
    await expect(service.start('quiz-1', 'user-1')).rejects.toThrow(BadRequestException);
  });
});
