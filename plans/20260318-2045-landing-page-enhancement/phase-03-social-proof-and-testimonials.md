---
title: Phase 3 - Social Proof, Testimonials & Use Cases
parent: plan.md
depends_on: phase-02-features-and-how-it-works.md
status: pending
duration: 3-4 days
priority: high
---

# Phase 3: Social Proof, Testimonials & Use Cases

## Context
Build trust through social proof: quantified stats (10K+ learners, 95% completion), testimonials (text + video), logo wall, use cases. LMS platforms see 2-3% higher conversion with testimonials.

**Parent Plan**: `plan.md`
**Dependencies**: Phase 2 (features established)
**Next Phase**: Phase 4 (SEO, performance, deployment)

## Key Insights (from Research)
- **Social Proof**: 5-10 testimonials (video > text), quantified stats, 8-15 logos, case studies
- **Stats**: 10K+ learners, 95% course completion rate, time savings metrics
- **Use Cases**: 2-3 detailed scenarios (corporate training, university course, hobbyist learning)
- **Testimonials**: Name, title, company, photo, 1-2 sentence quote
- **Video testimonials**: 30-60s clips (higher conversion impact)
- **Trust badges**: SOC2, GDPR, certifications (if applicable)

**Research**: `researcher-01-lms-conversion-practices.md` (section 3.0)
**Current State**: No testimonials, basic stats in hero only, no use cases

## Requirements

### Technical
- Create `TestimonialsSection.tsx` (carousel or grid, text + optional video)
- Create `StatsSection.tsx` (3-5 key metrics, animated numbers optional)
- Create `UseCasesSection.tsx` (2-3 use case cards with details)
- Create `FAQSection.tsx` (expandable Q&A, SSR-friendly state)
- Maintain NeoBrutalism styling (borders, shadows, no rounded corners)
- Use Lucide icons for social proof badges
- Responsive: 1 col mobile, 2-3 col desktop

### Design
- **Stats Section**:
  - 4-5 large metric cards: number (Archivo Black, 4xl+), label (Space Grotesk)
  - Layout: Flex wrap, centered, gap 32-48px
  - Card styling: Optional border (if distinct), or just typography + icon
  - Metrics: Courses created, students learning, completion rate %, time saved (hours)
- **Testimonials Section**:
  - Grid or carousel: 3-5 testimonials per row (desktop), 1 row (mobile)
  - Card: photo (avatar, 64px), name + title + company, quote (max 3 lines)
  - Optional: Video thumbnail (play button overlay)
  - Styling: bg-white, border-[3px] border-black, hover shadow/translate
  - Call-to-action: "See more testimonials" or carousel nav
- **Use Cases Section**:
  - 2-3 use case cards (title, description, outcome metrics, CTA)
  - Layout: Flex column (mobile), 2-3 col grid (desktop)
  - Card: bg-white, border-[3px], icon + title + description + metrics + CTA
  - Example use cases: Corporate skills training, University online courses, Self-paced learning community
- **FAQ Section**:
  - Accordion (expand/collapse Q&A items)
  - Desktop: 2-col layout (12-item FAQ total), mobile: 1 col
  - Styling: Simple borders, no complex styling needed
  - Items: Instructor & student questions (5-6 each category)

### Content (to Draft)
- **Stats** (hardcoded or API-fetched):
  1. X+ Courses Created
  2. Y+ Students Learning
  3. Z% Average Completion Rate
  4. W+ Hours Time Saved (for instructors)
- **5-10 Testimonials** (name, title, company, quote):
  - Mix instructor + student personas
  - Include 1-2 video testimonial clips (optional phase 1)
- **2-3 Use Cases**:
  1. Corporate skills training (HR team, learning outcomes)
  2. University online courses (instructor time savings, student engagement)
  3. Self-paced learning community (flexibility, accessibility)
- **10-12 FAQ Items**:
  - Instructor: Setup time, student management, analytics access
  - Student: Mobile access, offline support, certificate value, pricing
  - General: Security, compliance, integrations

## Architecture

