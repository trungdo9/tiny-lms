/**
 * Creates a deep mock of PrismaService with all model methods.
 * Each model gets: findUnique, findFirst, findMany, create, update, delete,
 * upsert, count, aggregate, groupBy, updateMany, deleteMany
 */
export function createMockPrismaService() {
  const modelMethods = [
    'findUnique',
    'findFirst',
    'findMany',
    'create',
    'update',
    'delete',
    'upsert',
    'count',
    'aggregate',
    'groupBy',
    'updateMany',
    'deleteMany',
  ];

  const models = [
    'profile',
    'course',
    'courseCategory',
    'courseInstructor',
    'courseReview',
    'section',
    'lesson',
    'lessonProgress',
    'enrollment',
    'quiz',
    'quizQuestion',
    'quizAttempt',
    'quizAnswer',
    'questionBank',
    'question',
    'certificate',
    'notification',
    'setting',
    'emailTemplate',
    'emailLog',
    'flashCardDeck',
    'flashCard',
    'flashCardSession',
    'activity',
    'payment',
    'organization',
    'department',
    'scormPackage',
    'scormAttempt',
    'learningPath',
    'learningPathCourse',
    'assignment',
    'assignmentSubmission',
    'category',
    'questionOption',
    'attemptQuestion',
    'contactSyncLog',
  ];

  const mock: Record<string, any> = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn((arg) => {
      if (typeof arg === 'function') {
        // For interactive transactions, pass the mock itself as the tx client
        return arg(mock);
      }
      // For batch transactions (array of promises)
      return Promise.all(arg);
    }),
    $queryRaw: jest.fn().mockResolvedValue([]),
    $executeRaw: jest.fn().mockResolvedValue(0),
  };

  for (const model of models) {
    mock[model] = {};
    for (const method of modelMethods) {
      mock[model][method] = jest.fn();
    }
  }

  return mock;
}

export type MockPrismaService = ReturnType<typeof createMockPrismaService>;
