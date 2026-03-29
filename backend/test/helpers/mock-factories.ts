/**
 * Factory functions for creating test data objects.
 */
import { Prisma } from '@prisma/client';
const { Decimal } = Prisma;

let counter = 0;
function nextId() {
  counter++;
  return `00000000-0000-0000-0000-${String(counter).padStart(12, '0')}`;
}

export function resetFactoryCounter() {
  counter = 0;
}

export function buildUser(overrides: Record<string, any> = {}) {
  const id = overrides.id || nextId();
  return {
    id,
    email: `user-${id.slice(-4)}@test.com`,
    fullName: 'Test User',
    role: 'student',
    isActive: true,
    avatarUrl: null,
    departmentId: null,
    emailVerified: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function buildCourse(overrides: Record<string, any> = {}) {
  const id = overrides.id || nextId();
  return {
    id,
    title: 'Test Course',
    slug: 'test-course',
    description: 'A test course',
    shortDescription: 'Test',
    instructorId: overrides.instructorId || nextId(),
    categoryId: null,
    status: 'published',
    level: 'beginner',
    price: new Decimal(0),
    thumbnailUrl: null,
    averageRating: null,
    totalReviews: 0,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function buildEnrollment(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id || nextId(),
    userId: overrides.userId || nextId(),
    courseId: overrides.courseId || nextId(),
    status: 'active',
    enrolledAt: new Date('2026-01-01'),
    completedAt: null,
    ...overrides,
  };
}

export function buildReview(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id || nextId(),
    courseId: overrides.courseId || nextId(),
    userId: overrides.userId || nextId(),
    rating: 5,
    comment: 'Great course!',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function buildEmailTemplate(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id || nextId(),
    slug: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to {{site_name}}!',
    body: '<p>Hello {{user_name}}</p>',
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function buildSetting(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id || nextId(),
    key: 'site_name',
    value: 'Tiny LMS',
    type: 'string',
    category: 'general',
    isSecret: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function buildFlashCardDeck(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id || nextId(),
    lessonId: overrides.lessonId || nextId(),
    title: 'Test Deck',
    description: 'A test deck',
    status: 'draft',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function buildFlashCard(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id || nextId(),
    deckId: overrides.deckId || nextId(),
    front: 'Question?',
    back: 'Answer',
    order: 0,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function buildPayment(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id || nextId(),
    userId: overrides.userId || nextId(),
    courseId: overrides.courseId || nextId(),
    amount: new Decimal(100000),
    status: 'pending',
    paymentCode: 'TL1234567890',
    transactionId: null,
    paidAt: null,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function buildOrganization(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id || nextId(),
    name: 'Test Organization',
    slug: 'test-organization',
    description: 'A test organization',
    logoUrl: null,
    website: null,
    email: null,
    phone: null,
    address: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function buildDepartment(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id || nextId(),
    name: 'Test Department',
    slug: 'test-department',
    description: 'A test department',
    organizationId: overrides.organizationId || nextId(),
    parentId: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function buildScormPackage(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id || nextId(),
    lessonId: overrides.lessonId || null,
    courseId: overrides.courseId || null,
    title: 'SCORM Package',
    version: '1.2',
    entryPoint: 'index.html',
    storagePath: '/uploads/scorm/test-package',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function buildScormAttempt(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id || nextId(),
    userId: overrides.userId || nextId(),
    packageId: overrides.packageId || nextId(),
    lessonId: overrides.lessonId || null,
    courseId: overrides.courseId || null,
    status: 'not attempted',
    score: null,
    totalTime: null,
    suspendData: null,
    location: null,
    completionStatus: null,
    successStatus: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function buildLearningPath(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id || nextId(),
    title: 'Test Learning Path',
    slug: 'test-learning-path',
    description: 'A test learning path',
    thumbnailUrl: null,
    createdBy: overrides.createdBy || nextId(),
    isPublished: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function buildAssignment(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id || nextId(),
    activityId: overrides.activityId || nextId(),
    instructions: 'Submit your work',
    maxScore: new Decimal(100),
    dueDate: null,
    allowLateSubmission: false,
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc'],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function buildLesson(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id || nextId(),
    sectionId: overrides.sectionId || nextId(),
    courseId: overrides.courseId || nextId(),
    title: 'Test Lesson',
    type: 'video',
    content: null,
    videoUrl: null,
    videoProvider: null,
    pdfUrl: null,
    durationMins: null,
    orderIndex: 0,
    isPreview: false,
    isPublished: true,
    prerequisiteLessonId: null,
    availableAfterDays: null,
    availableFrom: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}
