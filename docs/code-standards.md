# Tiny LMS - Code Standards and Conventions

## Overview

This document outlines the coding standards, conventions, and best practices for the Tiny LMS project. Following these standards ensures code consistency, maintainability, and quality across the frontend and backend applications.

---

## 1. General Principles

### 1.1 Code Organization
- Keep files focused and single-purpose
- Use clear, descriptive names for all identifiers
- Group related files in dedicated directories
- Follow the principle of separation of concerns

### 1.2 Code Style
- Use TypeScript for all new code (strict mode enabled)
- Enable ESLint and Prettier for automatic code formatting
- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)

---

## 2. TypeScript Standards

### 2.1 Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Variables | camelCase | `userName`, `courseList` |
| Functions | camelCase | `getUserById()`, `calculateProgress()` |
| Classes | PascalCase | `UserService`, `CourseController` |
| Interfaces | PascalCase | `UserProfile`, `CourseDetails` |
| Types | PascalCase | `QuizAttempt`, `LessonProgress` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `DEFAULT_PAGE_SIZE` |
| Enums | PascalCase | `QuizStatus`, `UserRole` |
| Files | kebab-case | `user-service.ts`, `api-client.ts` |
| React Components | PascalCase | `Header.tsx`, `CourseCard.tsx` |

### 2.2 Type Definitions

```typescript
// Preferred: explicit return types
function getUserById(id: string): Promise<User | null> { ... }

// Preferred: interface for object shapes
interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  role: 'student' | 'instructor' | 'admin';
}

// Preferred: optional chaining with nullish coalescing
const userName = user?.profile?.fullName ?? 'Anonymous';
```

---

## 3. Backend Standards (NestJS)

### 3.1 Module Structure

Each feature module follows this structure:

```
module-name/
├── dto/
│   ├── create-module.dto.ts
│   ├── update-module.dto.ts
│   └── module-response.dto.ts
├── module-name.module.ts
├── module-name.controller.ts
└── module-name.service.ts
```

Extended modules may add sub-controllers and sub-services (e.g., `courses/` adds `reviews.controller.ts`, `course-instructors.controller.ts`).

### 3.2 Controller Guidelines

```typescript
@Controller('resource-name')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: PaginationQueryDto) {
    return this.resourceService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  async create(@Body() createDto: CreateResourceDto) {
    return this.resourceService.create(createDto);
  }
}
```

### 3.3 Service Guidelines

```typescript
@Injectable()
export class ResourceService {
  constructor(private prisma: PrismaService) {}

  async findAll(pagination: PaginationQueryDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.resource.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.resource.count(),
    ]);
    return { data: items, meta: { total, page, limit } };
  }

  async findOne(id: string) {
    const resource = await this.prisma.resource.findUnique({ where: { id } });
    if (!resource) throw new NotFoundException(`Resource with ID ${id} not found`);
    return resource;
  }
}
```

### 3.4 DTO Guidelines

Use `class-validator` for validation:

```typescript
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;
}
```

### 3.5 Database Operations

- Use Prisma transactions for multi-step operations
- Use UUIDs for all primary keys
- Add indexes for frequently queried fields
- Soft deletes via `isActive` flag

```typescript
// Good: transaction for related operations
async enrollUser(courseId: string, userId: string) {
  return this.prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.create({ data: { courseId, userId } });
    await tx.notification.create({
      data: { userId, type: 'enrollment', title: 'Course Enrollment', message: '...' },
    });
    return enrollment;
  });
}
```

### 3.6 Authorization Pattern

The `canManageCourse(courseId, userId)` helper on `CoursesService` is the canonical authorization check for course content mutations. It is injected into `SectionsService`, `LessonsService`, and `QuizzesService`:

```typescript
// courses.service.ts
async canManageCourse(courseId: string, userId: string): Promise<boolean> {
  const entry = await this.prisma.courseInstructor.findFirst({
    where: { courseId, profileId: userId },
  });
  return !!entry;
}
```

Never duplicate this check inline — always delegate to `CoursesService`.

---

## 4. Role-Based Access Control (RBAC)

### 4.1 Role Enum

```typescript
// backend/src/common/enums/role.enum.ts
export enum Role {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
}
```

### 4.2 Usage in Controllers

```typescript
@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  @Get()
  async findAll() { }           // No @Roles = any authenticated user

  @Post()
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  async create() { }            // Instructor or admin only

  @Delete(':id')
  @Roles(Role.ADMIN)
  async delete() { }            // Admin only
}
```

