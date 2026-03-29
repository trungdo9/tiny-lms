# Phase 1: Setup and Auth Controller

## Context Links

- Plan overview: [plan.md](./plan.md)
- Implementation steps: [phase-01-implementation-steps.md](./phase-01-implementation-steps.md)
- `backend/src/main.ts` — bootstrap entry point (no Swagger today)
- `backend/src/modules/auth/auth.controller.ts` — 5 inline interfaces, 7 endpoints
- `backend/package.json` — no `@nestjs/swagger` present

---

## Overview

Install the Swagger package, configure `SwaggerModule` in `main.ts`, and fully annotate the auth controller. The auth controller is the only one using inline TypeScript interfaces instead of classes — these must be converted to class-based DTOs with `@ApiProperty` decorators before Swagger can introspect them.

---

## Key Insights

- `@nestjs/swagger` >= 7.x bundles `swagger-ui-express` — only one package install needed.
- NestJS 11 requires `@nestjs/swagger` ^11.x (verify against npm peer deps).
- TypeScript interfaces are erased at runtime; Swagger's `SchemaObjectFactory` uses `reflect-metadata` on class constructors — interfaces produce empty schemas.
- `SupabaseAuthGuard` guards only `GET /auth/me`. All other endpoints are public. `@ApiBearerAuth()` applies only to `me` and `logout` (logout reads token manually with no guard).
- Production safety: wrap `SwaggerModule.setup()` in `if (process.env.NODE_ENV !== 'production')`.

---

## Requirements

1. Install `@nestjs/swagger` compatible with NestJS 11.
2. Configure `SwaggerModule` in `main.ts` — title "Tiny LMS API", Bearer auth scheme, path `/api/docs`, disabled in production.
3. Convert 5 inline interfaces in `auth.controller.ts` → exported classes in new `auth/dto/auth.dto.ts`.
4. Add `@ApiProperty()` to all fields in the new auth DTO classes.
5. Add `@ApiTags('auth')` to `AuthController`.
6. Add `@ApiOperation({ summary })` to all 7 auth endpoints.
7. Add `@ApiBearerAuth()` to `GET /auth/me` and `POST /auth/logout`.
8. Add `@ApiResponse` for common status codes on each endpoint.

---

## Architecture

```
main.ts
  └── SwaggerModule.createDocument(app, config)
        └── DocumentBuilder
              .setTitle('Tiny LMS API')
              .setVersion('1.0')
              .addBearerAuth()
              .build()
  └── SwaggerModule.setup('api/docs', app, document)
        └── guarded: NODE_ENV !== 'production'

auth/
  ├── dto/
  │   └── auth.dto.ts          ← NEW: 5 classes with @ApiProperty + class-validator
  └── auth.controller.ts       ← updated: class imports, Swagger decorators
```

---

## Related Code Files

- `backend/src/main.ts`
- `backend/src/modules/auth/auth.controller.ts`
- `backend/package.json`

---

## Todo List

- [x] `cd backend && npm install @nestjs/swagger`
- [x] Update `backend/src/main.ts` — import SwaggerModule, add dev-only setup block
- [x] Create `backend/src/modules/auth/dto/auth.dto.ts` with 5 classes + validators + `@ApiProperty`
- [x] Update `backend/src/modules/auth/auth.controller.ts` — replace interface refs, add all Swagger decorators
- [x] Start dev server, confirm `http://localhost:3001/api/docs` loads with auth tag and correct body schemas
- [x] Confirm lock icon on `GET /auth/me` and `POST /auth/logout`
- [x] Confirm no Swagger UI at `/api/docs` when `NODE_ENV=production`
- [x] Confirm `npm run build` passes with no TypeScript errors

---

## Success Criteria

- `http://localhost:3001/api/docs` loads without error
- "auth" tag visible with all 7 endpoints
- Request body schemas for `register`, `login`, etc. show field names/types (not empty `{}`)
- Lock icon on `GET /auth/me` and `POST /auth/logout` only
- `/api/docs` returns 404 in production mode
- No TypeScript compile errors

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| `@nestjs/swagger` version incompatible with NestJS 11 | Low | Check peer deps before install |
| New auth DTO classes break existing auth flow | Low | Auth service uses raw field access, not DTO instances |
| Interface-to-class rename causes import errors elsewhere | Low | Only `auth.controller.ts` imports these interfaces |
| Swagger UI 404 in dev due to wrong path | Low | Use `'api/docs'` not `'/api/docs'` (NestJS strips leading slash) |

---

## Security Considerations

- Swagger UI disabled in production via `NODE_ENV` check — not a config toggle that could be accidentally enabled.
- `addBearerAuth()` is documentation-only; does not bypass actual guards.
- Webhook endpoint (`POST /payments/webhook`) uses a secret Bearer token, not user JWT — covered in Phase 2.

---

## Next Steps

After Phase 1 merged: [phase-02-controller-annotations.md](./phase-02-controller-annotations.md)
