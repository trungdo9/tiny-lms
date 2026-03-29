---
name: Tiny LMS Frontend Analysis - Current State
description: Analysis of current landing page structure, tech stack, and design system
type: research
---

# Tiny LMS Frontend Current State Analysis

## 1. LANDING PAGE LOCATION & STRUCTURE

**Root Landing Page**: `/frontend/app/page.tsx` (mounted at `/`)
**Layout**: `/frontend/app/(public)/layout.tsx`

### Current Sections
- **Hero**: "Tiny LMS" headline, yellow (#ffdb33) background, dual CTAs
- **Features**: Bento grid (5 features: Quizzes, Flash Cards, Progress Tracking, Certificates, Video)
- **Featured Courses**: 3-course grid with data fetching
- **CTA Section**: "Ready to Start Learning?" callout
- **Footer**: Minimal branding footer

### Public Routes
- `/` - Landing page
- `/(public)/courses` - Course catalog
- `/(public)/courses/[slug]` - Course detail
- `/(auth)/login` - Login/Register

---

## 2. TECH STACK CONFIRMED

**Core**: Next.js 16, React 19, TypeScript 5
**State Management**: TanStack React Query v5, Zustand v5
**UI Framework**: Tailwind CSS v4, shadcn/ui, Lucide React
**Charts**: Recharts v3.7
**Auth**: Supabase v2.97

---

## 3. DESIGN SYSTEM

### Brand Colors (NeoBrutalism)
- **Primary Yellow**: #ffdb33 (accent, buttons)
- **Secondary Black**: #000000 (borders, text)
- **Accent**: White backgrounds

### Typography
- **Headings**: Archivo Black (archivo-black)
- **Body**: Space Grotesk (space-grotesk)
- **Scale**: 5xl–7xl (h1), 3xl–4xl (h2), xl (h3)

### Design Principles
- **NeoBrutalism/RetroUI**: Bold borders (2–3px), hard shadows (4–6px), no border-radius
- **Animations**: Transition-all with translate-y/translate-x hover effects
- **Icons**: Lucide React library

---

## 4. API & DATA PATTERNS

**Client**: `/frontend/lib/api.ts` with `fetchApi<T>()` base function
**Query Keys**: `/frontend/lib/query-keys.ts` hierarchical factory
**Pattern**: TanStack Query with 60sec staleTime caching

---

## 5. PERFORMANCE STATUS

### Current State
- **Images**: Using CSS gradients + placeholder icons, NO Next.js Image optimization
- **Code Splitting**: Route-based via App Router, no explicit dynamic imports
- **Lazy Loading**: TanStack Query caching, skeleton loaders for async states

### Issues Identified
- No image optimization for featured courses
- Potential performance gap on mobile
- Limited mobile-first design in hero section

---

## Key Files
- `/frontend/app/page.tsx` - Landing page component
- `/frontend/app/(public)/layout.tsx` - Public layout wrapper
- `/frontend/lib/api.ts` - API client (base function)
- `/frontend/lib/query-keys.ts` - Query key factory
- `/frontend/app/globals.css` - Tailwind v4 + CSS variables
- `/frontend/components/retroui/` - RetroUI component library

---

## OBSERVATIONS

1. **NeoBrutalism design** is established; should be maintained/enhanced
2. **Landing page is functional but basic** - lacks social proof, testimonials, detailed features
3. **Mobile optimization needed** - hero needs responsive improvements
4. **Image optimization opportunity** - implement Next.js Image component
5. **Performance gaps** - Core Web Vitals monitoring needed
6. **No SEO setup visible** - metadata, structured data should be added