Two guards are available:
- `JwtAuthGuard` — validates the JWT token issued by the backend
- `SupabaseAuthGuard` — validates a Supabase session token directly (used in SCORM, reviews)

---

## 5. Frontend Standards (Next.js)

### 5.1 Route Group Layout Pattern

Each route group uses a dedicated `layout.tsx` with the appropriate header/footer:

```
app/
├── (auth)/           layout.tsx  → no nav
├── (dashboard)/      layout.tsx  → DashboardHeader + DashboardFooter
├── (public)/         layout.tsx  → PublicHeader + PublicFooter
└── (student)/        layout.tsx  → student-specific layout
```

### 5.2 Routing Conflict Resolution

When two route groups resolve to the same URL path, place the page in a named subdirectory:

```
# Conflict (both resolve to /profile):
app/(dashboard)/profile/page.tsx
app/(student)/profile/page.tsx

# Fix — dashboard profile moved to:
app/(dashboard)/dashboard/profile/page.tsx  → /dashboard/profile
app/(student)/profile/page.tsx              → /profile
```

### 5.3 React Component Guidelines

```typescript
interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
}

export function CourseCard({ course, onEnroll }: CourseCardProps) {
  return (
    <Card>
      <CardHeader><CardTitle>{course.title}</CardTitle></CardHeader>
      <CardContent><p>{course.description}</p></CardContent>
      {onEnroll && (
        <CardFooter>
          <Button onClick={() => onEnroll(course.id)}>Enroll</Button>
        </CardFooter>
      )}
    </Card>
  );
}
```

### 5.4 TanStack Query Usage

Always use the `queryKeys` factory from `frontend/lib/query-keys.ts` for consistency and cache invalidation:

```typescript
import { queryKeys } from '@/lib/query-keys';
import { coursesApi } from '@/lib/api';

// Read
const { data, isLoading } = useQuery({
  queryKey: queryKeys.courses.list(),
  queryFn: () => coursesApi.list(),
});

// Write + invalidate
const mutation = useMutation({
  mutationFn: (data: CreateCourseDto) => coursesApi.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.courses.list() });
  },
});
```

Never use raw string arrays for query keys — always use the factory.

### 5.5 State Management

| State Type | Tool |
|-----------|------|
| Server state (API data) | TanStack Query |
| Global UI state (auth, theme) | React Context |
| Complex client state | Zustand |
| Simple local state | `useState` |

### 5.6 API Client Usage

```typescript
import { coursesApi, reviewsApi } from '@/lib/api';

// All API calls go through the centralized client
const courses = await coursesApi.list({ limit: 10 });
const stats = await reviewsApi.getStats(courseId);
```

---

## 6. Database Schema Standards (Prisma)

### 6.1 Model Conventions

- Singular model names in PascalCase: `Course`, `QuizAttempt`
- `@@map("snake_case")` for table names
- `@map("snake_case")` for column names
- UUID PKs: `@id @default(uuid()) @db.Uuid`
- All mutable models have `createdAt` and `updatedAt`

```prisma
model Course {
  id           String   @id @default(uuid()) @db.Uuid
  instructorId String   @map("instructor_id") @db.Uuid
  title        String
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("courses")
}
```

### 6.2 String-Based Enums

The codebase uses string fields (not Prisma enums) for flexibility:

```prisma
role      String  @default("student")   // "student" | "instructor" | "admin"
status    String  @default("draft")     // "draft" | "published"
type      String                         // "video" | "pdf" | "text" | "scorm"
```

This avoids Prisma enum migration overhead and aligns with Supabase's PostgreSQL setup.

### 6.3 Relationship Guidelines

- Always define `onDelete: Cascade` for child records
- Use `@@unique` for business-rule uniqueness (enrollment, review, certificate)
- Add `@@index` for frequently filtered foreign keys

---

## 7. API Design Standards

### 7.1 RESTful Conventions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/resources` | List resources |
| GET | `/resources/:id` | Get single resource |
| POST | `/resources` | Create resource |
| PUT | `/resources/:id` | Update resource |
| DELETE | `/resources/:id` | Delete resource |
| GET | `/resources/:id/sub-resources` | Related resources |

Nested routes for child resources scoped to a parent (e.g., `/courses/:courseId/reviews`, `/lessons/:lessonId/activities`).

### 7.2 Response Format

```typescript
// Paginated list
{ data: [...], meta: { total, page, limit } }

// Error
{ message: "Error description", statusCode: 400 }
```

### 7.3 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 8. File Organization

### Backend

