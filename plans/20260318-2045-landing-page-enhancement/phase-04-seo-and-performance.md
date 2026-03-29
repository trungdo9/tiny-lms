---
title: Phase 4 - SEO Optimization & Performance
parent: plan.md
depends_on: phase-03-social-proof-and-testimonials.md
status: pending
duration: 2-3 days
priority: high
---

# Phase 4: SEO Optimization, Performance & Deployment

## Context
Final phase: optimize for Core Web Vitals (LCP <2.5s, FID <100ms, CLS <0.1), implement SEO (metadata, schema.org, keywords), add analytics tracking, and prepare deployment. Ensures landing page meets Google's ranking signals and converts at 2-5%.

**Parent Plan**: `plan.md`
**Dependencies**: Phase 1-3 (all sections complete)
**Next**: Production deployment, A/B testing iteration

## Key Insights (from Research)
- **Core Web Vitals**: LCP <2.5s (largest image/text), FID <100ms (interaction response), CLS <0.1 (layout stability)
- **SEO Keywords**: "online learning platform," "LMS for [industry]," "interactive quiz software"
- **Meta**: Title <60 chars (primary keyword), description 155-160 chars, H1 unique
- **Schema.org**: SoftwareApplication, Product, Organization (JSON-LD)
- **Mobile**: 60% traffic is mobile—test on real devices, Android Chrome + iOS Safari
- **Performance**: Image optimization (next/image), code splitting, lazy loading, stale-while-revalidate caching

**Research**: `researcher-01-lms-conversion-practices.md` (sections 4.0)
**Current State**: Generic meta tags, no schema.org, no performance monitoring, no analytics

## Requirements

### Technical - SEO
1. Update `/frontend/app/layout.tsx`: Add metadata (title, description, OG tags, canonical)
2. Add schema.org structured data (SoftwareApplication, Organization)
3. Update H1 in hero (primary keyword <60 chars)
4. Optimize meta descriptions (155-160 chars, include CTA)
5. Add robots.txt (allow Googlebot, disallow /admin)
6. Add sitemap.xml (landing page + public routes)
7. Implement Open Graph tags (og:title, og:description, og:image, og:url)
8. Add Twitter Card metadata (twitter:card, twitter:title, twitter:description)

### Technical - Performance
1. Implement Next.js Image component for course cards, testimonial avatars
2. Lazy-load below-fold sections (How-It-Works, Use Cases, FAQ)
3. Optimize fonts: subset Google Fonts (Archivo Black, Space Grotesk)
4. Code splitting: Dynamic imports for heavy components (FAQ accordion)
5. Monitor Core Web Vitals: Use web-vitals library + send to analytics
6. Ensure CLS <0.1: Fix layout shifts in buttons, cards, images
7. Reduce main bundle size: Audit dependencies, tree-shake unused code

### Technical - Analytics & Tracking
1. Add Google Analytics 4 (GA4) event tracking
2. Track conversion events: CTA clicks (start learning, register, browse courses)
3. Track engagement: Section views (testimonials, use cases), FAQ opens
4. Monitor Core Web Vitals: Send to GA4 or Sentry
5. A/B testing framework: UTM params for CTA variations

### Technical - Testing
1. Lighthouse audit: Target >90 on Performance, >95 on Accessibility
2. Mobile testing: iOS Safari 15+, Android Chrome (real devices)
3. Cross-browser: Chrome, Firefox, Safari, Edge
4. Accessibility: WCAG 2.1 AA, axe DevTools audit
5. Performance: Simulated 4G throttling, 3G slow mode
6. Link validation: All CTAs, nav links functional

## Architecture

### SEO Implementation
```typescript
// app/layout.tsx (metadata export)
export const metadata: Metadata = {
  title: "Tiny LMS - Build Interactive Courses in Minutes | Online Learning Platform",
  description: "Create engaging online courses with interactive quizzes, flashcards, and analytics. Perfect for instructors and corporate training.",
  keywords: ["online learning platform", "LMS software", "course builder", "interactive quizzes"],
  openGraph: {
    title: "Tiny LMS | Interactive Learning Made Easy",
    description: "Build and share engaging courses with built-in quizzes, flashcards, and student analytics.",
    url: "https://tinylms.com", // update to actual domain
    siteName: "Tiny LMS",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tiny LMS",
    description: "Interactive online learning platform",
    images: ["/twitter-image.png"],
  },
};

// app/page.tsx (add script for schema.org JSON-LD)
export const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Tiny LMS",
  "description": "Online learning platform for creating interactive courses",
  "url": "https://tinylms.com",
  "applicationCategory": "EducationalApplication",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "0", // Free tier
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "100",
  },
};
```

### Performance Implementation
```typescript
// app/page.tsx (lazy-load sections)
import dynamic from "next/dynamic";

const FAQSection = dynamic(
  () => import("@/components/landing/FAQSection"),
  { loading: () => <div>Loading...</div> }
);

// Optimize images
<Image
  src="/course-image.png"
  alt="Course title"
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

### Analytics Implementation
```typescript
// lib/analytics.ts (GA4 events)
export const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventData);
  }
};

