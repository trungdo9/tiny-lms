# Phase 4 Testing Checklist

## Step 8: Mobile & Accessibility Testing

### Mobile Device Testing
- [ ] **iOS**: Test on iPhone 12/13/14 with Safari 15+
  - [ ] Hero section layout and CTAs render correctly
  - [ ] Touch targets are ≥48px for all buttons
  - [ ] Images display properly with correct aspect ratios
  - [ ] No horizontal scrolling
  - [ ] Form inputs accessible and usable
  - [ ] Testimonial avatars load correctly
  - [ ] FAQ accordion opens/closes smoothly

- [ ] **Android**: Test on Android 10+ with Chrome
  - [ ] Same checks as iOS
  - [ ] Test on different screen sizes (360px, 375px, 480px)
  - [ ] Virtual keyboard doesn't obscure CTAs
  - [ ] Responsive grid layouts work correctly

### Accessibility Audit (axe DevTools)
- [ ] Run axe DevTools full page scan
- [ ] 0 critical issues
- [ ] 0-5 serious issues (document any)
- [ ] Address all high-priority violations
- [ ] Color contrast ≥4.5:1 verified (black #000000 on yellow #ffdb33)

### WCAG 2.1 AA Compliance
- [ ] Alt text on all images (decorative marked aria-hidden)
- [ ] Keyboard navigation works: Tab through all interactive elements
- [ ] Focus indicators visible on all focusable elements
- [ ] Form labels properly associated
- [ ] Headings proper hierarchy (h1 > h2 > h3)
- [ ] Video captions (if any videos added)

---

## Step 9: Cross-Browser Testing

### Desktop Browsers
- [ ] **Chrome** (Latest): Full functionality, no visual glitches
- [ ] **Firefox** (Latest): Full functionality, verify fonts render
- [ ] **Safari** (Latest): Verify box shadows and gradients
- [ ] **Edge** (Latest): Windows compatibility

### Compatibility Checks
- [ ] All buttons clickable and functional
- [ ] Typography renders correctly
- [ ] Colors display consistently
- [ ] Shadows and borders show properly
- [ ] Animations/transitions smooth
- [ ] Forms submit correctly
- [ ] All links functional (no 404s)

---

## Step 10: Performance Audit & Optimization

### Lighthouse Audit (run 3x, average scores)
- [ ] **Desktop**: Target >90 Performance, >95 Accessibility
  - [ ] LCP <2.5s
  - [ ] FID <100ms
  - [ ] CLS <0.1
  - [ ] No critical performance issues

- [ ] **Mobile**: Target >85 Performance, >90 Accessibility
  - [ ] LCP <2.5s (mobile-optimized)
  - [ ] FID <100ms
  - [ ] CLS <0.1
  - [ ] Document any warnings

### Bundle Size Analysis
- [ ] Main JS bundle <200KB (gzipped)
- [ ] Verify dynamic imports working (sections load on demand)
- [ ] CSS optimized, no unused classes
- [ ] Images optimized (WebP format, proper sizing)

### Core Web Vitals
- [ ] LCP: Largest Contentful Paint <2.5s
  - [ ] Hero image/text loads fast
  - [ ] Critical fonts preloaded
  - [ ] No jank during load
- [ ] FID: First Input Delay <100ms
  - [ ] Buttons responsive to clicks
  - [ ] No long JS execution blocks
- [ ] CLS: Cumulative Layout Shift <0.1
  - [ ] No unexpected layout shifts
  - [ ] Button/card sizes fixed
  - [ ] Images have dimensions set

### Network Throttling Test (4G Slow)
- [ ] Page loads in <5s on 4G
- [ ] Hero section visible in <3s
- [ ] All CTAs visible and clickable after <4s

---

## Step 11: Deployment Preparation

### Environment & Configuration
- [ ] Set `NEXT_PUBLIC_GA_ID` environment variable
- [ ] Update domain from `tinylms.com` to actual domain (if different)
- [ ] Verify `.env.local` has production values
- [ ] Review `next.config.js` for optimization settings

### Security Headers
- [ ] X-Frame-Options: DENY (prevent clickjacking)
- [ ] X-Content-Type-Options: nosniff
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] CSP headers configured (if GA4 added)

### Deployment Checklist
- [ ] All links functional (no 404s)
- [ ] Forms submit to correct endpoints
- [ ] Database connections stable
- [ ] API endpoints responding
- [ ] Analytics tracking verified
- [ ] SEO metadata correct
- [ ] robots.txt and sitemap.xml accessible
- [ ] og:image files exist and load

### Rollback Strategy
- [ ] Previous deploy version tagged in git
- [ ] Database migrations reversible
- [ ] DNS switch can be reverted quickly
- [ ] Team notified of rollback procedures

---

## Step 12: Final Testing Before Launch

### Smoke Test (Complete User Journey)
- [ ] Navigate landing page top to bottom
- [ ] All section text readable
- [ ] All images display correctly
- [ ] Click all CTAs and verify navigation
- [ ] FAQ accordion expands/collapses
- [ ] Responsive design works at 375px, 768px, 1024px+
- [ ] No console errors (check DevTools)

### Performance Verification (3x Run)
- [ ] Run Lighthouse 3 times, take average
- [ ] All scores meet target thresholds
- [ ] Core Web Vitals green (LCP <2.5s, FID <100ms, CLS <0.1)
- [ ] Document any performance regressions

### Mobile Device Verification (2+ devices)
- [ ] iOS: iPhone latest + one older model
- [ ] Android: Pixel + Samsung
- [ ] All core functionality works
- [ ] Touch interactions responsive
- [ ] Forms submit correctly

### Analytics Verification
- [ ] GA4 script loads (check Network tab)
- [ ] Page view event fires on load
- [ ] CTA click events fire (test clicks)
- [ ] Events visible in GA4 real-time dashboard

### SEO Final Check
- [ ] Meta title includes primary keyword (<60 chars)
- [ ] Meta description 155-160 chars, compelling
- [ ] H1 unique and benefit-focused
- [ ] Schema.org JSON-LD valid (use validator.schema.org)
- [ ] robots.txt returns 200 status
- [ ] sitemap.xml returns valid XML
- [ ] Open Graph tags render correctly (use facebook.com/developers)

### Staging Deployment
- [ ] Deploy to staging environment
- [ ] Run full test suite on staging
- [ ] Verify all integrations work
- [ ] Load test: Simulate concurrent users
- [ ] Monitor error logs for issues

### Production Deployment
- [ ] Final approval from team
- [ ] Deploy to production
- [ ] Verify site is live and accessible
- [ ] Monitor error logs for 24h
- [ ] Check analytics dashboard for traffic
- [ ] Prepare rollback plan if needed

---

## Success Metrics (Post-Launch)

- Conversion rate: 2-5% (first week, benchmark)
- Bounce rate: <50%
- Time on page: >90 seconds
- CTA CTR: 8-12%
- Mobile usability: 100% on PageSpeed
- Core Web Vitals: All green
- SEO ranking: Track within 2-4 weeks
