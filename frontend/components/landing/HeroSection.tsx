'use client';

import Link from 'next/link';
import { Button } from '@/components/retroui/Button';
import { trackCTAClick } from '@/lib/analytics';
import type { HeroContent } from '@/lib/landing-data';

interface HeroSectionProps {
  content: HeroContent;
}

function DashboardMockup() {
  return (
    <div className="hidden md:flex items-center justify-center">
      <div className="w-full max-w-md bg-black border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] p-6">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-white text-sm font-bold font-mono">My Courses</span>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 bg-[#ffdb33] border border-black" />
            <div className="w-3 h-3 bg-white/30 border border-white/20" />
            <div className="w-3 h-3 bg-white/30 border border-white/20" />
          </div>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: 'Courses', value: '12' },
            { label: 'Students', value: '847' },
            { label: 'Avg Score', value: '91%' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#ffdb33] border-[2px] border-black p-3 text-center">
              <div className="text-black text-xl font-black" style={{ fontFamily: 'var(--font-archivo-black)' }}>
                {stat.value}
              </div>
              <div className="text-black text-xs font-mono mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bars */}
        <div className="space-y-3 mb-5">
          {[
            { label: 'React Fundamentals', pct: 87 },
            { label: 'TypeScript Basics', pct: 62 },
            { label: 'Node.js API Dev', pct: 45 },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs font-mono text-white/70 mb-1">
                <span>{item.label}</span>
                <span>{item.pct}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 border border-white/20">
                <div
                  className="h-full bg-[#ffdb33]"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Activity feed */}
        <div className="space-y-2">
          {[
            { text: 'Quiz submitted — 95%', time: '2m ago' },
            { text: 'New student enrolled', time: '15m ago' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between bg-white/5 px-3 py-2 border border-white/10">
              <span className="text-white text-xs font-mono">{item.text}</span>
              <span className="text-white/40 text-xs">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeroSection({ content }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-[#ffdb33]">
      {/* Decorative dot pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, black 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, black 2px, transparent 2px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content Container */}
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-32 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div>
            {/* Badge */}
            <div className="inline-block bg-black text-white px-4 py-1 mb-6 font-mono text-sm border-[2px] border-black">
              {content.badge}
            </div>

            {/* Headline */}
            <h1
              className="text-5xl md:text-6xl font-black mb-6 text-black tracking-tight leading-tight"
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              {content.headline}
            </h1>

            {/* Subheadline */}
            <p
              className="text-lg md:text-xl text-gray-800 mb-8 font-medium leading-relaxed"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              {content.subheadline}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                asChild
                size="lg"
                className="bg-black text-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-x-1 hover:-translate-y-1 transition-all font-bold text-base"
              >
                <Link
                  href={content.primaryCta.href}
                  onClick={() => trackCTAClick(content.primaryCta.text, 'hero')}
                >
                  {content.primaryCta.text}
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                className="bg-white text-black border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-x-1 hover:-translate-y-1 transition-all font-bold text-base"
              >
                <Link
                  href={content.secondaryCta.href}
                  onClick={() => trackCTAClick(content.secondaryCta.text, 'hero')}
                >
                  {content.secondaryCta.text}
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 md:gap-10">
              {content.stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div
                    className="text-3xl md:text-4xl font-black text-black"
                    style={{ fontFamily: 'var(--font-archivo-black)' }}
                  >
                    {stat.number}
                  </div>
                  <div className="text-sm font-mono text-gray-700 mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
