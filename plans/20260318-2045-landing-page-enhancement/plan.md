---
title: Landing Page Enhancement Implementation Plan
date: 2026-03-18
status: completed
priority: high
---

# Tiny LMS Landing Page Enhancement - Master Plan

## Overview
Comprehensive refactor of `/frontend/app/page.tsx` to enhance conversion, add social proof, improve mobile UX, and implement SEO best practices while maintaining NeoBrutalism design aesthetic.

**Current State**: Basic hero, 5-feature grid, featured courses, minimal footer
**Target State**: Full-funnel landing page with hero, value prop, features, how-it-works, use cases, testimonials, stats, CTA, FAQ

## Goals
1. **Conversion**: Clear CTAs, reduced friction, compelling value prop (target 2-5% conversion)
2. **Design**: Professional NeoBrutalism with improved visual hierarchy
3. **Mobile**: 60% of traffic is mobile—must be responsive first
4. **SEO**: Meta tags, structured data, keyword optimization (LCP <2.5s)
5. **Social Proof**: Testimonials, stats, logos, case studies

## Phased Delivery

| Phase | Focus | Duration | Status |
|-------|-------|----------|--------|
| **Phase 1** | Hero section refactor + value proposition | ~4 hours | ✅ Complete |
| **Phase 2** | Expanded features + How-It-Works section | ~3.5 hours | ✅ Complete |
| **Phase 3** | Testimonials + stats + use cases | ~3 hours | ✅ Complete |
| **Phase 4** | SEO, performance, testing, deployment | 2-3 days | ✅ Complete |

## Key Constraints
- **Design**: Yellow (#ffdb33) + Black + hard shadows, no rounded corners
- **Fonts**: Archivo Black (headlines), Space Grotesk (body), Geist Sans (fallback)
- **Tech**: Next.js 16, React 19, Tailwind v4, SupabaseAuth, TanStack Query
- **Performance**: Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
- **Accessibility**: WCAG 2.1 AA, alt text, keyboard nav, video captions

## File Structure (New/Modified)
```
frontend/
├── app/
│   ├── page.tsx (refactor: hero + sections)
│   └── layout.tsx (add SEO metadata)
├── components/
│   ├── landing/
│   │   ├── HeroSection.tsx (NEW)
│   │   ├── ValueProposition.tsx (NEW)
│   │   ├── FeaturesSection.tsx (NEW)
│   │   ├── HowItWorksSection.tsx (NEW)
│   │   ├── UseCasesSection.tsx (NEW)
│   │   ├── TestimonialsSection.tsx (NEW)
│   │   ├── StatsSection.tsx (NEW)
│   │   ├── FAQSection.tsx (NEW)
│   │   ├── CTASection.tsx (NEW)
│   │   └── index.ts (exports)
│   └── retroui/
│       ├── Button.tsx (enhance)
│       └── CardWithBorder.tsx (NEW)
└── lib/
    └── landing-data.ts (NEW: testimonials, FAQs, stats)
```

## Success Metrics
- Conversion rate: 2-5% (measure via analytics)
- Bounce rate: <50%
- Time-on-page: >90 seconds
- CTA CTR: 8-12%
- Mobile usability: 100% on PageSpeed
- Core Web Vitals: All green

## Research Insights (Applied)
- Hero: 6-8 words benefit-focused, dual CTA, above fold <600px
- Value: 3-5 benefits in 30-60s content, lead with ROI
- Social Proof: 5-10 testimonials, quantified stats (10K+ learners, 95% completion)
- Features: Quiz, flashcard, progress, certificate, video focus
- Mobile: 60% traffic mobile, hamburger nav, 48px CTAs, test iOS Safari + Android
- Performance: Images optimized, lazy load, stale-while-revalidate pattern
- SEO: Schema.org markup, meta 155-160 chars, H1 unique <60 chars

## Next Steps
→ **Phase 1 Complete**: Review `PHASE_1_COMPLETION_REPORT.md`
→ **Phase 2 Complete**: Review `PHASE_2_COMPLETION_REPORT.md`
→ **Phase 3 Complete**: Review `PHASE_3_COMPLETION_REPORT.md`
→ **Phase 4 Complete**: Review `PHASE_4_COMPLETION_REPORT.md` and `PHASE_4_TESTING_CHECKLIST.md`
→ **Next**: Execute testing checklist and deploy to production