```
src/
├── config/            # App configuration
├── common/
│   ├── guards/        # jwt-auth.guard.ts, supabase-auth.guard.ts, roles.guard.ts
│   ├── decorators/    # roles.decorator.ts
│   ├── enums/         # role.enum.ts
│   └── services/      # prisma.service.ts, supabase.service.ts
└── modules/           # 27 feature modules (one directory each)
    ├── auth/          ├── users/         ├── courses/       ├── sections/
    ├── lessons/       ├── enrollments/   ├── progress/      ├── question-banks/
    ├── questions/     ├── quizzes/       ├── attempts/      ├── grading/
    ├── reports/       ├── notifications/ ├── certificates/  ├── settings/
    ├── emails/        ├── flash-cards/   ├── activities/    ├── payments/
    ├── organization/  ├── departments/   ├── scorm/         ├── learning-paths/
    ├── assignments/   ├── contact-sync/  └── shared/
```

### Frontend

```
app/                   # App Router pages
├── (auth)/            # Login, register
├── (dashboard)/       # Student/instructor/admin dashboard and profile
├── (public)/          # Course catalog, payment
├── (student)/         # Lesson viewer, profile
├── instructor/        # Instructor portal (courses, reports, quizzes, flash-cards)
├── admin/             # Admin portal (dashboard, users, courses, quizzes,
│                      #   flash-cards, question-banks, reports, settings)
├── quizzes/           # Quiz taking
└── certificates/      # Certificate pages

components/
├── ui/                # shadcn/ui primitives
├── charts/            # Recharts wrappers (area, bar, line, pie, activity-heatmap)
├── quiz/              # Navigator, timer, flags
├── flash-card/        # Flip card, deck, session
├── activity/          # Activity list and forms
├── layout/            # dashboard/ and public/ header/footer components
└── retroui/           # NeoBrutalism landing components

lib/
├── api.ts             # All API endpoint functions
├── query-keys.ts      # TanStack Query key factory
├── query-client.ts    # TanStack Query client configuration
├── auth-context.tsx   # Auth context provider
├── supabase.ts        # Supabase client
├── export-csv.ts      # CSV export utility
└── utils.ts           # cn() and helpers
```

---

## 9. Git Conventions

### Commit Messages

Format: `type(scope): description`

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code restructuring |
| `test` | Test additions/changes |
| `chore` | Build, deps, config |

Examples:
```
feat(scorm): add SCORM 2004 runtime shim
fix(reviews): enforce enrollment check before review creation
docs(api): update organization module endpoints
```

### Branch Naming

- `main` — production branch
- `feature/feature-name` — new features
- `fix/bug-description` — bug fixes

---

## 10. Testing Guidelines

### Frontend (Vitest + jsdom)

```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['__tests__/**/*.test.ts', '__tests__/**/*.test.tsx'],
  },
});
```

Key patterns:
- Test query key consistency with describe blocks
- Mock API functions with `vi.fn()`
- Wrap hook tests in a React Query provider

### Backend (Jest)

```typescript
describe('CoursesService', () => {
  let service: CoursesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CoursesService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();
    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => expect(service).toBeDefined());
});
```

---

## 11. Security Standards

- Never store plain-text passwords — Supabase Auth handles hashing
- Validate all inputs with `class-validator` DTOs on the backend
- Use parameterized queries (Prisma handles this automatically)
- Protect all write endpoints with `JwtAuthGuard` or `SupabaseAuthGuard`
- Validate SePay webhook Bearer token before processing payment callbacks
- Validate SCORM ZIP paths to prevent directory traversal (adm-zip extraction)
- Never commit `.env` files or secrets to version control

---

## 12. ESLint Configuration

### Frontend
```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "react/no-unescaped-entities": "off"
  }
}
```

### Backend
```json
{
  "parser": "@typescript-eslint/parser",
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

---

---

## 13. Event-Driven Patterns

### @nestjs/event-emitter

Side effects that should not block the request (e.g., contact sync after enrollment) use NestJS events:

```typescript
// Emitting an event from EnrollmentsService
this.eventEmitter.emit('enrollment.created', { userId, courseId });

// Listening in ContactSyncEventsService
@OnEvent('enrollment.created')
async handleEnrollmentCreated(payload: { userId: string; courseId: string }) {
  await this.contactSyncService.addEnrollmentTag(payload.userId, payload.courseId, 'enroll');
}
```

Event emitter is in-process (single Node.js instance). For horizontal scaling, replace with an external message broker (Redis pub/sub, RabbitMQ).

---

*Document Last Updated: 2026-03-14*
