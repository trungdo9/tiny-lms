'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, BookOpen, TrendingUp, Star } from 'lucide-react';
import type { Stat } from '@/lib/landing-data';

interface StatsSectionProps {
  stats: readonly Stat[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  'Users': Users,
  'BookOpen': BookOpen,
  'TrendingUp': TrendingUp,
  'Star': Star,
};

function parseNumber(value: string): { num: number; suffix: string; prefix: string } {
  const match = value.match(/^([^0-9]*)([0-9,]+)([^0-9]*)$/);
  if (!match) return { num: 0, suffix: value, prefix: '' };
  return {
    prefix: match[1] || '',
    num: parseInt(match[2].replace(/,/g, ''), 10),
    suffix: match[3] || '',
  };
}

function AnimatedStatCard({ stat, animate }: { stat: Stat; animate: boolean }) {
  const Icon = ICON_MAP[stat.icon] || Users;
  const { num, suffix, prefix } = parseNumber(stat.number);
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!animate || num === 0) return;
    const duration = 1200;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * num));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate, num]);

  const displayValue = animate && num > 0
    ? `${prefix}${displayed.toLocaleString()}${suffix}`
    : stat.number;

  return (
    <div className="text-center">
      <div className="flex justify-center mb-3">
        <Icon className="w-10 h-10 text-[#ffdb33]" strokeWidth={1.5} />
      </div>
      <div
        className="text-4xl md:text-5xl font-black text-black tabular-nums"
        style={{ fontFamily: 'var(--font-archivo-black)' }}
      >
        {displayValue}
      </div>
      <div
        className="text-sm md:text-base text-gray-700 mt-2 font-medium"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {stat.label}
      </div>
    </div>
  );
}

export function StatsSection({ stats }: StatsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section ref={sectionRef} className="bg-[#fffacd] py-16 md:py-24 border-y-[3px] border-black">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-black text-black mb-4"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Trusted by Thousands
          </h2>
          <p
            className="text-lg text-gray-700 max-w-2xl mx-auto"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Join a growing community of educators and learners making a difference.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => (
            <AnimatedStatCard key={stat.label} stat={stat} animate={hasAnimated} />
          ))}
        </div>
      </div>
    </section>
  );
}
