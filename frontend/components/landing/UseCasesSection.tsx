'use client';

import Link from 'next/link';
import { Briefcase, GraduationCap, Users, ArrowRight } from 'lucide-react';
import type { UseCase } from '@/lib/landing-data';

interface UseCasesSectionProps {
  useCases: readonly UseCase[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  'Briefcase': Briefcase,
  'GraduationCap': GraduationCap,
  'Users': Users,
};

function UseCaseCard({ useCase }: { useCase: UseCase }) {
  const Icon = ICON_MAP[useCase.icon] || Briefcase;

  return (
    <div className="bg-white border-[3px] border-black p-8 hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-200">
      {/* Icon */}
      <div className="w-16 h-16 bg-[#ffdb33] border-[3px] border-black flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-black" strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h3
        className="text-xl md:text-2xl font-black text-black mb-4"
        style={{ fontFamily: 'var(--font-archivo-black)' }}
      >
        {useCase.title}
      </h3>

      {/* Description */}
      <p
        className="text-gray-700 text-sm md:text-base mb-6 leading-relaxed"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {useCase.description}
      </p>

      {/* Metrics */}
      <div className="flex gap-6 mb-6 pb-6 border-b-[2px] border-black">
        {useCase.metrics.map((metric, idx) => (
          <div key={idx}>
            <div
              className="text-2xl font-black text-black"
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              {metric.value}
            </div>
            <div className="text-xs text-gray-600 font-medium">{metric.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href={useCase.cta.href}
        className="inline-flex items-center gap-2 text-black font-bold hover:gap-3 transition-all"
      >
        {useCase.cta.text} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export function UseCasesSection({ useCases }: UseCasesSectionProps) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 md:mb-16">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-black text-black mb-4"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Use Cases
          </h2>
          <p
            className="text-lg text-gray-700 max-w-2xl"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            See how organizations use Tiny LMS to transform learning and development.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase) => (
            <UseCaseCard key={useCase.id} useCase={useCase} />
          ))}
        </div>
      </div>
    </section>
  );
}
