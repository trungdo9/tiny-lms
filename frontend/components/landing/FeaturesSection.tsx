'use client';

import {
  ClipboardList,
  Layers,
  BarChart3,
  Trophy,
  Video,
  Users,
  MessageSquare,
  BarChart4,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import type { Feature } from '@/lib/landing-data';

interface FeaturesSectionProps {
  features: readonly Feature[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  'ClipboardList': ClipboardList,
  'Layers': Layers,
  'BarChart3': BarChart3,
  'Trophy': Trophy,
  'Video': Video,
  'Users': Users,
  'MessageSquare': MessageSquare,
  'BarChart4': BarChart4,
  'default': BookOpen,
};

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = ICON_MAP[feature.icon] || ICON_MAP['default'];

  return (
    <div className="bg-white border-[3px] border-black p-6 md:p-8 hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-200 h-full flex flex-col">
      {/* Icon Container */}
      <div className="w-14 h-14 bg-[#ffdb33] border-[2px] border-black flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-black" strokeWidth={2} />
      </div>

      {/* Title */}
      <h3
        className="font-bold text-lg text-black mb-3"
        style={{ fontFamily: 'var(--font-archivo-black)' }}
      >
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-4 flex-grow">
        {feature.description}
      </p>

      {/* Learn More Link */}
      {feature.learnMoreHref && (
        <a
          href={feature.learnMoreHref}
          className="text-black font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all"
        >
          Learn more <ArrowRight className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}

export function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <section id="features" className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 md:mb-16">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-black text-black mb-4"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Powerful Features for Modern Learning
          </h2>
          <p
            className="text-lg text-gray-700 max-w-2xl"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Everything instructors and students need for successful online learning outcomes.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
