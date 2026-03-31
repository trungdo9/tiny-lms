import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CourseInstructor {
  id: string;
  role: 'primary' | 'co_instructor';
  addedAt: string;
  profile: { id: string; email: string; fullName: string | null; avatarUrl: string | null };
}

export interface UserSearchResult {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(session?.access_token && {
      Authorization: `Bearer ${session.access_token}`,
    }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'An error occurred');
  }

  return response.json();
}

// Course APIs
export const coursesApi = {
  list: (params?: { page?: number; limit?: number; search?: string; categoryId?: string; level?: string; isFree?: boolean; status?: string }) =>
    fetchApi(`/courses?${new URLSearchParams(params as any).toString()}`),

  get: (id: string) => fetchApi(`/courses/${id}`),

  getMyCourses: () => fetchApi<any[]>('/courses/my-courses'),

  getInstructorCourses: (params?: { search?: string; status?: string }) => {
    const qs = params ? new URLSearchParams(Object.entries(params).filter(([, v]) => v) as string[][]).toString() : '';
    return fetchApi<any[]>(`/courses/instructor${qs ? `?${qs}` : ''}`);
  },

  create: (data: { title: string; description?: string; thumbnailUrl?: string; level?: string; isFree?: boolean; price?: number; categoryId?: string }) =>
    fetchApi('/courses', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<{ title: string; description: string; thumbnailUrl: string; level: string; status: string; isFree: boolean; price: number; categoryId: string }>) =>
    fetchApi(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => fetchApi(`/courses/${id}`, { method: 'DELETE' }),
};

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent?: { id: string; name: string } | null;
  children?: { id: string; name: string; slug: string }[];
  createdAt: string;
  _count?: { courses: number };
}

