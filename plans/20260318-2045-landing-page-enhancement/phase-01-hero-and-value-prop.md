---
title: Phase 1 - Hero Section & Value Proposition
parent: plan.md
status: pending
duration: 3-4 days
priority: high
---

# Phase 1: Hero Section & Value Proposition Refactor

## Context
Establish strong first impression and clear value prop (60% users decide in <10s). Hero drives conversion; value section clarifies "why" not "what".

**Parent Plan**: `plan.md`
**Dependencies**: None (foundational phase)
**Next Phase**: Phase 2 (Features & How-It-Works)

## Key Insights (from Research)
- **Headline**: 6-8 words, benefit-focused, avoid jargon (current: "Tiny LMS" is just brand—weak)
- **Subheadline**: 1-2 sentences explaining "why," not "what"
- **CTA**: 2-4 words, action-oriented. Best performers: "Get started free," "Start learning today"
- **Above fold**: <600px height, mobile-first
- **Dual CTA**: Primary (high commitment) + Secondary (low commitment, e.g., watch demo)
- **Value Prop**: 3-5 benefits (ROI-focused), 30-60s read, lead with outcomes
- **Mobile**: 60% of LMS traffic is mobile—stacked layout, thumb-friendly (48px+) CTAs

**Research**: `researcher-01-lms-conversion-practices.md` (sections 1.1-1.2)
**Current State**: `scout-01-frontend-structure.md` (hero is yellow, generic "Tiny LMS" headline, dual CTAs present but weak copy)

## Requirements

### Technical
- Refactor existing hero from monolithic HTML to component-based
- Create `HeroSection.tsx` component (mobile-first, responsive)
- Create `ValueProposition.tsx` component (3-5 benefit cards in bento/grid)
- Maintain NeoBrutalism design: no rounded corners, hard shadows, yellow + black
- Preserve existing color scheme: #ffdb33 yellow, #000000 black, white backgrounds
- Fonts: Archivo Black (headlines), Space Grotesk (body)

### Design
- **Hero Layout**:
  - Desktop: 2-column (text left, imagery right) or full-width stacked on mobile
  - Badge: "LMS v1.0" or more benefit-driven (e.g., "For Instructors & Learners")
  - Headline: Bold, benefit-focused (e.g., "Build and Share Knowledge Instantly")
  - Subheadline: 1-2 sentences outcome-focused
  - CTAs: Primary (yellow bg, black text) + Secondary (white bg, black border)
  - Stats: Dynamically fetch or hardcode (courses, students, completion rate)
