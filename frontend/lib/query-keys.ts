export const queryKeys = {
  // Auth & Profile
  profile: () => ['profile'] as const,
  dashboard: () => ['dashboard'] as const,

  // Courses
  courses: {
    list: (params?: object) => ['courses', 'list', params] as const,
    detail: (id: string) => ['courses', 'detail', id] as const,
    detailBySlug: (slug: string) => ['courses', 'slug', slug] as const,
    instructor: (params?: object) => ['courses', 'instructor', params] as const,
    myCourses: () => ['courses', 'my'] as const,
    categories: () => ['courses', 'categories'] as const,
    enrollments: (courseId: string) => ['courses', 'enrollments', courseId] as const,
    progress: (courseId: string) => ['courses', 'progress', courseId] as const,
  },

  // Lessons
  lessons: {
    detail: (id: string) => ['lessons', 'detail', id] as const,
    forLearning: (id: string) => ['lessons', 'learn', id] as const,
    progress: (id: string) => ['lessons', 'progress', id] as const,
  },

  // Sections
  sections: {
    byCourse: (courseId: string) => ['sections', 'course', courseId] as const,
  },

  // Enrollments
  enrollments: {
    my: () => ['enrollments', 'my'] as const,
    check: (courseId: string) => ['enrollments', 'check', courseId] as const,
  },

  // Quizzes
  quizzes: {
    list: (params?: object) => ['quizzes', 'list', params] as const,
    detail: (id: string) => ['quizzes', 'detail', id] as const,
    instructor: () => ['quizzes', 'instructor'] as const,
  },

  // Attempts
  attempts: {
    detail: (id: string) => ['attempts', 'detail', id] as const,
    page: (id: string, page: number) => ['attempts', 'page', id, page] as const,
    questions: (id: string) => ['attempts', 'questions', id] as const,
    grading: () => ['attempts', 'grading'] as const,
  },

  // Question Banks
  questionBanks: {
    list: () => ['question-banks', 'list'] as const,
    detail: (id: string) => ['question-banks', 'detail', id] as const,
    questions: (id: string) => ['question-banks', 'questions', id] as const,
  },

  // Reports
  reports: {
    course: (id: string) => ['reports', 'course', id] as const,
    quiz: (id: string) => ['reports', 'quiz', id] as const,
  },

  // Certificates
  certificates: {
    list: () => ['certificates', 'list'] as const,
    detail: (id: string) => ['certificates', 'detail', id] as const,
  },

  // User Quiz History
  quizHistory: () => ['quiz-history'] as const,

  // Admin Users
  adminUsers: {
    all: (params?: object) => ['admin', 'users', params] as const,
    detail: (id: string) => ['admin', 'users', id] as const,
    stats: () => ['admin', 'users', 'stats'] as const,
  },

  // Settings
  settings: {
    all: () => ['settings'] as const,
    category: (category: string) => ['settings', 'category', category] as const,
    public: () => ['settings', 'public'] as const,
  },

  // Email
  email: {
    templates: () => ['email', 'templates'] as const,
    template: (slug: string) => ['email', 'templates', slug] as const,
    logs: (params?: object) => ['email', 'logs', params] as const,
    stats: () => ['email', 'stats'] as const,
  },

  // Notifications
  notifications: {
    list: () => ['notifications'] as const,
    unread: () => ['notifications', 'unread'] as const,
  },

  // Flash Cards
  flashCards: {
    deck: (lessonId: string) => ['flash-cards', 'deck', lessonId] as const,
    cards: (deckId: string) => ['flash-cards', 'cards', deckId] as const,
    session: (sessionId: string) => ['flash-cards', 'session', sessionId] as const,
    history: (deckId: string) => ['flash-cards', 'history', deckId] as const,
  },

  // Activities
  activities: {
    byLesson: (lessonId: string) => ['activities', 'lesson', lessonId] as const,
    byId: (id: string) => ['activities', 'id', id] as const,
  },

  // Course Instructors
  courseInstructors: {
    list: (courseId: string) => ['course-instructors', courseId] as const,
  },

  // Organization
  organization: () => ['organization'] as const,

  // Departments
  departments: {
    list: () => ['departments', 'list'] as const,
    detail: (id: string) => ['departments', 'detail', id] as const,
  },

  // Admin Reports
  adminReports: {
    dashboard: () => ['admin', 'reports', 'dashboard'] as const,
    trends: (months: number) => ['admin', 'reports', 'trends', months] as const,
    topCourses: (limit: number) => ['admin', 'reports', 'top-courses', limit] as const,
    revenue: (months: number) => ['admin', 'reports', 'revenue', months] as const,
  },

  // Instructor Reports
  instructorReports: {
    trends: (months: number) => ['instructor', 'reports', 'trends', months] as const,
    dashboard: () => ['instructor', 'reports', 'dashboard'] as const,
    course: (courseId: string) => ['instructor', 'reports', 'course', courseId] as const,
    courseStudents: (courseId: string) => ['instructor', 'reports', 'course', courseId, 'students'] as const,
  },

  // User Activity
  activity: (months: number) => ['activity', months] as const,

  // Reviews
  reviews: {
    list: (courseId: string, page?: number) => ['reviews', 'list', courseId, page] as const,
    stats: (courseId: string) => ['reviews', 'stats', courseId] as const,
  },

  // Learning Paths
  learningPaths: {
    list: () => ['learning-paths', 'list'] as const,
    mine: () => ['learning-paths', 'mine'] as const,
    detail: (id: string) => ['learning-paths', 'detail', id] as const,
    withProgress: (id: string) => ['learning-paths', 'progress', id] as const,
  },

  // Assignments
  assignments: {
    detail: (id: string) => ['assignments', 'detail', id] as const,
    submissions: (id: string) => ['assignments', 'submissions', id] as const,
  },

  // SCORM
  scorm: {
    package: (lessonId: string) => ['scorm', 'package', lessonId] as const,
    coursePackage: (courseId: string) => ['scorm', 'course-package', courseId] as const,
    attempt: (packageId: string) => ['scorm', 'attempt', packageId] as const,
  },

  // Contact Sync
  contactSync: {
    status: () => ['contact-sync', 'status'] as const,
    logs: (params?: object) => ['contact-sync', 'logs', params] as const,
    logStats: () => ['contact-sync', 'log-stats'] as const,
  },

  // Users
  users: {
    search: (q: string, role?: string) => ['users', 'search', q, role] as const,
  },
};
