# Plan: Certificate Enhancement

**Date:** 2026-03-20
**Completed:** 2026-03-21
**Status:** Completed
**Priority:** High

---

## Overview

Full enhancement of the Certificate feature: auto-issue on course completion, human-readable cert numbers, public verification page, improved PDF with branding+QR, share UI, and learning path certificate support.

**Key finding:** `certificateNumber` field exists in schema but never populated. No auto-issue hook. No public verify page. Frontend detail page already has download button.

---

## Phases

| # | Phase | Status | File | Dependencies |
|---|-------|--------|------|--------------|
| 1 | Backend: Auto-issue + certificateNumber + verify endpoint | Completed | [phase-01-auto-issue.md](./phase-01-auto-issue.md) | None |
| 2 | Backend: PDF design enhancement (branding + QR code) | Completed | [phase-02-pdf-enhancement.md](./phase-02-pdf-enhancement.md) | Phase 1 |
| 3 | Frontend: Share, verify page, cert number display | Completed | [phase-03-frontend.md](./phase-03-frontend.md) | Phase 1 |
| 4 | Learning Path certificate support | Completed | [phase-04-learning-path-cert.md](./phase-04-learning-path-cert.md) | Phase 1 + Learning Path Phase 1 |

---

## Existing State

| What | Status |
|------|--------|
| `issueCertificate(userId, courseId)` | Exists — manual trigger only |
| `certificateNumber` field | Exists in schema, never populated |
| `generatePdf(certId)` | Exists — basic pdfkit, no branding |
| Download button on `/certificates/[id]` | Exists in frontend |
| Public verify page | Missing |
| Auto-issue on lesson completion | Missing |
| Share functionality | Missing |
| Learning path cert | Missing |

---

## Success Criteria

- [x] Certificate auto-issued when all lessons completed (100% course progress)
- [x] Every new cert gets unique `CERT-YYYYMMDD-XXXXX` number
- [x] `GET /certificates/verify/:certificateNumber` returns cert info without auth
- [x] PDF includes org name, cert number, QR code linking to verify URL
- [x] `/verify/[certificateNumber]` public page works without login
- [x] Share/copy-link button on cert detail page
- [x] Learning path completion triggers cert issuance
