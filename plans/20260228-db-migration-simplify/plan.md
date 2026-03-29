# Plan: Simplify Database Migration

**Date:** 2026-02-28

## Overview

Simplify database migration from migration files to `prisma db push` approach. Instead of creating migration files, developers just update schema.prisma and run `db:pull` or `db:push`.

## Current vs New Approach

| Aspect | Current | New |
|--------|---------|-----|
| Command | `npx prisma migrate dev` | `npx prisma db push` |
| Migration files | Yes | No |
| History | Version controlled | Not version controlled |
| Rollback | Via down migrations | Manual |

## Changes Required

1. Remove existing migrations folder or keep as reference
2. Update package.json scripts
3. Document new workflow

## Implementation Steps

### Step 1: Update Scripts

Add to `backend/package.json`:

```json
"db:push": "prisma db push",
"db:pull": "prisma db pull",
"db:generate": "prisma generate",
"db:reset": "prisma db push --force-reset"
```

### Step 2: Document Workflow

New workflow:
1. Update `prisma/schema.prisma`
2. Run `npm run db:push`
3. Run `npm run db:generate` (auto-run after push)

### Step 3: Optional - Remove Migrations

- Option A: Keep migrations folder as backup
- Option B: Delete migrations folder (not needed anymore)

## Files to Modify

- `backend/package.json` - Add new scripts

## Status: ✅ Completed

## Workflow

```
1. Update schema.prisma
2. npm run db:push
3. npm run db:generate (auto)
```

## Files Modified

- `backend/package.json` - Added db:push, db:pull, db:generate, db:reset scripts
