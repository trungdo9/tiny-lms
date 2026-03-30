# NestJS Integration

## Overview

Integrating Supabase with NestJS follows the existing service pattern used in Tiny LMS (SupabaseService already exists).

## Existing SupabaseService Pattern

```typescript
// backend/src/common/supabase.service.ts
@Injectable()
export class SupabaseService {
  private client: SupabaseClient;
  private admin: SupabaseClient;

  constructor() {
    this.client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    this.admin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  get client(): SupabaseClient {
    return this.client;
  }

  get admin(): SupabaseClient {
    return this.admin;
  }
}
```

## Module Registration

```typescript
// backend/src/common/common.module.ts
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class CommonModule {}
```

## Usage in Services/Controllers

```typescript
@Injectable()
export class CourseService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService
  ) {}

  async uploadCourseImage(file: Buffer, courseId: string) {
    const path = `courses/${courseId}/thumbnail.jpg`;

    const { data, error } = await this.supabase.storage
      .from('course-media')
      .upload(path, file, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) throw new BadRequestException(error.message);

    return this.supabase.storage
      .from('course-media')
      .getPublicUrl(path);
  }
}
```

## SupabaseAuthGuard

Existing JWT validation guard:

```typescript
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const { data: { user }, error } = await this.supabase.admin.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = user;
    return true;
  }
}
```

## Admin Operations

Use admin client for server-side operations that bypass RLS:

```typescript
async createUser(email: string, password: string) {
  const { data, error } = await this.supabase.admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) throw new BadRequestException(error.message);
  return data;
}
```

## Error Handling

```typescript
import { SupabaseClient } from '@supabase/supabase-js';

async handleSupabaseOperation(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('courses').select();

  if (error) {
    console.error('Supabase error:', error);
    throw new BadRequestException(error.message);
  }

  return data;
}
```

## Testing

```typescript
describe('CourseService', () => {
  let service: CourseService;
  let mockSupabaseService: Partial<SupabaseService>;

  beforeEach(async () => {
    mockSupabaseService = {
      client: {
        storage: { from: jest.fn().mockReturnValue({...}) }
      } as any
    };

    const module = await Test.createTestingModule({
      providers: [
        CourseService,
        { provide: SupabaseService, useValue: mockSupabaseService }
      ]
    }).compile();

    service = module.get<CourseService>(CourseService);
  });
});
```

## See also
- setup-configuration.md
- auth-comparison.md
- storage.md
- realtime.md
