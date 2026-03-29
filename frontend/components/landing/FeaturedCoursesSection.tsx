'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api';
import { trackCourseClick } from '@/lib/analytics';

interface HomeCourse {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  isFree?: boolean;
  price?: number | null;
  level?: string | null;
}

interface CoursesListResponse {
  data: HomeCourse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function CourseCard({ course }: { course: HomeCourse }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="block"
      onClick={() => trackCourseClick(course.id, course.title)}
    >
      <div className="bg-white border-[3px] border-black p-5 hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-200 h-full">
        <div className="aspect-video bg-gradient-to-br from-yellow-200 to-orange-200 mb-4 border-[2px] border-black flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-black/40" />
        </div>
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between">
          <span
            className={`px-2 py-1 text-xs font-bold ${
              course.isFree ? 'bg-green-100 text-green-700' : 'bg-black text-white'
            }`}
          >
            {course.isFree ? 'FREE' : `$${course.price}`}
          </span>
          <span className="text-sm text-gray-500">{course.level}</span>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedCoursesSection() {
  const { data: coursesResponse } = useQuery<CoursesListResponse>({
    queryKey: ['courses', 'published'],
    queryFn: () => coursesApi.list({ status: 'published' }) as Promise<CoursesListResponse>,
    staleTime: 60000,
  });

  const courses = coursesResponse?.data || [];

  if (courses.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2
          className="text-3xl md:text-4xl font-black"
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          Featured Courses
        </h2>
        <Link href="/courses" className="text-black font-bold hover:underline">
          View All &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.slice(0, 3).map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}
