'use client';

import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';

interface Course {
  sections: {
    id: string;
    title: string;
    lessons: { id: string; title: string; type: string; is_published: boolean }[];
  }[];
}

interface LessonSidebarProps {
  slug: string;
  lessonId: string;
  course: Course | undefined;
  open: boolean;
  onClose: () => void;
}

export function LessonSidebar({ slug, lessonId, course, open, onClose }: LessonSidebarProps) {
  return (
    <div
      className={`${open ? 'w-80 border-r-[4px] border-black' : 'w-0'} bg-white text-black overflow-hidden transition-all duration-300 flex-shrink-0 z-10 relative shadow-[4px_0px_0px_0px_rgba(0,0,0,0.1)]`}
    >
      <div className="p-6 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-8 pb-4 border-b-[3px] border-black">
          <Link
            href={`/courses/${slug}`}
            className="text-sm font-black text-black hover:underline flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to course
          </Link>
          <button onClick={onClose} className="text-black hover:scale-110 transition-transform">
            <X className="w-5 h-5" />
          </button>
        </div>
        {course && (
          <div className="space-y-6">
            {course.sections?.map((section) => (
              <div key={section.id}>
                <h3
                  className="font-black text-lg mb-3 text-black"
                  style={{ fontFamily: 'var(--font-archivo-black)' }}
                >
                  {section.title}
                </h3>
                <div className="space-y-2">
                  {section.lessons?.map((l) => (
                    <Link
                      key={l.id}
                      href={`/courses/${slug}/learn/${l.id}`}
                      className={`block px-4 py-3 border-[2px] border-black text-sm font-bold transition-all ${
                        l.id === lessonId
                          ? 'bg-[#ffdb33] text-black shadow-[4px_4px_0px_0px_#000] -translate-y-1 -translate-x-1'
                          : 'bg-white text-gray-800 hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:-translate-x-0.5'
                      }`}
                    >
                      {l.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