// Category APIs
export const categoriesApi = {
  list: () => fetchApi<Category[]>('/courses/categories'),

  get: (id: string) => fetchApi<Category>(`/courses/categories/${id}`),

  create: (data: { name: string; slug?: string; parentId?: string }) =>
    fetchApi<Category>('/courses/categories', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: { name?: string; slug?: string; parentId?: string }) =>
    fetchApi<Category>(`/courses/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => fetchApi<void>(`/courses/categories/${id}`, { method: 'DELETE' }),
};

// Course Instructor APIs
export const courseInstructorsApi = {
  list: (courseId: string) =>
    fetchApi<CourseInstructor[]>(`/courses/${courseId}/instructors`),

  assign: (courseId: string, data: { userId: string; role?: string }) =>
    fetchApi(`/courses/${courseId}/instructors`, { method: 'POST', body: JSON.stringify(data) }),

  remove: (courseId: string, userId: string) =>
    fetchApi(`/courses/${courseId}/instructors/${userId}`, { method: 'DELETE' }),

  updateRole: (courseId: string, userId: string, data: { role: string }) =>
    fetchApi(`/courses/${courseId}/instructors/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Section APIs
export const sectionsApi = {
  getByCourse: (courseId: string) => fetchApi(`/courses/${courseId}/sections`),

  create: (courseId: string, data: { title: string; orderIndex?: number }) =>
    fetchApi(`/courses/${courseId}/sections`, { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: { title?: string; orderIndex?: number }) =>
    fetchApi(`/sections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => fetchApi(`/sections/${id}`, { method: 'DELETE' }),

  reorder: (courseId: string, sectionIds: string[]) =>
    fetchApi(`/courses/${courseId}/sections/reorder`, { method: 'PUT', body: JSON.stringify({ sectionIds }) }),
};

// Lesson APIs
export const lessonsApi = {
  getBySection: (sectionId: string) => fetchApi(`/sections/${sectionId}/lessons`),

  get: (id: string) => fetchApi(`/lessons/${id}`),

  getForLearning: (id: string) => fetchApi(`/lessons/${id}/learn`),

  create: (sectionId: string, data: { title: string; type: string; content?: string; videoUrl?: string; videoProvider?: string; pdfUrl?: string; durationMins?: number; isPreview?: boolean; isPublished?: boolean }) =>
    fetchApi(`/sections/${sectionId}/lessons`, { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<{ title: string; type: string; content: string; videoUrl: string; videoProvider: string; pdfUrl: string; durationMins: number; orderIndex: number; isPreview: boolean; isPublished: boolean }>) =>
    fetchApi(`/lessons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => fetchApi(`/lessons/${id}`, { method: 'DELETE' }),

  reorder: (sectionId: string, lessonIds: string[]) =>
    fetchApi(`/sections/${sectionId}/lessons/reorder`, { method: 'PUT', body: JSON.stringify({ lessonIds }) }),
};

// Enrollment APIs
export const enrollmentsApi = {
  enroll: (courseId: string) => fetchApi(`/courses/${courseId}/enroll`, { method: 'POST' }),

  check: (courseId: string) => fetchApi(`/courses/${courseId}/enroll/check`),

  getMyEnrollments: () => fetchApi('/enrollments/my'),

  getCourseEnrollments: (courseId: string) => fetchApi(`/courses/${courseId}/enrollments`),

  unenroll: (courseId: string) => fetchApi(`/courses/${courseId}/enroll`, { method: 'DELETE' }),
};

// Progress APIs
export const progressApi = {
  markComplete: (lessonId: string) => fetchApi(`/lessons/${lessonId}/complete`, { method: 'POST' }),

  savePosition: (lessonId: string, position: number) =>
    fetchApi(`/lessons/${lessonId}/progress`, { method: 'PUT', body: JSON.stringify({ position }) }),

  getCourseProgress: (courseId: string) => fetchApi(`/courses/${courseId}/progress`),

  getLessonProgress: (lessonId: string) => fetchApi(`/lessons/${lessonId}/progress`),
};

// User APIs
export const usersApi = {
  getMe: () => fetchApi('/users/me'),

  getProfile: () => fetchApi('/users/me'),

  updateProfile: (data: { fullName?: string; bio?: string; phone?: string }) =>
    fetchApi('/users/me/profile', { method: 'PUT', body: JSON.stringify(data) }),

  updateAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return fetch(`${API_URL}/users/me/avatar`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${supabase.auth.getSession()}` },
      body: formData,
    });
  },

  getDashboard: () => fetchApi('/users/me/dashboard'),

  getEnrolledCourses: () => fetchApi('/users/me/courses'),

  getQuizHistory: () => fetchApi('/users/me/quiz-history'),

  search: (q: string, role?: string) =>
    fetchApi<{ users: UserSearchResult[]; pagination: object }>(
      `/users/search?q=${encodeURIComponent(q)}${role ? `&role=${encodeURIComponent(role)}` : ''}`
    ),
};

// Admin User APIs
export const adminUsersApi = {
  getAll: (params?: { page?: number; limit?: number; q?: string; role?: string; isActive?: string; sortBy?: string; sortOrder?: string }) =>
    fetchApi(`/users/admin/all?${new URLSearchParams(Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString()}`),

  getById: (id: string) => fetchApi(`/users/admin/${id}`),

  getStats: () => fetchApi<{ total: number; students: number; instructors: number; admins: number; inactive: number }>('/users/admin/stats'),

  createUser: (data: { email: string; password: string; fullName?: string; role?: string }) =>
    fetchApi('/users/admin', { method: 'POST', body: JSON.stringify(data) }),

  updateUser: (id: string, data: { role?: string; isActive?: boolean; fullName?: string; bio?: string; phone?: string }) =>
    fetchApi(`/users/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  reactivateUser: (id: string) =>
    fetchApi(`/users/admin/${id}/reactivate`, { method: 'PUT' }),

  resetPassword: (id: string, data: { newPassword: string }) =>
    fetchApi(`/users/admin/${id}/reset-password`, { method: 'PUT', body: JSON.stringify(data) }),

  deactivateUser: (id: string) => fetchApi(`/users/admin/${id}`, { method: 'DELETE' }),
};

// Settings APIs
export const settingsApi = {
  getAll: () => fetchApi('/settings'),

  getPublic: () => fetchApi('/settings/public'),

  getByCategory: (category: string) => fetchApi(`/settings/category/${category}`),

  get: (key: string) => fetchApi(`/settings/${key}`),

  update: (key: string, data: { value: unknown; type?: string }) =>
    fetchApi(`/settings/${key}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (key: string) => fetchApi(`/settings/${key}`, { method: 'DELETE' }),

  seed: () => fetchApi('/settings/seed', { method: 'POST' }),
};

// Email APIs
export const emailsApi = {
  // Templates
  getTemplates: () => fetchApi('/emails/templates'),

  getTemplate: (slug: string) => fetchApi(`/emails/templates/${slug}`),

  createTemplate: (data: { slug: string; name: string; subject: string; body: string }) =>
    fetchApi('/emails/templates', { method: 'POST', body: JSON.stringify(data) }),

  updateTemplate: (slug: string, data: { name?: string; subject?: string; body?: string; isActive?: boolean }) =>
    fetchApi(`/emails/templates/${slug}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteTemplate: (slug: string) => fetchApi(`/emails/templates/${slug}`, { method: 'DELETE' }),

  seedTemplates: () => fetchApi('/emails/templates/seed', { method: 'POST' }),

  previewTemplate: (slug: string, variables?: Record<string, string>) =>
    fetchApi<{ subject: string; body: string }>(`/emails/templates/${slug}/preview`, {
      method: 'POST', body: JSON.stringify({ variables }),
    }),

  duplicateTemplate: (slug: string) =>
    fetchApi(`/emails/templates/${slug}/duplicate`, { method: 'POST' }),

  sendTestWithTemplate: (slug: string, to: string, variables?: Record<string, string>) =>
    fetchApi(`/emails/templates/${slug}/test`, {
      method: 'POST', body: JSON.stringify({ to, variables }),
    }),

  // Logs
  getLogs: (params?: { page?: number; limit?: number; status?: string; templateSlug?: string }) =>
    fetchApi(`/emails/logs?${new URLSearchParams(params as any).toString()}`),

  getLogsStats: () => fetchApi('/emails/logs/stats'),

  // Test
  sendTestEmail: (to: string) => fetchApi('/emails/test', { method: 'POST', body: JSON.stringify({ to }) }),
};

// Flash Cards APIs
export const flashCardsApi = {
  // Get all decks for instructor
  getAll: () => fetchApi('/flash-cards-deck'),

  // Deck operations (nested under lessons)
  getDeckByLesson: (lessonId: string) => fetchApi(`/lessons/${lessonId}/flash-cards`),

  createDeck: (lessonId: string, data: { title: string; description?: string; shuffleCards?: boolean }) =>
    fetchApi(`/lessons/${lessonId}/flash-cards`, { method: 'POST', body: JSON.stringify(data) }),

  updateDeck: (lessonId: string, data: { title?: string; description?: string; shuffleCards?: boolean; isPublished?: boolean }) =>
    fetchApi(`/lessons/${lessonId}/flash-cards`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteDeck: (lessonId: string) =>
    fetchApi(`/lessons/${lessonId}/flash-cards`, { method: 'DELETE' }),

  // Card operations
  getCards: (deckId: string) => fetchApi(`/flash-cards-deck/${deckId}/cards`),

  createCard: (deckId: string, data: { front: string; back: string; hint?: string; imageUrl?: string; orderIndex?: number }) =>
    fetchApi(`/flash-cards-deck/${deckId}/cards`, { method: 'POST', body: JSON.stringify(data) }),

  updateCard: (cardId: string, data: { front?: string; back?: string; hint?: string; imageUrl?: string; orderIndex?: number }) =>
    fetchApi(`/flash-cards-deck/cards/${cardId}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteCard: (cardId: string) =>
    fetchApi(`/flash-cards-deck/cards/${cardId}`, { method: 'DELETE' }),

  reorderCards: (deckId: string, cardIds: string[]) =>
    fetchApi(`/flash-cards-deck/${deckId}/cards/reorder`, { method: 'PUT', body: JSON.stringify({ cardIds }) }),

  // Study sessions
  startSession: (deckId: string) =>
    fetchApi(`/flash-cards-deck/${deckId}/start`, { method: 'POST' }),

  completeSession: (sessionId: string, data: { knownCards: number; timeSpentSecs?: number }) =>
    fetchApi(`/flash-cards-sessions/${sessionId}/complete`, { method: 'POST', body: JSON.stringify(data) }),

  getHistory: (deckId: string) =>
    fetchApi(`/flash-cards-deck/${deckId}/history`),
};

// Activities APIs
export const activitiesApi = {
  getByLesson: (lessonId: string) =>
    fetchApi(`/lessons/${lessonId}/activities`),

  create: (lessonId: string, data: { activityType: string; title: string; isPublished?: boolean; contentUrl?: string; contentType?: string }) =>
    fetchApi(`/lessons/${lessonId}/activities`, { method: 'POST', body: JSON.stringify(data) }),

  update: (activityId: string, data: { title?: string; isPublished?: boolean; contentUrl?: string; contentType?: string }) =>
    fetchApi(`/activities/${activityId}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (activityId: string) =>
    fetchApi(`/activities/${activityId}`, { method: 'DELETE' }),

  reorder: (lessonId: string, activityIds: string[]) =>
    fetchApi(`/lessons/${lessonId}/activities/reorder`, { method: 'PUT', body: JSON.stringify({ activityIds }) }),

  getById: (activityId: string) =>
    fetchApi(`/activities/${activityId}`),
};

// Quizzes APIs
export const quizzesApi = {
  list: async (params?: { courseId?: string; sectionId?: string; search?: string }) => {
    const qs = new URLSearchParams(
      Object.entries({
        courseId: params?.courseId,
        sectionId: params?.sectionId,
      }).filter(([, value]) => value) as string[][],
    ).toString();

    const quizzes = await fetchApi<any[]>(`/quizzes${qs ? `?${qs}` : ''}`);

    if (!params?.search) {
      return quizzes;
    }

    const keyword = params.search.trim().toLowerCase();
    return quizzes.filter((quiz) =>
      [quiz.title, quiz.description, quiz.course?.title]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  },

  listMine: async (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetchApi<any[]>(`/quizzes/mine${qs}`);
  },

  get: (id: string) => fetchApi(`/quizzes/${id}`),

  create: (lessonId: string, data: {
    title: string;
    description?: string;
    timeLimitMinutes?: number;
    maxAttempts?: number;
    passScore?: number;
    showResult?: string;
    showCorrectAnswer?: boolean;
    showExplanation?: boolean;
    shuffleQuestions?: boolean;
    shuffleAnswers?: boolean;
    paginationMode?: string;
    questionsPerPage?: number;
    allowBackNavigation?: boolean;
    isPublished?: boolean;
    availableFrom?: string;
    availableUntil?: string;
    showLeaderboard?: boolean;
  }) => fetchApi(`/lessons/${lessonId}/quizzes`, { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Record<string, unknown>) =>
    fetchApi(`/quizzes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => fetchApi(`/quizzes/${id}`, { method: 'DELETE' }),

  clone: (id: string, targetLessonId: string) =>
    fetchApi(`/quizzes/${id}/clone`, {
      method: 'POST',
      body: JSON.stringify({ targetLessonId }),
    }),

  getQuestions: (id: string) => fetchApi(`/quizzes/${id}/questions`),

  addQuestion: (id: string, data: Record<string, unknown>) =>
    fetchApi(`/quizzes/${id}/questions`, { method: 'POST', body: JSON.stringify(data) }),

  removeQuestion: (id: string, quizQuestionId: string) =>
    fetchApi(`/quizzes/${id}/questions/${quizQuestionId}`, { method: 'DELETE' }),

  getLeaderboard: (id: string, limit?: number) =>
    fetchApi(`/quizzes/${id}/leaderboard${limit ? `?limit=${limit}` : ''}`),
};

// Payment APIs (Sepay)
export const paymentsApi = {
  create: (courseId: string) =>
    fetchApi('/payments', { method: 'POST', body: JSON.stringify({ courseId }) }),

  getStatus: (paymentId: string) =>
    fetchApi(`/payments/${paymentId}/status`),

  getMyPayments: () =>
    fetchApi('/payments/my'),
};

// Organization APIs
export interface Organization {
  id: string;
  slug: string;
  name: string;
  shortName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
  description: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  taxCode: string | null;
  foundedYear: number | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
}

export const organizationApi = {
  get: () => fetchApi<Organization | null>('/organization'),
  update: (data: Partial<Omit<Organization, 'id' | 'slug'>>) =>
    fetchApi<Organization>('/organization', { method: 'PUT', body: JSON.stringify(data) }),
  seed: () => fetchApi<Organization>('/organization/seed', { method: 'POST' }),
};

// Department APIs
export interface Department {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  status: string;
  orderIndex: number;
  children?: Department[];
}

export const departmentsApi = {
  list: () => fetchApi<Department[]>('/departments'),
  get: (id: string) => fetchApi<Department>(`/departments/${id}`),
  create: (data: { name: string; description?: string; parentId?: string; status?: string; orderIndex?: number }) =>
    fetchApi<Department>('/departments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<{ name: string; description: string; parentId: string; status: string; orderIndex: number }>) =>
    fetchApi<Department>(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchApi(`/departments/${id}`, { method: 'DELETE' }),
};

// User Activity API
export const userActivityApi = {
  getMyActivity: (months = 6) => fetchApi<{ daily: { date: string; count: number }[] }>(`/users/me/activity?months=${months}`),
};

// Reports APIs
export const reportsApi = {
  adminDashboard: () => fetchApi<{ totalUsers: number; totalCourses: number; totalEnrollments: number; activeUsers30d: number; totalRevenue: number; pendingPayments: number }>('/reports/admin/dashboard'),
  adminTrends: (months = 12) => fetchApi<{ userGrowth: { month: string; count: number }[]; enrollmentTrends: { month: string; count: number }[] }>(`/reports/admin/trends?months=${months}`),
  adminTopCourses: (limit = 10) => fetchApi<{ courses: { id: string; title: string; enrollments: number }[] }>(`/reports/admin/top-courses?limit=${limit}`),
  adminRevenue: (months = 12) => fetchApi<{ monthly: { month: string; revenue: number }[]; total: number }>(`/reports/admin/revenue?months=${months}`),
  instructorTrends: (months = 6) => fetchApi<{ enrollmentTrends: { month: string; count: number }[]; quizAttemptTrends: { month: string; count: number; avgScore: number }[] }>(`/reports/dashboard/trends?months=${months}`),
  instructorDashboard: () => fetchApi<any>('/reports/dashboard'),
  getCourseReport: (courseId: string) => fetchApi<any>(`/reports/courses/${courseId}`),
  getCourseStudents: (courseId: string) => fetchApi<any[]>(`/reports/courses/${courseId}/students`),
  getQuizReport: (quizId: string) => fetchApi<any>(`/reports/quizzes/${quizId}`),
  getQuizQuestionAnalysis: (quizId: string) => fetchApi<any[]>(`/reports/quizzes/${quizId}/question-analysis`),
};

// SCORM APIs
export const scormApi = {
  getPackageByLesson: (lessonId: string) =>
    fetchApi<{ id: string; version: string; title: string; entryPoint: string }>(`/scorm/package/lesson/${lessonId}`),
  getPackageByCourse: (courseId: string) =>
    fetchApi<{ id: string; version: string; title: string; entryPoint: string }>(`/scorm/package/course/${courseId}`),
  initAttempt: (packageId: string, lessonId?: string, courseId?: string) =>
    fetchApi<{ attemptId: string; cmiData: Record<string, string>; version: string; entryPoint: string; packageId: string }>(
      '/scorm/attempts/init',
      { method: 'POST', body: JSON.stringify({ packageId, lessonId, courseId }) },
    ),
  updateAttempt: (attemptId: string, values: Record<string, string>) =>
    fetchApi(`/scorm/attempts/${attemptId}`, {
      method: 'PUT',
      body: JSON.stringify({ values }),
    }),
  finishAttempt: (attemptId: string) =>
    fetchApi(`/scorm/attempts/${attemptId}/finish`, { method: 'POST' }),
  uploadLesson: async (lessonId: string, file: File) => {
    const { data: { session } } = await supabase.auth.getSession();
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_URL}/scorm/upload/lesson/${lessonId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session?.access_token}` },
      body: fd,
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },
  uploadCourse: async (courseId: string, file: File) => {
    const { data: { session } } = await supabase.auth.getSession();
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_URL}/scorm/upload/course/${courseId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session?.access_token}` },
      body: fd,
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },
};

// Reviews APIs
export interface CourseReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; fullName: string | null; avatarUrl: string | null };
}

export interface ReviewStats {
  averageRating: number | null;
  totalReviews: number;
  distribution: Record<string, number>;
}

export const reviewsApi = {
  list: (courseId: string, page = 1, limit = 10) =>
    fetchApi<{ reviews: CourseReview[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
      `/courses/${courseId}/reviews?page=${page}&limit=${limit}`,
    ),
  stats: (courseId: string) =>
    fetchApi<ReviewStats>(`/courses/${courseId}/reviews/stats`),
  upsert: (courseId: string, data: { rating: number; comment?: string }) =>
    fetchApi(`/courses/${courseId}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
  delete: (courseId: string, reviewId: string) =>
    fetchApi(`/courses/${courseId}/reviews/${reviewId}`, { method: 'DELETE' }),
};

// Contact Sync APIs
export const contactSyncApi = {
  getStatus: () => fetchApi<{ enabled: boolean; provider: string; lastSync: string | null; stats: { total: number; success: number; failed: number; pending: number } }>('/contact-sync/status'),
  verify: () => fetchApi<{ success: boolean; error?: string }>('/contact-sync/verify', { method: 'POST' }),
  getLogs: (params?: { page?: number; limit?: number; status?: string; provider?: string; trigger?: string }) =>
    fetchApi<{ data: any[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      `/contact-sync/logs?${new URLSearchParams(Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString()}`
    ),
  getLogStats: () => fetchApi<{ total: number; success: number; failed: number; pending: number }>('/contact-sync/logs/stats'),
  bulkSync: () => fetchApi<{ total: number; succeeded: number; failed: number; errors: { email: string; error: string }[] }>('/contact-sync/bulk-sync', { method: 'POST' }),
  syncUser: (userId: string) => fetchApi(`/contact-sync/sync-user/${userId}`, { method: 'POST' }),
};

// Auth APIs
export const authApi = {
  register: (data: { email: string; password: string; fullName?: string }) =>
    fetchApi<{ user?: object; session?: { access_token: string }; requiresVerification?: boolean; message?: string }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(data) }
    ),
};

// Learning Paths APIs
export const learningPathsApi = {
  list: (all?: boolean) =>
    fetchApi<any[]>(`/learning-paths${all ? '?all=true' : ''}`),
  get: (id: string) =>
    fetchApi<any>(`/learning-paths/${id}`),
  getWithProgress: (id: string) =>
    fetchApi<any>(`/learning-paths/${id}/progress`),
  create: (data: { title: string; description?: string; thumbnailUrl?: string }) =>
    fetchApi<any>('/learning-paths', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    fetchApi<any>(`/learning-paths/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchApi<any>(`/learning-paths/${id}`, { method: 'DELETE' }),
  addCourse: (pathId: string, data: { courseId: string; isRequired?: boolean }) =>
    fetchApi<any>(`/learning-paths/${pathId}/courses`, { method: 'POST', body: JSON.stringify(data) }),
  removeCourse: (pathId: string, courseId: string) =>
    fetchApi<any>(`/learning-paths/${pathId}/courses/${courseId}`, { method: 'DELETE' }),
  reorderCourses: (pathId: string, courseIds: string[]) =>
    fetchApi<any>(`/learning-paths/${pathId}/courses/reorder`, { method: 'PUT', body: JSON.stringify({ courseIds }) }),
  getMine: () => fetchApi<any[]>('/learning-paths/mine'),
  enroll: (id: string) => fetchApi<any>(`/learning-paths/${id}/enroll`, { method: 'POST' }),
};

// Assignments APIs
export const assignmentsApi = {
  create: (activityId: string, data: any) =>
    fetchApi<any>(`/assignments/activity/${activityId}`, { method: 'POST', body: JSON.stringify(data) }),
  get: (id: string) =>
    fetchApi<any>(`/assignments/${id}`),
  update: (id: string, data: any) =>
    fetchApi<any>(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  submit: (id: string, data: { fileUrl: string; fileName: string; comment?: string }) =>
    fetchApi<any>(`/assignments/${id}/submit`, { method: 'POST', body: JSON.stringify(data) }),
  grade: (submissionId: string, data: { score: number; feedback?: string }) =>
    fetchApi<any>(`/assignments/submissions/${submissionId}/grade`, { method: 'PATCH', body: JSON.stringify(data) }),
  getSubmissions: (id: string) =>
    fetchApi<any[]>(`/assignments/${id}/submissions`),
};