// Track CTA clicks
<Button onClick={() => trackEvent("cta_click", { button: "start_learning", section: "hero" })}>
  Start Learning
</Button>
```

## Related Code Files
- **Modify**: `/frontend/app/layout.tsx` (add metadata, schema.org)
- **Modify**: `/frontend/app/page.tsx` (add dynamic imports, GA4 script, link tracking)
- **Create**: `/frontend/lib/analytics.ts` (GA4 event tracking)
- **Create**: `/public/robots.txt` (SEO indexing rules)
- **Create**: `/public/sitemap.xml` (static or generated)
- **Modify**: `/frontend/components/landing/*.tsx` (add Image component for media)
- **Modify**: `/frontend/next.config.js` (optimize images, compression)

## Implementation Steps

### Step 1: SEO Metadata & Schema.org (2-3 hours)
1. Update `/frontend/app/layout.tsx`:
   - Add metadata export (title <60 chars, description 155-160 chars)
   - Add Open Graph tags (og:title, description, image, url)
   - Add Twitter Card tags
2. Create schema.org JSON-LD script in page.tsx:
   - SoftwareApplication schema
   - Organization schema (name, logo, contact)
   - AggregateRating (if applicable)
3. Verify meta tags with Open Graph debugger (facebook.com/developers/tools/debug)
4. Test Rich Snippets with schema.org validator (validator.schema.org)

### Step 2: Update Hero H1 & Keywords (1 hour)
1. Refactor hero headline to include primary keyword (<60 chars)
   - Example: "Interactive Online Learning Platform for Courses"
2. Verify H1 uniqueness (only one per page)
3. Ensure secondary keywords in subheadlines, feature titles, section headings
4. Check keyword density (natural, 1-2% max)

### Step 3: Image Optimization (2-3 hours)
1. Replace <img> tags with Next.js <Image> component (featured courses, testimonial avatars)
2. Add width/height attributes (prevent layout shift)
3. Use loading="lazy" for below-fold images
4. Add placeholder="blur" for progressive loading (requires blurDataURL)
5. Optimize image formats: WebP with fallback (handled by Next.js)
6. Example:
   ```tsx
   <Image
     src="/course-image.jpg"
     alt="Course about React"
     width={400}
     height={300}
     loading="lazy"
     placeholder="blur"
     blurDataURL="data:image/png;base64,..."
   />
   ```

### Step 4: Code Splitting & Lazy Loading (2-3 hours)
1. Implement dynamic imports for below-fold sections:
   - Use `next/dynamic` for HowItWorksSection, UseCasesSection, FAQSection
   - Add loading skeleton for better UX
2. Configure webpack bundle analyzer: Identify large dependencies
3. Tree-shake unused code: Check dependency imports (Lucide, Recharts)
4. Monitor bundle size: Target <200KB main bundle (gzipped)

### Step 5: Core Web Vitals Optimization (2-3 hours)
1. **LCP (Largest Contentful Paint) <2.5s**:
   - Ensure hero image/text loads fast
   - Preload critical fonts (Archivo Black, Space Grotesk)
   - Use CSS gradients instead of large images
   - Test with Lighthouse (simulate 4G throttling)
2. **FID (First Input Delay) <100ms**:
   - Keep JS execution <100ms on main thread
   - Defer non-critical JS (GA, analytics)
   - Test with DevTools Performance tab
3. **CLS (Cumulative Layout Shift) <0.1**:
   - Fix layout shifts in CTA buttons, cards, images
   - Use height/width attributes on images
   - Reserve space for ads, videos (if added)
   - Test with Lighthouse CLS audit

### Step 6: Analytics & Event Tracking (2-3 hours)
1. Create `/frontend/lib/analytics.ts` with GA4 event functions
2. Add GA4 script to layout.tsx (or use next-google-analytics package)
3. Track conversion events:
   - `cta_click`: Hero button clicks (start_learning, create_account, browse_courses)
   - `section_view`: Track scroll depth (hero, features, testimonials)
   - `faq_open`: Track FAQ item opens
   - `use_case_click`: Track use case interactions
4. Set up GA4 goals: Track form submissions, course enrollments
5. Monitor Core Web Vitals: Use web-vitals npm package, send to GA4

### Step 7: SEO Configuration Files (1-2 hours)
1. Create `/public/robots.txt`:
   ```
   User-agent: *
   Allow: /
   Disallow: /admin
   Disallow: /dashboard
   Sitemap: https://tinylms.com/sitemap.xml
   ```
2. Create `/public/sitemap.xml` (static or generate dynamically):
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://tinylms.com/</loc>
       <lastmod>2026-03-18</lastmod>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>https://tinylms.com/courses</loc>
       <lastmod>2026-03-18</lastmod>
       <priority>0.8</priority>
     </url>
   </urlset>
   ```

### Step 8: Mobile & Accessibility Testing (2-3 hours)
1. Test on real devices:
   - iOS: Safari 15+, test hero CTA, form inputs
   - Android: Chrome, test touch targets (48px+), scrolling
2. Test on emulator/DevTools:
   - Mobile viewport (375px, 768px, 1024px)
   - Touch interactions, hover states
3. Accessibility audit (axe DevTools, Lighthouse):
   - Color contrast: 4.5:1 minimum (yellow + black tested)
   - Keyboard navigation: Tab through buttons, FAQ expand/collapse
   - Alt text: All images, icons (decorative: aria-hidden)
   - ARIA labels: Form inputs, buttons, tabs
4. Verify WCAG 2.1 AA compliance

### Step 9: Cross-Browser Testing (1-2 hours)
1. Test across: Chrome, Firefox, Safari, Edge
2. Check layout, typography, colors render correctly
3. Test buttons, forms, modals (if any)
4. Verify smooth animations/transitions
5. Check print styles (if applicable)

### Step 10: Performance Audit & Optimization (2-3 hours)
1. Run Lighthouse audit (target >90 Performance, >95 Accessibility):
   - Desktop: Should score >95
   - Mobile: Target >85 (more challenging)
2. Analyze results: Identify slowest sections
3. Optimize as needed:
   - Reduce unused CSS
   - Defer non-critical fonts
   - Minify and compress assets
4. Use web-vitals library to monitor real-world performance
5. Set up Sentry or similar for error tracking

### Step 11: Deployment Preparation (1-2 hours)
1. Update environment variables (GA4 tracking ID, domain)
2. Configure next.config.js:
   - Image optimization settings
   - Compression (gzip, brotli)
   - Security headers (X-Frame-Options, CSP)
3. Create deployment checklist:
   - All links functional
   - Forms submit correctly
   - Analytics tracking verified
   - SEO metadata correct
4. Plan rollback strategy (git tags, previous deploy accessible)

### Step 12: Final Testing Before Launch (2-3 hours)
1. Smoke test: Navigate landing page, click all CTAs, submit forms
2. Performance: Run Lighthouse 3x, average scores
3. Mobile: Test on at least 2 iOS + 2 Android devices
4. Accessibility: Run axe DevTools, fix critical issues
5. SEO: Verify meta tags, schema.org, robots.txt
6. Analytics: Confirm GA4 tracking fires on CTA clicks
7. Staging environment: Deploy to staging first, test in production-like environment

## Success Criteria
- **SEO**:
  - Meta title includes primary keyword, <60 chars
  - Meta description 155-160 chars, compelling, includes CTA
  - H1 unique, benefit-focused, <60 chars
  - Schema.org JSON-LD valid (validator.schema.org)
  - Open Graph tags render correctly (og:image 1200x630, <5MB)
- **Performance**:
  - Lighthouse Score: >90 Performance (desktop), >85 (mobile)
  - Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
  - Main JS bundle <200KB (gzipped)
  - Images optimized: WebP format, lazy-loaded
- **Mobile**:
  - Responsive: No horizontal scroll, readable text (≥16px)
  - Touch targets: ≥48px, spacing ≥8px
  - Tested on iOS 15+ Safari, Android Chrome
- **Accessibility**:
  - WCAG 2.1 AA: Color contrast ≥4.5:1, keyboard nav functional
  - axe DevTools: 0 critical issues
  - Alt text on all images
- **Analytics**:
  - GA4 tracking fires on page load, CTA clicks, FAQ opens
  - Conversion goals configured
  - Core Web Vitals sent to GA4

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| LCP >2.5s on slow networks | High | High | Preload critical fonts, use CSS gradients, optimize hero image |
| CLS >0.1 due to button/card sizes | Medium | High | Fix with height/width attributes, reserve space upfront |
| GA4 tracking breaks existing data | Low | Medium | Test in staging, use parallel tracking (old + new) before cutover |
| SEO metadata conflicts with CMS | Low | Medium | Hardcode landing page metadata (not managed by CMS) |
| Mobile viewport issues on old browsers | Medium | Low | Test on iOS 13+, Android 5+; graceful degradation acceptable |
| Bundle size regression | Medium | High | Monitor with webpack-bundle-analyzer, set CI/CD size limits |

## Security Considerations
- Metadata injection: Sanitize OG tags (Next.js handles by default)
- GA4 script: Use Content Security Policy (CSP) headers
- robots.txt: Don't expose sensitive paths (admin already disallowed)
- Schema.org: Avoid exposing PII in structured data
- HTTPS: Ensure all assets loaded over HTTPS (canonical URLs)

## Next Steps
→ **Deployment**: Merge to main, deploy to staging, run full test suite
→ **Monitoring**: Set up GA4 dashboard, Core Web Vitals monitoring
→ **Iteration**: A/B test CTA copy, testimonial placement, hero design
→ **Future phases**: Integrate more testimonials, add video section, pricing page (if needed)
