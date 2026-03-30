# Phase 2: Frontend alignment and regression checks

**Owner:** Linh_Orchestrator
**Status:** ✅ Complete

## Outcome
Admin/instructor UI remains aligned with canonical backend difficulty semantics and regression risk is low.

## Tasks
1. Confirm admin and instructor question-bank pages only submit `easy|medium|hard`
2. Deduplicate difficulty option/badge constants if the change is cheap and local
3. Update import help text/error text to reflect accepted canonical values and aliases
4. Regression-check create, edit, import, list filtering, and quiz setup flows

## Acceptance
- UI never emits non-canonical difficulty values
- User-facing copy matches backend normalization policy
- No regressions in question bank or quiz setup flows
