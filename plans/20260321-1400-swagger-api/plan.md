# Plan: Swagger/OpenAPI Documentation for Tiny LMS Backend

**Date:** 2026-03-21
**Scope:** NestJS v11 backend — `backend/src/`
**Status:** Complete

---

## Objective

Add full Swagger/OpenAPI documentation to the 30-controller NestJS backend. The UI is served at `/api/docs` (dev-only). Auth is Bearer JWT (Supabase tokens).

---

## Phases

| Phase | File | Scope | Effort |
|-------|------|-------|--------|
| 1 | [phase-01-setup-and-auth.md](./phase-01-setup-and-auth.md) | Install packages, configure SwaggerModule in `main.ts`, convert auth controller interfaces → classes, fully annotate auth | Low |
| 2 | [phase-02-controller-annotations.md](./phase-02-controller-annotations.md) | Add `@ApiTags`, `@ApiBearerAuth`, `@ApiOperation`, `@ApiResponse` to remaining 29 controllers | Medium |
| 3 | [phase-03-dto-annotations.md](./phase-03-dto-annotations.md) | Add `@ApiProperty` to all 18 class-based DTO files across all modules | Medium |

---

## Key Decisions

- Swagger UI disabled in production via `NODE_ENV` check in `main.ts`
- Two guard types in codebase (`SupabaseAuthGuard`, `JwtAuthGuard`) — both use Bearer JWT, single `addBearerAuth()` scheme sufficient
- Payments webhook endpoint (`POST /payments/webhook`) uses a secret Bearer token, not user JWT — annotate with `@ApiSecurity` or note in `@ApiOperation`
- Auth controller inline interfaces must be converted to classes for `@ApiProperty` to work (decorators cannot target interfaces)
- No new DTO files needed — only annotate existing ones

---

## Dependencies

- `@nestjs/swagger` ^11.x (peer-compatible with NestJS 11)
- `swagger-ui-express` (bundled with `@nestjs/swagger` since v7 — no separate install needed in NestJS 11)

---

## Constraints

- Follow `docs/code-standards.md`: PascalCase classes, kebab-case files, no logic changes
- YAGNI: no response DTO classes unless they already exist — use `@ApiResponse({ description })` for complex shapes
- Do not modify service or database layer

---

## Commit Strategy

One commit per phase: `docs(swagger): phase-1 setup and auth`, etc.
