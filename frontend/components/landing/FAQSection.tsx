'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { trackFAQOpen } from '@/lib/analytics';
import type { FAQItem } from '@/lib/landing-data';

interface FAQSectionProps {
  items: readonly FAQItem[];
}

function FAQAccordion({ items }: { items: readonly FAQItem[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isExpanded = expandedId === item.id;

        return (
          <div
            key={item.id}
            className={`border-[2px] transition-all ${
              isExpanded
                ? 'border-[3px] border-black bg-[#fffacd]'
                : 'border-black hover:border-[3px]'
            }`}
          >
            {/* Question Button */}
            <button
              onClick={() => {
                setExpandedId(isExpanded ? null : item.id);
                if (!isExpanded) trackFAQOpen(item.category, item.question);
              }}
              className="w-full px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#ffdb33]/20 transition-colors"
            >
              <h3
                className="font-bold text-black text-left flex-grow"
                style={{ fontFamily: 'var(--font-archivo-black)' }}
              >
                {item.question}
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-black flex-shrink-0 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Answer */}
            {isExpanded && (
              <div className="px-6 py-4 border-t-[2px] border-black bg-white">
                <p
                  className="text-gray-700 text-sm md:text-base leading-relaxed"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function FAQSection({ items }: FAQSectionProps) {
  // Group items by category
  const categories = ['general', 'instructor', 'student'] as const;
  const itemsByCategory = {
    general: items.filter((item) => item.category === 'general'),
    instructor: items.filter((item) => item.category === 'instructor'),
    student: items.filter((item) => item.category === 'student'),
  };

  return (
    <section id="faq" className="bg-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 md:mb-16">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-black text-black mb-4"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Frequently Asked Questions
          </h2>
          <p
            className="text-lg text-gray-700"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Find answers to common questions about Tiny LMS.
          </p>
        </div>

        {/* General Questions */}
        <div className="mb-12">
          <h3
            className="text-xl font-black text-black mb-6"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            General
          </h3>
          <FAQAccordion items={itemsByCategory.general} />
        </div>

        {/* Instructor Questions */}
        <div className="mb-12">
          <h3
            className="text-xl font-black text-black mb-6"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            For Instructors
          </h3>
          <FAQAccordion items={itemsByCategory.instructor} />
        </div>

        {/* Student Questions */}
        <div>
          <h3
            className="text-xl font-black text-black mb-6"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            For Students
          </h3>
          <FAQAccordion items={itemsByCategory.student} />
        </div>
      </div>
    </section>
  );
}
