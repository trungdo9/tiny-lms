# Plan: Claude Supabase Skill

**Date:** 2026-03-30 00:00
**Status:** Complete
**Priority:** Medium

## Overview
Create a Claude Supabase skill in `.claude/skills/supabase/` to guide AI agents on Supabase setup, integration patterns, and best practices within the Tiny LMS NestJS backend architecture.

## Context
- Tiny LMS uses NestJS backend with Prisma ORM
- Currently uses Better Auth for authentication
- Supabase is already partially integrated (SupabaseService exists)
- PostgreSQL database via Supabase
- Project has existing patterns: skill structure in `.claude/skills/<skill>/SKILL.md` + `references/`

## Why this matters
A Supabase skill will enable consistent guidance when:
- Adding Supabase features (auth, storage, realtime)
- Designing database schemas that work well with Supabase/Prisma
- Setting up RLS (Row Level Security) policies
- Implementing realtime subscriptions
- Using Edge Functions for serverless logic

## Goal / Definition of Done
After implementation:
- Skill directory `.claude/skills/supabase/` exists with `SKILL.md` and `references/`
- SKILL.md covers all major Supabase features relevant to Tiny LMS
- Reference docs provide detailed patterns for each feature area
- Skill follows existing better-auth structure as pattern

## Scope

### In scope
- Supabase setup and configuration
- Auth comparison: Supabase Auth vs Better Auth
- Database design patterns with Prisma + Supabase
- Client usage patterns (server/client)
- RLS (Row Level Security) policies
- Realtime subscriptions
- Storage for media/files
- Edge Functions
- Integration with existing NestJS architecture

### Out of scope
- Full Supabase project creation (already exists)
- Migrating away from Better Auth (not the goal)
- Implementing features, only documenting patterns

## Architecture decisions
1. **Skill structure mirrors better-auth**: SKILL.md + references/ folder
2. **Focus on integration**: How Supabase fits with existing NestJS + Prisma stack
3. **Comparison approach**: Where Better Auth differs from Supabase Auth, note both patterns

## Implementation phases

| # | Phase | File | Status |
|---|-------|------|--------|
| 1 | Skill structure and main SKILL.md | phase-01-skill-structure.md | ✅ Complete |
| 2 | Reference documentation | phase-02-reference-docs.md | ✅ Complete |

## Work plan summary

### Phase 1 — Skill structure
- Create `.claude/skills/supabase/SKILL.md`
- Create `.claude/skills/supabase/.env.example`
- Create `.claude/skills/supabase/references/` directory
- Populate SKILL.md with: overview, when to use, quick start, feature matrix, integration checklist

### Phase 2 — Reference docs
- `references/setup-configuration.md` - Environment setup, client initialization
- `references/auth-comparison.md` - Supabase Auth vs Better Auth patterns
- `references/database-prisma.md` - Database patterns, RLS policies
- `references/realtime.md` - Realtime subscription patterns
- `references/storage.md` - File/media storage patterns
- `references/edge-functions.md` - Edge function patterns
- `references/nestjs-integration.md` - NestJS integration specifics

## Open questions
1. Should the skill include migration guidance from current Supabase setup to alternative patterns?
2. Any specific Edge Function use cases identified for Tiny LMS?
