'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { coursesApi, enrollmentsApi, scormApi } from '@/lib/api';
import { ScormPlayer } from '@/components/scorm/ScormPlayer';

interface CourseListItem {
  id: string;
  slug: string;
}

interface CourseListResponse {
  data: CourseListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function StandaloneScormPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [packageId, setPackageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Find course by slug
        const response = (await coursesApi.list({ limit: 100 })) as CourseListResponse;
        const courses = response.data || [];
        const course = courses.find((c) => c.slug === slug);
        if (!course) {
          setError('Course not found');
          setLoading(false);
          return;
        }

        // Check enrollment
        const enrollment = await enrollmentsApi.check(course.id) as any;
        if (!enrollment.isEnrolled) {
          router.replace(`/courses/${slug}`);
          return;
        }

        // Get SCORM package for the course
        const pkg = await scormApi.getPackageByCourse(course.id);
        setPackageId(pkg.id);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load SCORM course');
        setLoading(false);
      }
    }
    load();
  }, [slug, router]);

  const handleComplete = () => {
    router.push(`/courses/${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (!packageId) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="border-b-[4px] border-black bg-white px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push(`/courses/${slug}`)}
          className="text-sm font-semibold text-gray-600 hover:text-black transition-colors"
        >
          &larr; Back to Course
        </button>
      </div>
      <div
        className="mx-auto border-[4px] border-black shadow-[8px_8px_0px_0px_#000] bg-white overflow-hidden"
        style={{ height: 'calc(100vh - 68px)' }}
      >
        <ScormPlayer packageId={packageId} onComplete={handleComplete} />
      </div>
    </div>
  );
}
