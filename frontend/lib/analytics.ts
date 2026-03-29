/**
 * Analytics tracking for landing page conversions
 * Requires GA4 MEASUREMENT_ID from environment: NEXT_PUBLIC_GA_ID
 */

// Define event types for type safety
export type AnalyticsEvent =
  | 'page_view'
  | 'cta_click'
  | 'section_view'
  | 'faq_open'
  | 'use_case_click'
  | 'course_click'
  | 'signup_start'
  | 'signup_complete';

type EventData = Record<string, string | number | boolean>;

/**
 * Track analytics events with GA4
 * Usage: trackEvent('cta_click', { button: 'start_learning', section: 'hero' })
 */
export const trackEvent = (eventName: AnalyticsEvent, eventData?: EventData) => {
  if (typeof window === 'undefined') return;

  // Use gtag if available (GA4 script loaded)
  if (window.gtag) {
    window.gtag('event', eventName, eventData || {});
  }

  // Fallback: Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Analytics Event: ${eventName}`, eventData || {});
  }
};

/**
 * Track CTA button clicks
 * Usage: trackCTAClick('Get Started Free', 'hero')
 */
export const trackCTAClick = (ctaText: string, section: string) => {
  trackEvent('cta_click', {
    cta_text: ctaText,
    section,
  });
};

/**
 * Track section views (via scroll tracking)
 * Usage: trackSectionView('testimonials', 65)
 */
export const trackSectionView = (section: string, scrollDepth: number) => {
  trackEvent('section_view', {
    section,
    scroll_depth: scrollDepth,
  });
};

/**
 * Track FAQ accordion opens
 * Usage: trackFAQOpen('general', 'What is Tiny LMS?')
 */
export const trackFAQOpen = (category: string, question: string) => {
  trackEvent('faq_open', {
    faq_category: category,
    faq_question: question,
  });
};

/**
 * Track use case interactions
 * Usage: trackUseCaseClick('corporate-training')
 */
export const trackUseCaseClick = (useCaseId: string) => {
  trackEvent('use_case_click', {
    use_case_id: useCaseId,
  });
};

/**
 * Track featured course clicks
 * Usage: trackCourseClick('course-123', 'React Basics')
 */
export const trackCourseClick = (courseId: string, courseTitle: string) => {
  trackEvent('course_click', {
    course_id: courseId,
    course_title: courseTitle,
  });
};

/**
 * Declare gtag global for TypeScript
 */
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      eventData?: Record<string, string | number | boolean>
    ) => void;
  }
}