### Component Structure
```
components/landing/
├── StatsSection.tsx
│   ├── Props: stats array (number, label, icon)
│   └── Responsive flex wrap layout
├── TestimonialsSection.tsx
│   ├── Props: testimonials array (photo, name, title, company, quote, videoUrl?)
│   ├── Carousel or grid (3-5 per row desktop, 1 mobile)
│   └── Optional: video play button overlay
├── UseCasesSection.tsx
│   ├── Props: useCases array (icon, title, description, metrics, cta)
│   └── Responsive grid 2-3 cols (desktop), 1 col (mobile)
├── FAQSection.tsx
│   ├── Props: faqItems array (category, question, answer)
│   ├── Accordion state management (expand/collapse)
│   └── 2-col grid (desktop), 1 col (mobile)
└── index.ts (export all)
```

### Data Structure
```typescript
// landing-data.ts (extend)
export const STATS = Array<{
  number: string; // "10K+", "95%", etc.
  label: string;
  icon?: string;
}>;

export const TESTIMONIALS = Array<{
  id: string;
  name: string;
  title: string; // "Instructor", "Student"
  company: string;
  photo: string; // URL or local avatar
  quote: string;
  videoUrl?: string; // optional video clip
}>;

export const USE_CASES = Array<{
  id: string;
  icon: string;
  title: string;
  description: string;
  metrics: Array<{ label: string; value: string }>;
  cta: { text: string; href: string };
}>;

export const FAQ_ITEMS = Array<{
  id: string;
  category: string; // "instructor", "student", "general"
  question: string;
  answer: string;
}>;
```

## Related Code Files
- **Modify**: `/frontend/app/page.tsx` (add 4 new sections after how-it-works)
- **Modify**: `/frontend/lib/landing-data.ts` (add STATS, TESTIMONIALS, USE_CASES, FAQ_ITEMS)
- **Create**: `/frontend/components/landing/StatsSection.tsx`
- **Create**: `/frontend/components/landing/TestimonialsSection.tsx`
- **Create**: `/frontend/components/landing/UseCasesSection.tsx`
- **Create**: `/frontend/components/landing/FAQSection.tsx`
- **Modify**: `/frontend/components/landing/index.ts`

## Implementation Steps

### Step 1: Prepare Content Assets (2-3 hours)
1. Collect/write 5-10 testimonials (instructor + student personas, authentic quotes)
2. Gather 2-3 user photos or create placeholder avatars
3. Draft stats (courses, students, completion rate, time saved)
4. Write 2-3 use case scenarios with metrics
5. Compile 10-12 FAQ questions + answers
6. Optional: Record/gather 1-2 video testimonial clips (30-60s)

### Step 2: Create StatsSection Component (1-2 hours)
1. Create `/frontend/components/landing/StatsSection.tsx`
2. Props: stats array
3. Layout: `flex flex-wrap justify-center gap-12` or grid
4. Each stat: Large number (Archivo Black, text-4xl), label (Space Grotesk, text-sm)
5. Optional: Icon before/after number (Lucide icon, 32px)
6. Desktop: 4-5 stats in row, mobile: 2-3 in row
7. Styling: Minimal (just typography), or add NeoBrutalism borders if prominent

