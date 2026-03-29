'use client';

import { useState } from 'react';
import {
  BookOpen,
  FileText,
  Users,
  Heart,
  Zap,
  Award,
  ChevronRight,
} from 'lucide-react';
import type { HowItWorksFlow, HowItWorksStep } from '@/lib/landing-data';

interface StepData {
  step: number;
  icon: string;
  title: string;
  description: string;
  imageUrl?: undefined;
}

interface HowItWorksSectionProps {
  flows: {
    readonly instructor: readonly StepData[];
    readonly student: readonly StepData[];
  };
}

const ICON_MAP: Record<string, React.ElementType> = {
  'BookOpen': BookOpen,
  'FileText': FileText,
  'Users': Users,
  'Heart': Heart,
  'Zap': Zap,
  'Award': Award,
  'default': ChevronRight,
};

function StepCard({ step, isVertical }: { step: StepData; isVertical: boolean }) {
  const Icon = ICON_MAP[step.icon] || ICON_MAP['default'];

  return (
    <div className="flex gap-4 md:gap-6">
      {/* Step Number Circle */}
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 md:w-14 md:h-14 bg-[#ffdb33] border-[3px] border-black flex items-center justify-center">
          <span
            className="font-black text-black text-lg md:text-xl"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            {step.step}
          </span>
        </div>
        {/* Connector Line (vertical on mobile/tablet, hidden on desktop) */}
        {isVertical && (
          <div className="w-[3px] h-12 md:h-16 bg-black mt-2" />
        )}
      </div>

      {/* Step Content */}
      <div className="pb-4 md:pb-8 flex-1">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-white border-[2px] border-black flex items-center justify-center flex-shrink-0 mt-1">
            <Icon className="w-5 h-5 text-black" strokeWidth={2} />
          </div>
          <h3
            className="font-bold text-lg md:text-xl text-black"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            {step.title}
          </h3>
        </div>
        <p
          className="text-gray-700 text-sm md:text-base leading-relaxed ml-13"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {step.description}
        </p>
      </div>
    </div>
  );
}

type TabType = 'instructor' | 'student';

export function HowItWorksSection({ flows }: HowItWorksSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('instructor');

  const currentFlow = flows[activeTab];

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 md:mb-16">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-black text-black mb-4"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            How It Works
          </h2>
          <p
            className="text-lg text-gray-700 max-w-2xl"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Simple, intuitive workflows for both instructors and learners.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-4 mb-12 md:mb-16">
          <button
            onClick={() => setActiveTab('instructor')}
            className={`px-6 py-3 font-bold border-[3px] border-black transition-all ${
              activeTab === 'instructor'
                ? 'bg-[#ffdb33] text-black shadow-[4px_4px_0px_0px_#000]'
                : 'bg-white text-black shadow-[2px_2px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000]'
            }`}
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            For Instructors
          </button>
          <button
            onClick={() => setActiveTab('student')}
            className={`px-6 py-3 font-bold border-[3px] border-black transition-all ${
              activeTab === 'student'
                ? 'bg-[#ffdb33] text-black shadow-[4px_4px_0px_0px_#000]'
                : 'bg-white text-black shadow-[2px_2px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000]'
            }`}
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            For Students
          </button>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="space-y-2 md:space-y-4">
            {currentFlow.map((step, idx) => (
              <StepCard
                key={step.step}
                step={step}
                isVertical={idx < currentFlow.length - 1}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 md:mt-16 pt-8 md:pt-12 border-t-[3px] border-black">
          <p
            className="text-gray-700 text-lg mb-4"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {activeTab === 'instructor'
              ? 'Ready to create your first course?'
              : 'Ready to start learning?'}
          </p>
          <a
            href={activeTab === 'instructor' ? '/register' : '/courses'}
            className="inline-block px-6 py-3 bg-black text-white font-bold border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-x-1 hover:-translate-y-1 transition-all"
          >
            {activeTab === 'instructor' ? 'Create a Course' : 'Explore Courses'} →
          </a>
        </div>
      </div>
    </section>
  );
}
