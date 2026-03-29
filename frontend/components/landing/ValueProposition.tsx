'use client';

import {
  Zap,
  Sparkles,
  BarChart3,
  Smartphone,
  Lock,
  BookOpen,
} from 'lucide-react';
import type { ValueProp } from '@/lib/landing-data';

interface ValuePropositionProps {
  benefits: readonly ValueProp[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  'Zap': Zap,
  'Sparkles': Sparkles,
  'BarChart3': BarChart3,
  'Smartphone': Smartphone,
  'Lock': Lock,
  'default': BookOpen,
};

function BenefitCard({ benefit }: { benefit: ValueProp }) {
  const Icon = ICON_MAP[benefit.icon] || ICON_MAP['default'];

  return (
    <div className="bg-white border-[3px] border-black p-6 md:p-8 hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-200">
      {/* Icon Container */}
      <div className="w-14 h-14 bg-[#ffdb33] border-[2px] border-black flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-black" strokeWidth={2} />
      </div>

      {/* Title */}
      <h3
        className="font-bold text-lg md:text-xl text-black mb-3"
        style={{ fontFamily: 'var(--font-archivo-black)' }}
      >
        {benefit.title}
      </h3>

      {/* Description */}
      <p
        className="text-gray-700 text-sm md:text-base leading-relaxed"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {benefit.description}
      </p>
    </div>
  );
}

export function ValueProposition({ benefits }: ValuePropositionProps) {
  return (
    <section className="bg-[#f8f8f8] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 md:mb-16">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-black text-black mb-4"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Why Instructors Choose Tiny LMS
          </h2>
          <p
            className="text-lg text-gray-700 max-w-2xl"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Everything you need to create engaging learning experiences and track student progress with confidence.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {benefits.map((benefit) => (
            <BenefitCard key={benefit.id} benefit={benefit} />
          ))}
        </div>
      </div>
    </section>
  );
}
