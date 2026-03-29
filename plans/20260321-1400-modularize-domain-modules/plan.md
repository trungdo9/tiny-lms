# Plan: Modularize Domain Modules (NestJS Backend)

**Created:** 2026-03-21
**Status:** Pending Implementation
**Priority:** Medium — structural refactoring, no behavior change

## Goal

Replace 27 flat module imports in `app.module.ts` with 7 domain-level aggregator modules. No files moved, no behavior changed.

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Create domain aggregator modules | Pending | [phase-01-create-domain-modules.md](./phase-01-create-domain-modules.md) |
| 2 | Update AppModule | Pending | (included in phase 1) |

## Domain Mapping

| Domain Module | Sub-modules |
|---|---|
| `CoreModule` | auth, users |
| `CourseModule` | courses, sections, lessons, scorm, activities, assignments |
| `AssessmentModule` | quizzes, questions, question-banks, attempts, grading, flash-cards |
| `LearningModule` | enrollments, progress, certificates, learning-paths |
| `CommunicationModule` | notifications, emails, contact-sync |
| `OrganizationModule` | organization, departments |
| `BusinessModule` | payments, reports, settings |
