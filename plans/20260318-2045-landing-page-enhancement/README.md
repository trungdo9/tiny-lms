# Tiny LMS Landing Page Enhancement - Complete Implementation Plan

**Date**: 2026-03-18
**Status**: Ready for Implementation
**Total Lines**: 1,088 (plan + 4 phases)

## Quick Navigation

### Main Plan
- **`plan.md`** (82 lines) - Master overview, goals, phased delivery timeline, success metrics

### Phase Files (Sequential Implementation)
1. **`phase-01-hero-and-value-prop.md`** (185 lines)
   - Hero section refactor (benefit-focused headline, dual CTAs, stats)
   - Value proposition component (3-5 outcome-focused benefits)
   - Duration: 3-4 days | Priority: Foundational

2. **`phase-02-features-and-how-it-works.md`** (204 lines)
   - Expand features grid (5 → 8 items)
   - Create how-it-works timeline (role-based: instructor vs. student)
   - Duration: 3-4 days | Depends on: Phase 1

3. **`phase-03-social-proof-and-testimonials.md`** (258 lines)
   - Testimonials section (5+ cards, photo + quote + name)
   - Stats section (4-5 key metrics: courses, students, completion rate)
   - Use cases section (2-3 detailed scenarios)
   - FAQ section (10-12 expandable Q&A items)
   - Duration: 3-4 days | Depends on: Phase 2

4. **`phase-04-seo-and-performance.md`** (359 lines)
   - SEO metadata & schema.org structured data
   - Core Web Vitals optimization (LCP <2.5s, FID <100ms, CLS <0.1)
   - Image optimization with Next.js Image component
   - Analytics & event tracking (GA4)
   - Mobile & accessibility testing
   - Duration: 2-3 days | Depends on: Phase 3

## Research & Scout Reports (Reference)

Located in `research/` and `scout/` subdirectories:
- **`researcher-01-lms-conversion-practices.md`** - Industry best practices for LMS landing page conversion, social proof, performance, SEO
- **`researcher-02-frontend-current-state.md`** - Technical stack analysis, current landing page structure, design system
- **`scout-01-frontend-structure.md`** - Frontend architecture, file organization, NeoBrutalism design constraints

## Key Deliverables by Phase

| Phase | Components | Data Structures | Files Created/Modified |
|-------|-----------|-----------------|----------------------|
| 1 | HeroSection, ValueProposition | HERO_CONTENT, VALUE_PROPS | 4 files new, 2 modified |
| 2 | FeaturesSection, HowItWorksSection | FEATURES, HOW_IT_WORKS | 4 files new, 2 modified |
| 3 | StatsSection, TestimonialsSection, UseCasesSection, FAQSection | STATS, TESTIMONIALS, USE_CASES, FAQ_ITEMS | 6 files new, 2 modified |
| 4 | SEO metadata, Analytics setup, Performance optimization | GA4 events, schema.org JSON-LD | 4 files new, 5 modified |

## Design Constraints (Non-Negotiable)

- **NeoBrutalism**: Yellow (#ffdb33) + Black (#000000) + hard shadows (4-6px), no rounded corners
- **Typography**: Archivo Black (headlines), Space Grotesk (body), Geist Sans (fallback)
- **Mobile-First**: 60% traffic mobile—test iOS Safari, Android Chrome on real devices
- **Performance**: Lighthouse >90, Core Web Vitals green, LCP <2.5s
- **Accessibility**: WCAG 2.1 AA (contrast 4.5:1, keyboard nav, alt text)

## Implementation Timeline (Estimated)

| Phase | Duration | Start | End | Dependencies |
|-------|----------|-------|-----|--------------|
| 1 | 3-4 days | Week 1 | Mid-Week 1 | None |
| 2 | 3-4 days | Mid-Week 1 | End-Week 1 | Phase 1 ✓ |
| 3 | 3-4 days | Week 2 | Mid-Week 2 | Phase 2 ✓ |
| 4 | 2-3 days | Mid-Week 2 | End-Week 2 | Phase 3 ✓ |
| **Total** | **11-15 days** | Week 1 | Week 2 | Sequential |

## Success Metrics

### Conversion & Engagement
- Conversion rate: 2-5% (SaaS benchmark)
- Bounce rate: <50%
- Time-on-page: >90 seconds
- CTA click-through rate: 8-12%

### Performance
- Lighthouse: >90 (desktop), >85 (mobile)
- Core Web Vitals: All green (LCP <2.5s, FID <100ms, CLS <0.1)
- Bundle size: <200KB main JS (gzipped)

### Mobile & Accessibility
- Mobile usability: 100% on PageSpeed
- WCAG 2.1 AA: 0 critical issues (axe audit)
- Keyboard navigation: Fully functional (Tab, Enter, arrows)

## How to Use This Plan

1. **Start with `plan.md`** for overview and context
2. **Read Phase 1 → 4 in order** (sequential dependencies)
3. **Each phase file includes**:
   - Key insights from research
   - Technical requirements
   - Architecture & component structure
   - Detailed implementation steps (8-12 steps per phase)
   - Success criteria & risk assessment
4. **Use landing-data.ts** (created in Phase 1) to manage all content (testimonials, FAQs, stats)
5. **Follow risk mitigation** strategies in each phase
6. **Test per checklist** in each phase before proceeding to next

## Tech Stack Reference

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4
- **Styling**: Custom NeoBrutalism + shadcn/ui components
- **Icons**: Lucide React (no external images phase 1-2)
- **Data**: TanStack React Query v5 (featured courses API)
- **Auth**: Supabase v2.97 (existing integration)
- **Analytics**: Google Analytics 4 (to be integrated, Phase 4)
- **SEO**: Next.js metadata API, schema.org JSON-LD

## File Structure (Post-Implementation)

```
frontend/
├── app/
│   ├── page.tsx (refactored with 9 sections)
│   ├── layout.tsx (with SEO metadata)
│   └── globals.css (unchanged)
├── components/
│   ├── landing/
│   │   ├── HeroSection.tsx
│   │   ├── ValueProposition.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── StatsSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── UseCasesSection.tsx
│   │   ├── FAQSection.tsx
│   │   └── index.ts (export all)
│   └── retroui/
│       └── Button.tsx (existing)
└── lib/
    ├── landing-data.ts (NEW: all content)
    ├── analytics.ts (NEW: GA4 events)
    └── api.ts (existing)
```

## Critical Notes

- **No implementation starts until plan review** ✓ Plan complete
- **All phases must be sequential** (dependencies enforced)
- **Mobile testing is mandatory** before phase completion
- **A/B testing framework** should be set up in Phase 1 (hero CTA copy)
- **Real testimonials** should be prioritized (mock acceptable for MVP)
- **Analytics setup** must be verified in Phase 4 before launch

## Questions Before Implementation?

Each phase file includes unresolved questions at the end. Address these during implementation planning.

---

**Next Step**: Review plan, validate with stakeholders, then proceed to Phase 1 implementation.
