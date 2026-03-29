---
title: Phase 2 - Features Expansion & How-It-Works
parent: plan.md
depends_on: phase-01-hero-and-value-prop.md
status: pending
duration: 3-4 days
priority: high
---

# Phase 2: Features Expansion & How-It-Works Section

## Context
Showcase Tiny LMS capabilities (quiz, flashcard, analytics) with detailed descriptions. How-It-Works reduces adoption friction by clarifying 3-step flow for instructors vs. students.

**Parent Plan**: `plan.md`
**Dependencies**: Phase 1 (hero + value prop foundation)
**Next Phase**: Phase 3 (Social Proof & Testimonials)

## Key Insights (from Research)
- **Features**: Focus on outcomes (not tech): engagement ↑, time-to-implement ↓, completion rate ↑
- **LMS-specific**: Interactive quizzes, spaced repetition flashcards, real-time analytics, certificates, mobile support
- **How-It-Works**: 3-step flow per persona (instructor vs. student), timeline visual, realistic screenshots
- **Mobile**: 60% traffic mobile—ensure features visible/clickable on small screens
- **Design**: Expand existing 5-feature grid to 6-8 features + role-based how-it-works

**Research**: `researcher-01-lms-conversion-practices.md` (sections 2.1-2.2)
**Current State**: 5-feature bento grid (quizzes, flashcards, progress, certificates, video); no how-it-works

## Requirements

### Technical
- Expand features section from 5 → 8 items (add use cases per feature)
- Create `FeaturesSection.tsx` component (grid layout, responsive)
- Create `HowItWorksSection.tsx` component (role-based tabs + timeline)
- Maintain NeoBrutalism: borders, shadows, no rounded corners
- Use existing Button, icons from Lucide
- Responsive: 1 col mobile, 2-3 col tablet, 3-4 col desktop

### Design
- **Features Grid**:
  - 6-8 feature cards (quiz, flashcard, progress, certificate, video, collaboration*, messaging*, analytics*)
  - Each card: icon (Lucide), title, 1-2 sentence benefit, optional "Learn more" link
  - Desktop: 4-col grid, mobile: 1-2 col
  - Card styling: border-[3px] border-black, bg-white, hover shadow/translate
  - Visual hierarchy: Icon (Lucide) + bold title + gray descriptive text
- **How-It-Works**:
  - Dual-persona tabs: "For Instructors" | "For Students"
  - 3-step timeline per persona (visual progression: numbered or arrows)
  - Step details: Icon + title + 1-2 sentence description
  - Mobile: Vertical timeline, desktop: horizontal or vertical
  - Optional: Hero image for each step (gradient placeholder if no image)

### Content (to Draft)
- **8 Features**: Quizzes (engagement), Flashcards (retention), Progress (insights), Certificates (credibility), Video (accessibility), Collaboration (social learning), Analytics (data-driven), Mobile-First (anywhere learning)
- **How-It-Works - Instructor Flow**:
  1. Create course (5 min setup)
  2. Add quizzes & flashcards (drag-drop builder)
  3. Track student progress (real-time analytics)
- **How-It-Works - Student Flow**:
  1. Enroll in course
  2. Complete lessons + quizzes
  3. Earn certificate upon completion

## Architecture

### Component Structure
```
components/landing/
├── FeaturesSection.tsx
│   ├── Props: features array (id, icon, title, description)
│   ├── Grid: responsive 1-4 cols
│   ├── Card: icon, title, desc, optional "Learn more"
│   └── Styling: NeoBrutalism (border, shadow, hover)
├── HowItWorksSection.tsx
│   ├── Tab state: instructor | student
│   ├── Timeline: 3 steps vertical (mobile) or horizontal (desktop)
│   ├── Step: icon, title, description, optional image
│   └── Mobile: Stacked, desktop: flex row/grid
└── index.ts (export both)
```

### Data Structure
```typescript
// landing-data.ts (extend)
export const FEATURES = Array<{
  id: string;
  icon: string; // lucide icon name
  title: string;
  description: string;
  learnMoreHref?: string;
}>;

export const HOW_IT_WORKS = {
  instructor: Array<{
    step: number;
    icon: string;
    title: string;
    description: string;
    imageUrl?: string;
  }>;
  student: Array<{
    step: number;
    icon: string;
    title: string;
    description: string;
    imageUrl?: string;
  }>;
};
```

## Related Code Files
- **Modify**: `/frontend/app/page.tsx` (replace features grid, add how-it-works)
- **Modify**: `/frontend/lib/landing-data.ts` (add FEATURES, HOW_IT_WORKS)
- **Create**: `/frontend/components/landing/FeaturesSection.tsx`
- **Create**: `/frontend/components/landing/HowItWorksSection.tsx`
- **Modify**: `/frontend/components/landing/index.ts` (export new components)

