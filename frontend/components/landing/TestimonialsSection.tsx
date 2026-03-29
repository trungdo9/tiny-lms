'use client';

import Image from 'next/image';
import type { Testimonial } from '@/lib/landing-data';

interface TestimonialsSectionProps {
  testimonials: readonly Testimonial[];
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white border-[3px] border-black p-6 md:p-8 hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-200 h-full flex flex-col">
      {/* Quote */}
      <p
        className="text-gray-700 text-sm md:text-base italic leading-relaxed mb-6 flex-grow"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        "{testimonial.quote}"
      </p>

      {/* Author Info */}
      <div className="flex items-center gap-4 pt-6 border-t-[2px] border-black">
        {/* Avatar */}
        <div className="w-12 h-12 bg-[#ffdb33] border-[2px] border-black flex-shrink-0 overflow-hidden">
          <Image
            src={testimonial.photo}
            alt={testimonial.name}
            width={48}
            height={48}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Author Details */}
        <div className="flex-grow min-w-0">
          <h4
            className="font-bold text-black text-sm truncate"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            {testimonial.name}
          </h4>
          <p className="text-xs md:text-sm text-gray-600">
            {testimonial.title} • {testimonial.company}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <section className="bg-[#f8f8f8] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 md:mb-16">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-black text-black mb-4"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            What Users Say
          </h2>
          <p
            className="text-lg text-gray-700 max-w-2xl"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Real feedback from instructors, students, and organizations using Tiny LMS.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
