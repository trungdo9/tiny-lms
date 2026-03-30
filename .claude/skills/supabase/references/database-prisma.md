# Database: Prisma + Supabase

## Overview

Tiny LMS uses Prisma ORM with Supabase PostgreSQL. Supabase features (RLS, realtime) work alongside Prisma, not instead of it.

## RLS (Row Level Security)

RLS policies filter rows at the database level based on the authenticated user.

### Enable RLS on Table

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Create RLS Policies

```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Anyone can view published courses
CREATE POLICY "Anyone can view published courses"
ON courses FOR SELECT
USING (is_published = true);

-- Instructors can insert courses
CREATE POLICY "Instructors can insert courses"
ON courses FOR INSERT
WITH CHECK (auth.uid() = instructor_id);
```

## RLS + Prisma

Prisma queries bypass RLS when using the service role key. To test RLS:

```typescript
// Use anon key client (respects RLS)
const { data } = await supabase
  .from('profiles')
  .select()
  .eq('user_id', userId);
```

## auth.uid() in Prisma

Prisma doesn't automatically use `auth.uid()`. For Supabase Auth integration:

```sql
-- Add user_id foreign key in your tables
-- Reference auth.users.id
```

## Combining Prisma + Supabase

```typescript
// Use Prisma for complex queries
const courses = await prisma.course.findMany({
  where: { instructorId: userId },
  include: { sections: true }
});

// Use Supabase client for RLS-protected queries
const { data: profile } = await supabase
  .from('profiles')
  .select()
  .eq('user_id', userId)
  .single();
```

## Index Recommendations

```sql
-- Index for RLS policy performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Index for common query patterns
CREATE INDEX idx_courses_instructor ON courses(instructor_id) WHERE is_published = true;
```

## See also
- setup-configuration.md
- realtime.md
- auth-comparison.md