## Implementation Steps

### Step 1: Define Features & How-It-Works Data (1-2 hours)
1. Expand FEATURES array in landing-data.ts (6-8 items, benefit-focused descriptions)
2. Define HOW_IT_WORKS object (instructor + student flows, 3 steps each)
3. Add icon names (map to Lucide icons)
4. TypeScript types for validation

### Step 2: Create FeaturesSection Component (2-3 hours)
1. Create `/frontend/components/landing/FeaturesSection.tsx`
2. Props: features array
3. Layout:
   - Desktop: `grid-cols-4` (or 3-4 depending on content)
   - Tablet: `md:grid-cols-2`
   - Mobile: `grid-cols-1`
4. Card styling:
   - bg-white, border-[3px] border-black
   - Padding: 24px (desktop), 16px (mobile)
   - Hover: shadow-[6px_6px_0px_0px_#000], translate-y-[-2px]
5. Icon: 40x40px, bg-[#ffdb33], centered
6. Title: font-bold, text-lg, font-archivo-black
7. Description: text-gray-600, text-sm, max 2 lines
8. Optional link: "Learn more →" (text-blue or yellow, no underline default, hover underline)

### Step 3: Create HowItWorksSection Component (2-3 hours)
1. Create `/frontend/components/landing/HowItWorksSection.tsx`
2. State: tabs (instructor | student)
3. Tab buttons: White bg, black border, yellow on active
4. Timeline layout:
   - Desktop: Flex row, optional horizontal line connector
   - Mobile: Flex column, vertical line connector (CSS border-left)
5. Step card: number circle (yellow bg, black text), icon, title, description
6. Optional: Image placeholder per step (gradient or placeholder icon)
7. Responsive: Ensure mobile doesn't overflow, text readable

### Step 4: Integrate Into Landing Page (1-2 hours)
1. Import FeaturesSection, HowItWorksSection in `/frontend/app/page.tsx`
2. Replace existing 5-feature grid with FeaturesSection
3. Add HowItWorksSection after features
4. Pass data from landing-data.ts
5. Ensure layout flow: Hero → Value Prop → Features → How-It-Works

### Step 5: Mobile Testing (1-2 hours)
1. Test on iOS Safari, Android Chrome
2. Verify grid responsive (no overflow)
3. Check feature cards: icons visible, text readable
4. Test How-It-Works tabs: tap to switch, timeline stacks vertically
5. CTA target size: ≥48px
6. Spacing: 20-30px mobile, 40-60px desktop

### Step 6: Performance & Accessibility (1 hour)
1. Lighthouse audit (Features + How-It-Works section)
2. Ensure no layout shift (CLS <0.1)
3. Verify keyboard nav: Tab through tabs, arrow keys to switch tabs
4. Alt text on all icons (decorative: aria-hidden, or descriptive alt)
5. Color contrast: 4.5:1 minimum (yellow bg + black text tested)
6. Video captions if step images are video clips

## Success Criteria
- Features section: 6-8 cards visible, responsive, outcome-focused copy
- How-It-Works: Tab switching functional, 3 steps per persona visible, timeline clear
- Mobile: Single-column layout, no horizontal scroll, readable font (≥16px)
- Accessibility: Keyboard nav, tab order logical, alt text present
- Lighthouse: Score >90 on Performance for this section
- Design consistency: NeoBrutalism maintained (borders, shadows, colors)
- A/B ready: How-It-Works messaging can be tested (instructor vs. student resonance)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Too many features (8+) overwhelming | Medium | Medium | Limit to 6-8, prioritize based on research (quiz, flashcard, analytics priority) |
| How-It-Works copy unclear | Medium | High | Use verb-focused copy ("Create → Add → Track" structure) |
| Tabs UX confusing on mobile | Medium | Medium | Test toggle state visual (highlight active tab with yellow bg + black text) |
| Timeline layout breaks on mobile | High | Medium | Use vertical stacking on mobile, horizontal on desktop |
| Performance regression | Low | High | Lazy-load images (if added), use CSS gradients for placeholder |

## Security Considerations
- No user input in features/how-it-works (hardcoded content)
- Links use Next.js Link (XSS prevention)
- No API calls in this phase (data is static)

## Next Steps
→ After Phase 2 complete, proceed to **Phase 3**: Testimonials + Social Proof + Use Cases
→ Prepare testimonial content (5-10 text/video testimonials from users/instructors)
→ Gather stats data (courses created, students enrolled, completion rates)
→ Consider admin panel for managing testimonials (future phase)
