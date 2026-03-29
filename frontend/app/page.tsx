'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/retroui/Button';
import {
  HeroSection,
  ValueProposition,
  FeaturesSection,
  StatsSection,
  TestimonialsSection,
  FeaturedCoursesSection,
} from '@/components/landing';
import {
  HERO_CONTENT,
  VALUE_PROPS,
  FEATURES,
  HOW_IT_WORKS,
  STATS,
  TESTIMONIALS,
  USE_CASES,
  FAQ_ITEMS,
} from '@/lib/landing-data';
import { trackCTAClick } from '@/lib/analytics';

// Lazy-load below-fold interactive sections
const HowItWorksSection = dynamic(
  () => import('@/components/landing').then(mod => ({ default: mod.HowItWorksSection })),
  { loading: () => <div className="bg-white py-16 md:py-24 min-h-96" /> }
);

const UseCasesSection = dynamic(
  () => import('@/components/landing').then(mod => ({ default: mod.UseCasesSection })),
  { loading: () => <div className="bg-white py-16 md:py-24 min-h-96" /> }
);

const FAQSection = dynamic(
  () => import('@/components/landing').then(mod => ({ default: mod.FAQSection })),
  { loading: () => <div className="bg-white py-16 md:py-24 min-h-96" /> }
);

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection content={HERO_CONTENT} />
      <ValueProposition benefits={VALUE_PROPS} />
      <FeaturesSection features={FEATURES} />
      <HowItWorksSection flows={HOW_IT_WORKS} />
      <StatsSection stats={STATS} />
      <TestimonialsSection testimonials={TESTIMONIALS} />
      <UseCasesSection useCases={USE_CASES} />
      <FAQSection items={FAQ_ITEMS} />
      <FeaturedCoursesSection />

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-black text-white p-8 md:p-12 border-[3px] border-black">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Join thousands of students already learning on Tiny LMS.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#ffdb33] text-black border-[3px] border-black hover:bg-[#ffd000] shadow-[4px_4px_0px_0px_#fff] hover:shadow-[6px_6px_0px_0px_#fff] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-bold"
          >
            <Link href="/register" onClick={() => trackCTAClick('Get Started Free', 'bottom-cta')}>
              Get Started Free
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-[3px] border-black bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-start">
            <div>
              <div className="font-black text-xl mb-1" style={{ fontFamily: 'var(--font-archivo-black)' }}>
                Tiny LMS
              </div>
              <div className="text-sm text-gray-600" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Learn. Grow. Succeed.
              </div>
            </div>

            <div className="flex flex-col gap-2 md:items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Quick Links</span>
              <Link href="#features" className="text-sm font-bold hover:underline">Features</Link>
              <Link href="/courses" className="text-sm font-bold hover:underline">Courses</Link>
              <Link href="#faq" className="text-sm font-bold hover:underline">FAQ</Link>
            </div>

            <div className="md:text-right">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                &copy; {new Date().getFullYear()} Tiny LMS. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
