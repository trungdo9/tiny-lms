# Phase 1: Foundation Setup

**Date:** Week 1-2
**Priority:** P0 - Critical
**Status:** Partially Complete (Requires DB Connection)

## Overview
Setup development environment, initialize projects, configure Supabase, and implement authentication system.

## Key Insights
- Use monorepo structure with separate `frontend` and `backend` directories
- NestJS with Prisma ORM for type-safe database operations
- Supabase provides Auth, Database, Storage out of the box

## Requirements

### Functional
1. **Project Setup**
   - Initialize Next.js 16 with App Router
   - Initialize NestJS with TypeScript
   - Configure ESLint, Prettier, TypeScript
   - Setup environment variables

2. **Database Setup**
   - Create Supabase project
   - Configure Prisma with Supabase
   - Run initial migrations

3. **Authentication**
   - User registration (email/password)
   - User login (JWT tokens)
   - JWT refresh token flow
   - Forgot/reset password
   - Logout

4. **User Profiles**
   - Create profile on registration
   - View own profile
   - Update profile (name, bio, phone)
   - Upload avatar

### Non-Functional
- JWT tokens with 15min access / 7 day refresh
- RLS policies on Supabase
- CORS configuration
- Rate limiting

---

## Architecture

### Project Structure
```
tiny-lms/
├── frontend/                 # Next.js 16
│   ├── app/
│   │   ├── (auth)/         # Login, Register
│   │   ├── (student)/      # Protected routes
│   │   └── api/            # API routes (if needed)
│   ├── components/
│   ├── lib/
│   └── styles/
│
├── backend/                  # NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   └── users/
│   │   ├── common/
│   │   └── config/
│   └── prisma/
│
└── supabase/
    └── migrations/
```

### Database Schema (Phase 1)
```sql
-- profiles table (extends auth.users)
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name     TEXT,
  avatar_url    TEXT,
  role          TEXT CHECK (role IN ('admin','instructor','student')) DEFAULT 'student',
  bio           TEXT,
  phone         TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

### API Endpoints (Phase 1)
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
GET    /auth/me
POST   /auth/forgot-password
POST   /auth/reset-password

GET    /users/me
PUT    /users/me/profile
PUT    /users/me/avatar
```

---

## Implementation Steps

### Step 1.1: Environment Setup
1. Create `.env` file from `.env.example`
2. Configure Supabase credentials:
   ```
   SUPABASE_URL=
   SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   JWT_SECRET=
   ```

### Step 1.2: Frontend Setup
```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint
cd frontend
npm install @supabase/supabase-js @tanstack/react-query zustand
npm install -D @types/node
```

### Step 1.3: Backend Setup
```bash
npm i -g @nestjs/cli
nest new backend
cd backend
npm install @prisma/client @nestjs/passport @nestjs/jwt passport-jwt
npm install -D prisma
npx prisma init
```

### Step 1.4: Configure Prisma
1. Update `prisma/schema.prisma` with models
2. Run `npx prisma db push`
3. Create seed data for testing

### Step 1.5: Implement Auth Module (Backend)
- [ ] Create auth module with JWT strategy
- [ ] Implement register/login/logout endpoints
- [ ] Add refresh token logic
- [ ] Add forgot/reset password (via Supabase)

### Step 1.6: Implement Auth (Frontend)
- [ ] Create login page with form validation
- [ ] Create register page
- [ ] Setup auth context/hooks with Supabase
- [ ] Add protected route wrapper

### Step 1.7: Implement User Module
- [ ] GET /users/me endpoint
- [ ] PUT /users/me/profile endpoint
- [ ] PUT /users/me/avatar (upload to Supabase Storage)

---

## Related Code Files

### Backend Files to Create
```
backend/src/modules/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── auth.strategies/
│   └── jwt.strategy.ts
└── auth.guard.ts

backend/src/modules/users/
├── users.module.ts
├── users.controller.ts
├── users.service.ts
└── users.controller.ts (profile endpoints)
```

### Frontend Files to Create
```
frontend/app/(auth)/
├── login/page.tsx
└── register/page.tsx

frontend/lib/
├── supabase.ts
├── auth-context.tsx
└── use-auth.ts
```

---

## Success Criteria

- [ ] Frontend builds without errors
- [ ] Backend starts without errors
- [ ] User can register and login
- [ ] JWT token is stored and sent with requests
- [ ] Protected routes redirect to login
- [ ] Profile can be updated

---

## Security Considerations

1. **Password:** Hash with bcrypt, never store plain text
2. **JWT:** Use strong secret, short expiry for access token
3. **CORS:** Restrict to frontend domain only
4. **RLS:** Enable on Supabase for all tables

---

## Next Steps

1. Proceed to Phase 2: Course & Lesson
2. Dependencies: Auth must work first
