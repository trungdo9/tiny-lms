import { BadRequestException } from '@nestjs/common';
import { QuestionsService } from './questions.service';

function makePrisma(overrides: any = {}) {
  return {
    questionBank: {
      findUnique: jest.fn().mockResolvedValue({ id: 'bank-1', createdBy: 'user-1' }),
    },
    question: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'q-new', ...data })),
      findUnique: jest.fn().mockResolvedValue({
        id: 'q-1',
        difficulty: 'medium',
        bank: { createdBy: 'user-1' },
      }),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'q-1', ...data })),
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn().mockResolvedValue([]),
    },
    $transaction: jest.fn().mockImplementation((arg) => {
      if (Array.isArray(arg)) return Promise.all(arg);
      return arg({
        questionOption: { deleteMany: jest.fn(), createMany: jest.fn() },
        question: {
          update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'q-1', ...data })),
        },
      });
    }),
    ...overrides,
  } as any;
}

const BASE_DTO = {
  type: 'short_answer' as const,
  content: 'What is 2+2?',
};

describe('QuestionsService — difficulty normalization on write', () => {
  describe('create', () => {
    it('normalizes alias beginner → easy on create', async () => {
      const prisma = makePrisma();
      const service = new QuestionsService(prisma);
      await service.create('bank-1', 'user-1', 'instructor', { ...BASE_DTO, difficulty: 'beginner' });
      const createArg = prisma.question.create.mock.calls[0][0];
      expect(createArg.data.difficulty).toBe('easy');
    });

    it('normalizes alias intermediate → medium on create', async () => {
      const prisma = makePrisma();
      const service = new QuestionsService(prisma);
      await service.create('bank-1', 'user-1', 'instructor', { ...BASE_DTO, difficulty: 'intermediate' });
      const createArg = prisma.question.create.mock.calls[0][0];
      expect(createArg.data.difficulty).toBe('medium');
    });

    it('normalizes alias advanced → hard on create', async () => {
      const prisma = makePrisma();
      const service = new QuestionsService(prisma);
      await service.create('bank-1', 'user-1', 'instructor', { ...BASE_DTO, difficulty: 'advanced' });
      const createArg = prisma.question.create.mock.calls[0][0];
      expect(createArg.data.difficulty).toBe('hard');
    });

    it('defaults to medium when difficulty is undefined', async () => {
      const prisma = makePrisma();
      const service = new QuestionsService(prisma);
      await service.create('bank-1', 'user-1', 'instructor', { ...BASE_DTO });
      const createArg = prisma.question.create.mock.calls[0][0];
      expect(createArg.data.difficulty).toBe('medium');
    });

    it('preserves canonical easy unchanged', async () => {
      const prisma = makePrisma();
      const service = new QuestionsService(prisma);
      await service.create('bank-1', 'user-1', 'instructor', { ...BASE_DTO, difficulty: 'easy' });
      const createArg = prisma.question.create.mock.calls[0][0];
      expect(createArg.data.difficulty).toBe('easy');
    });

    it('throws BadRequestException for unknown difficulty on create', async () => {
      const prisma = makePrisma();
      const service = new QuestionsService(prisma);
      await expect(
        service.create('bank-1', 'user-1', 'instructor', { ...BASE_DTO, difficulty: 'extreme' })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkCreate', () => {
    it('normalizes all difficulty aliases in bulk create', async () => {
      const prisma = makePrisma();
      const service = new QuestionsService(prisma);

      await service.bulkCreate('bank-1', 'user-1', 'instructor', [
        { ...BASE_DTO, difficulty: 'beginner' },
        { ...BASE_DTO, difficulty: 'normal' },
        { ...BASE_DTO, difficulty: 'difficult' },
      ]);

      const txArg = prisma.$transaction.mock.calls[0][0];
      // $transaction receives an array of Prisma operations — each is a Promise from question.create
      // We verify by checking the create calls
      const calls = prisma.question.create.mock.calls;
      expect(calls[0][0].data.difficulty).toBe('easy');
      expect(calls[1][0].data.difficulty).toBe('medium');
      expect(calls[2][0].data.difficulty).toBe('hard');
    });

    it('throws BadRequestException for unknown difficulty in bulk create', async () => {
      const prisma = makePrisma();
      const service = new QuestionsService(prisma);
      await expect(
        service.bulkCreate('bank-1', 'user-1', 'instructor', [
          { ...BASE_DTO, difficulty: 'ultra' },
        ])
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('normalizes alias beginner → easy on update', async () => {
      const prisma = makePrisma();
      const service = new QuestionsService(prisma);
      await service.update('q-1', 'user-1', 'instructor', { difficulty: 'beginner' });
      // update goes through $transaction — check the update call in mock tx
      // The mock $transaction calls the function with a tx object
      // Check that the result has difficulty: 'easy'
      const txFn = prisma.$transaction.mock.calls[0][0];
      // verify by checking that the tx.question.update was called with easy
      // Since the mock returns the data, let's verify the result
      const result = await service.update('q-1', 'user-1', 'instructor', { difficulty: 'beginner' });
      expect(result.difficulty).toBe('easy');
    });

    it('leaves difficulty undefined when not provided on update', async () => {
      const prisma = makePrisma();
      const service = new QuestionsService(prisma);
      const result = await service.update('q-1', 'user-1', 'instructor', { content: 'Updated content' });
      // difficulty should be undefined in update data (normalizeOptionalQuestionDifficulty(undefined) = undefined)
      expect(result.difficulty).toBeUndefined();
    });

    it('throws BadRequestException for unknown difficulty on update', async () => {
      const prisma = makePrisma();
      const service = new QuestionsService(prisma);
      await expect(
        service.update('q-1', 'user-1', 'instructor', { difficulty: 'legendary' })
      ).rejects.toThrow(BadRequestException);
    });
  });
});
