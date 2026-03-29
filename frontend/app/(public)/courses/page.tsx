'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { coursesApi, categoriesApi, Category } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { BookOpen } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  level: string;
  isFree?: boolean;
  is_free?: boolean;
  price: number;
  instructor: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  category: {
    id: string;
    name: string;
  };
  lesson_count: number;
  section_count: number;
}


function CourseCardSkeleton() {
  return (
    <div className="bg-white border-[3px] border-black p-5 animate-pulse">
      <div className="aspect-video bg-gray-200 mb-4 border-[2px] border-black" />
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-full bg-gray-100 rounded mb-3" />
      <div className="flex items-center justify-between">
        <div className="h-6 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-20 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: queryKeys.courses.categories(),
    queryFn: () => categoriesApi.list(),
    staleTime: 5 * 60 * 1000, // 5 min
  });
  const categories = (categoriesData as Category[]) || [];
  const activeCategories = categories.filter((c) => (c._count?.courses ?? 0) > 0);

  // Fetch courses with category filter
  const { data: coursesData, isLoading, isFetching } = useQuery({
    queryKey: queryKeys.courses.list({ limit: 50, categoryId }),
    queryFn: () => coursesApi.list({ limit: 50, ...(categoryId && { categoryId }) }),
  });

  const coursesResponse = coursesData as { data: Course[] } | undefined;
  const courses = coursesResponse?.data || [];

  // Client-side filters (search and level only - category is now server-side)
  const filteredCourses = courses.filter((course) => {
    if (search && !course.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (level && course.level !== level) {
      return false;
    }
    return true;
  });

  const isFreeCourse = (course: Course) => course.isFree ?? course.is_free ?? false;

  return (
    <div className="min-h-screen bg-[#ffdb33]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight" style={{ fontFamily: 'var(--font-archivo-black)' }}>
            Courses
          </h1>
        </div>

        {/* Category Filter Pills */}
        {activeCategories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryId('')}
              className={`px-4 py-2 border-[3px] border-black font-bold text-sm transition-all ${
                categoryId === ''
                  ? 'bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]'
                  : 'bg-white text-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:-translate-x-0.5'
              }`}
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              All
            </button>
            {activeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`px-4 py-2 border-[3px] border-black font-bold text-sm transition-all ${
                  categoryId === cat.id
                    ? 'bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]'
                    : 'bg-white text-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:-translate-x-0.5'
                }`}
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Search and Level Filters */}
        <div className="mb-10 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-md px-4 py-3 border-[3px] border-black text-black bg-white rounded-none shadow-[4px_4px_0px_0px_#000] focus:ring-0 focus:outline-none focus:translate-y-[2px] focus:translate-x-[2px] focus:shadow-[2px_2px_0px_0px_#000] transition-all font-bold"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="px-4 py-3 border-[3px] border-black text-black bg-white rounded-none shadow-[4px_4px_0px_0px_#000] focus:ring-0 focus:outline-none focus:translate-y-[2px] focus:translate-x-[2px] focus:shadow-[2px_2px_0px_0px_#000] transition-all font-bold appearance-none cursor-pointer"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Course Grid */}
        {isLoading || isFetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_#000]">
            <p className="text-black font-bold text-xl" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              No courses found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="bg-white border-[3px] border-black p-5 hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200 h-full flex flex-col"
              >
                <div className="aspect-video bg-gradient-to-br from-yellow-200 to-orange-200 mb-4 border-[2px] border-black relative overflow-hidden flex-shrink-0">
                  {course.thumbnail_url ? (
                    <Image
                      src={course.thumbnail_url}
                      alt={course.title}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover"
                      priority={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-black/30" />
                    </div>
                  )}
                  {isFreeCourse(course) && (
                    <span
                      className="absolute top-2 right-2 bg-green-400 text-black text-xs font-black px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_0px_#000]"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}
                    >
                      FREE
                    </span>
                  )}
                </div>
                <div className="flex flex-col flex-grow">
                  <h3
                    className="font-black text-xl mb-2 line-clamp-2 text-black leading-tight"
                    style={{ fontFamily: 'var(--font-archivo-black)' }}
                  >
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-sm text-gray-800 mb-4 line-clamp-2 font-medium" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {course.description}
                    </p>
                  )}

                  <div className="mt-auto pt-4 border-t-2 border-dashed border-gray-300">
                    <div
                      className="flex items-center justify-between text-sm mb-3 font-bold text-black"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}
                    >
                      <span className="capitalize px-2 py-1 bg-gray-100 border-2 border-black">{course.level}</span>
                      <span className="px-2 py-1 bg-gray-100 border-2 border-black">{course.lesson_count || (course as any).lessonCount || 0} lessons</span>
                    </div>
                    {course.instructor && (
                      <div className="flex items-center">
                        <div className="w-8 h-8 border-2 border-black bg-[#ffdb33] flex items-center justify-center text-sm font-black text-black">
                          {course.instructor.full_name?.[0] || (course.instructor as any).fullName?.[0] || '?'}
                        </div>
                        <span className="ml-3 text-sm font-bold text-black" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {course.instructor.full_name || (course.instructor as any).fullName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