- **Value Prop Layout**:
  - 3-5 benefit cards in bento/grid (responsive 1-3 columns)
  - Each card: icon + title + 1-2 sentence benefit (outcome-focused)
  - Maintain NeoBrutalism: border-[3px] border-black, shadow-[4px_4px_0px_0px_#000]
  - Hover: shadow expand, translate effect

### Content (to Draft)
- **Hero Headline**: ~7 words, benefit-focused (e.g., "Create Engaging Courses in Minutes")
- **Hero Subheadline**: 1-2 sentences outcome-focused (e.g., benefit to instructor + student)
- **Primary CTA**: "Get Started Free" or "Create Your First Course"
- **Secondary CTA**: "Watch 2-minute demo" or "Explore courses"
- **Value Prop Benefits**:
  1. ROI (time saved for instructors)
  2. Student engagement (interactive tools)
  3. Analytics/insights (data-driven)
  4. Flexibility (mobile, offline support)
  5. Trust/compliance (security)

## Architecture

### Component Structure
```
components/landing/
├── HeroSection.tsx
│   ├── Uses Button (from retroui)
│   ├── Uses Lucide icons (optional hero visual)
│   ├── Props: title, subtitle, primaryCTA, secondaryCTA, stats
│   └── Mobile-first responsive layout
├── ValueProposition.tsx
│   ├── BentoGrid (3-5 cards)
│   ├── Each card: icon, benefit title, description
│   ├── Props: benefits array
│   └── Responsive: 1 col mobile, 2-3 col desktop
└── index.ts (export HeroSection, ValueProposition)
```

### Data Structure
```typescript
// landing-data.ts
export const HERO_CONTENT = {
  headline: string;
  subheadline: string;
  primaryCta: { text: string; href: string };
  secondaryCta: { text: string; href: string };
  stats: Array<{ number: string; label: string }>;
};

export const VALUE_PROPS = Array<{
  id: string;
  icon: string; // lucide icon name
  title: string;
  description: string;
}>;
```

## Related Code Files
- **Modify**: `/frontend/app/page.tsx` (replace hero + add value prop)
- **Modify**: `/frontend/app/layout.tsx` (add SEO metadata for hero)
- **Create**: `/frontend/components/landing/HeroSection.tsx`
- **Create**: `/frontend/components/landing/ValueProposition.tsx`
- **Create**: `/frontend/components/landing/index.ts`
- **Create**: `/frontend/lib/landing-data.ts`

## Implementation Steps

### Step 1: Extract Hero Data (1-2 hours)
1. Define HERO_CONTENT in `landing-data.ts` (headline, subheadline, CTAs, stats)
2. Define VALUE_PROPS array (5 benefits with icons, titles, descriptions)
3. Test data structure with TypeScript types

### Step 2: Create HeroSection Component (2-3 hours)
1. Create `/frontend/components/landing/HeroSection.tsx`
2. Accept props: title, subtitle, primaryCta, secondaryCta, stats
3. Layout:
   - Desktop: Flex row (text left 60%, optional visual right 40%)
   - Mobile: Stack, 100% width
4. Typography: h1 (Archivo Black, 5xl-7xl), p (Space Grotesk, xl-2xl)
5. CTAs: Use Button component (primary: yellow bg, secondary: white border)
6. Stats: 3-4 rows, flexbox wrap with gap
7. Add hover effects: button shadows expand, translate effect

### Step 3: Create ValueProposition Component (2-3 hours)
1. Create `/frontend/components/landing/ValueProposition.tsx`
2. Props: benefits array (id, icon, title, description)
3. Layout:
   - Desktop: Grid 3 cols (or bento 2x3)
   - Mobile: Stack 1 col
4. Each card: border-[3px] border-black, bg-white, hover shadow/translate
5. Icons: From Lucide React library
6. Typography: h3 (font-bold xl), p (text-gray-600 text-sm)

### Step 4: Integrate Into Landing Page (1-2 hours)
1. Replace existing hero section in `/frontend/app/page.tsx` with HeroSection component
2. Add ValueProposition component after hero
3. Pass data from landing-data.ts
4. Verify layout responsive (mobile, tablet, desktop)

### Step 5: Mobile Testing & Refinement (1-2 hours)
1. Test on iOS Safari 15+, Android Chrome
2. Verify CTA hit targets (48px+)
3. Check text readability (contrast 4.5:1, font size ≥16px)
4. Optimize spacing: 40-60px desktop, 20-30px mobile

### Step 6: Performance Audit (1 hour)
1. Run Lighthouse on hero + value section
2. Target LCP <2.5s (no large images, optimize fonts)
3. Check CLS: avoid layout shifts in CTA buttons
4. Validate FID <100ms (no heavy JS on scroll)

## Success Criteria
- Hero visible without scroll (mobile ≤2s, desktop ≤3s)
- Headline tested with A/B framework (remember: 6-8 words, benefit-focused)
- Both CTAs functional, mobile-friendly (48px target size)
- Value props: 5 benefits, outcome-focused, NeoBrutalism styled
- Mobile: Responsive stack, no horizontal scroll
- Accessibility: Alt text on icons, keyboard nav (Tab through CTAs), WCAG 2.1 AA contrast
- Lighthouse: Hero+ValueProp section scores >90 on Performance

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| CTA copy unclear | Medium | High | A/B test 2-3 variations (sample size 100+) |
| Mobile hero too tall | High | Medium | Test on real devices, aim for 1-1.5 viewport height |
| Value props too wordy | Medium | Medium | Limit description to 1 sentence (max 60 chars) |
| Image/icon load slow | Medium | High | Use CSS gradients + Lucide icons (no external images phase 1) |
| Font variable not loaded | Low | High | Verify font-families in globals.css pre-phase |

## Security Considerations
- No user input in hero/value sections (hardcoded copy)
- CTAs use Next.js Link (prevents XSS)
- Stats fetch from API should validate response shape (TanStack Query handles)
- No sensitive data exposed

## Next Steps
→ After Phase 1 complete, proceed to **Phase 2**: Features section expansion + How-It-Works
→ Gather A/B test data on hero CTA (track conversions, time-on-page)
→ Prepare testimonials/social proof content for Phase 3
