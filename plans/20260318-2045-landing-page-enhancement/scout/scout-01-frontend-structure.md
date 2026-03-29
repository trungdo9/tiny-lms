---
name: Frontend Structure & Landing Page Current State
description: Scout report on frontend architecture, landing page structure, and design system
type: scout
---

# Frontend Structure Scout Report

## Tech Stack & Architecture
- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5
- **Styling:** Tailwind CSS v4, shadcn/ui, custom theme variables
- **Fonts:** Geist Sans, Geist Mono, Archivo Black, Space Grotesk (Google Fonts)
- **State/Data:** TanStack React Query v5, Supabase Auth, REST API (3001)
- **Components:** Public Layout (PublicHeader, PublicFooter), landing page features grid, featured courses section

## Design System (NeoBrutalism/RetroUI)
**Color Palette:**
- Primary: Yellow (#ffdb33) — used for CTAs, highlights, hover states
- Secondary: Black (#1a1a1a, #000000) — text, borders, shadows
- Tertiary: White (backgrounds)

**Typography:**
- Headlines: Archivo Black (bold, high contrast)
- Body: Space Grotesk, Geist Sans (modern, readable)

**Visual Language:**
- Hard shadows: `4px 4px 0px 0px #000`, `6px 6px 0px 0px #000`
- Thick borders: `3px solid #000` or `border-[4px]`
- Hover effects: translate, shadow expansion, background highlight
- No rounded corners (NeoBrutalism characteristic)

## Current Landing Page (`frontend/app/page.tsx`)
**Hero Section:**
- Yellow background gradient (#ffdb33 → #ffd700)
- Black headline "Tiny LMS" in Archivo Black
- Subheadline: "The compact Learning Management System"
- Two CTAs: "Start Learning" (black) + "Browse Courses" (yellow outline)
- Simple layout, minimal imagery

**Features Section:**
- 5-item Bento grid layout
- Features: Quizzes, Flash Cards, Progress Tracking, Certificates, Video
- Each feature has icon (from lucide-react) + title + description
- Grid auto-fit with responsive columns

**Featured Courses Section:**
- Displays 3 courses fetched via TanStack Query
- Course cards: image, title, instructor, rating, CTA button
- Grid layout with gap spacing

**Footer:**
- Minimal: copyright, Home/Courses links
- NeoBrutalism styling with top border

**Current Limitations:**
- No testimonials/social proof section
- No SEO optimization (meta tags insufficient)
- No mobile-specific optimizations visible
- No "How It Works" section
- No pricing information
- No FAQ section
- No use case examples
- No stats/metrics section
- Basic featured courses (no load state, error handling minimal)

## Frontend File Structure
```
frontend/
├── app/
│   ├── page.tsx (landing page)
│   ├── layout.tsx (root layout)
│   ├── globals.css (theme variables)
│   └── [other routes...]
├── components/
│   ├── layout/public/
│   │   ├── PublicHeader.tsx
│   │   └── PublicFooter.tsx
│   ├── retroui/
│   │   └── Button.tsx (NeoBrutalism button component)
│   ├── providers.tsx (Supabase, Query, etc.)
│   └── [other components...]
└── lib/
    ├── api.ts (REST API client)
    ├── supabase.ts (Supabase client)
    └── [utilities...]
```

## Key Technical Constraints
- **NeoBrutalism must be maintained:** Yellow + black + hard shadows
- **Fonts available:** Archivo Black (headlines), Space Grotesk (body)
- **No rounded corners:** Align with design system (sharp angles)
- **API Integration:** `/api/courses` for featured courses, already in place
- **Responsive:** Mobile-first using Tailwind CSS (480px, 768px, 1024px breakpoints)
- **Performance:** Next.js Image component available, no large assets currently

## SEO Current State
- Meta title: "Tiny LMS" (generic)
- Meta description: "A compact Learning Management System" (generic)
- No structured data (JSON-LD)
- No Open Graph tags
- No canonical URLs
- No robots.txt customization

---

**Unresolved Questions:**
- Should testimonials be hardcoded or fetched from backend?
- Should FAQ section be editable by admins?
- What metrics/stats should be displayed (courses, students, etc.)?
- Should pricing section be included if no monetization planned?