### Step 3: Create TestimonialsSection Component (2-3 hours)
1. Create `/frontend/components/landing/TestimonialsSection.tsx`
2. Props: testimonials array
3. Layout: Grid 3 cols (desktop), 1 col (mobile)
4. Card: bg-white, border-[3px] border-black, p-6
5. Avatar: 64px circle (or square, no radius in NeoBrutalism), top-left
6. Quote: italic, text-gray-700, max 3 lines (line-clamp-3)
7. Footer: Name (bold), title (italic, gray), company (small, gray)
8. Optional: Video testimonial card (thumbnail + play button overlay)
9. Hover: shadow-[6px_6px_0px_0px_#000], translate effect
10. Mobile: Stack cards vertically

### Step 4: Create UseCasesSection Component (2-3 hours)
1. Create `/frontend/components/landing/UseCasesSection.tsx`
2. Props: useCases array
3. Layout: Grid 2 cols (desktop), 1 col (mobile)
4. Card: bg-white, border-[3px] border-black, p-6-8
5. Icon: 48px, bg-[#ffdb33], centered, top
6. Title: font-bold, text-xl
7. Description: text-gray-600, text-sm, max 3 lines
8. Metrics: Small table or list (e.g., "95% engagement ↑", "10 hrs time saved")
9. CTA button: Yellow bg, black text (optional mini button)
10. Hover: shadow expand, translate

### Step 5: Create FAQSection Component (2-3 hours)
1. Create `/frontend/components/landing/FAQSection.tsx`
2. Props: faqItems array, optionally filtered by category
3. State: expandedId (track which Q is open)
4. Layout: Grid 2 cols (desktop), 1 col (mobile)
5. Item styling:
   - Collapsed: border-b-[2px] border-black, cursor pointer
   - Expanded: bg-[#fffacd] (light yellow) or border-[3px] border-black
6. Toggle: Click Q to expand/collapse answer
7. Icon: Chevron (Lucide) pointing down (expanded) or right (collapsed)
8. Answer: Text-gray-600, text-sm, max 5 lines visible (can scroll if needed)
9. Optional: Category filter tabs ("Instructor", "Student", "General")

### Step 6: Integrate Into Landing Page (1-2 hours)
1. Import 4 new components in `/frontend/app/page.tsx`
2. Add sections in order: Stats → Testimonials → Use Cases → FAQ
3. Pass data from landing-data.ts
4. Ensure layout flow and spacing
5. Verify existing sections not disrupted

### Step 7: Mobile Testing & Optimization (2-3 hours)
1. Test on iOS Safari, Android Chrome
2. Testimonials: Ensure cards stack, text readable
3. FAQ: Test expand/collapse, no layout shift
4. Use cases: Grid responsive, icon sizes
5. Stats: Numbers readable, no overflow
6. Verify spacing: 20-30px mobile, 40-60px desktop

### Step 8: Performance & Accessibility (1-2 hours)
1. Lighthouse audit for all 4 sections
2. Avatar images: Optimize if local assets (next/image component)
3. Video testimonials: Lazy-load with iframe sandbox
4. Ensure alt text on avatars, icons (aria-label)
5. Keyboard nav: Tab through FAQ items, open/close with Enter
6. Video captions: Mandatory if video testimonials included

## Success Criteria
- Stats visible: 4-5 metrics, number + label clear
- Testimonials: 5+ cards visible (grid or carousel), photo + quote + name legible
- Use cases: 2-3 cards visible, benefit clear per use case
- FAQ: 10+ items, expand/collapse functional, 2-col layout (desktop) responsive
- Mobile: All sections stack nicely, no horizontal scroll
- Accessibility: Alt text, keyboard nav (Tab + Enter), color contrast ≥4.5:1
- Lighthouse: >90 on Performance for entire page including these sections
- Conversion ready: Testimonials/stats should increase perceived trust

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| No real testimonials available | Medium | High | Use placeholder quotes with "Feedback from early users" label; prioritize collecting real ones post-launch |
| Video testimonials slow page load | High | High | Lazy-load video with iframe, use thumbnail only on first load |
| FAQ too long (>12 items) | Medium | Medium | Categorize (instructor/student/general), show 6 on initial load, "Load more" button |
| Testimonial photos missing | Medium | Medium | Use Lucide avatars or initials in colored circles (NeoBrutalism style) |
| Accordion state not persisting on mobile | Low | Low | Use React state (local only, no localStorage needed for phase 1) |

## Security Considerations
- No user input in testimonials/FAQ (hardcoded content)
- Avatar images: Use Next.js Image component if external URLs
- Video iframe: Add sandbox attribute (allow-same-origin, allow-scripts only)
- FAQ content: Validate HTML encoding if pulled from CMS (future)

## Next Steps
→ After Phase 3 complete, proceed to **Phase 4**: SEO, performance optimization, testing, deployment
→ Gather real testimonials from early users/beta testers
→ Prepare analytics setup (conversion tracking, bounce rate, time-on-page)
→ Plan A/B testing framework for testimonial placement/style
