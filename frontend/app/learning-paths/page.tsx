'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { learningPathsApi } from '@/lib/api';

export default function LearningPathsCatalogPage() {
  const { data: paths = [], isLoading } = useQuery({
    queryKey: queryKeys.learningPaths.list(),
    queryFn: () => learningPathsApi.list(),
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Learning Paths</h1>
          <p className="text-gray-500 mt-1">Structured course collections to guide your learning journey</p>
        </div>

        {paths.length === 0 ? (
          <div className="bg-white rounded-lg border p-10 text-center text-gray-500">
            <p>No learning paths available yet.</p>
            <Link href="/courses" className="text-blue-600 hover:underline text-sm mt-2 inline-block">Browse individual courses</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map((path: any) => (
              <Link key={path.id} href={`/learning-paths/${path.id}`} className="bg-white rounded-xl border hover:shadow-md transition-shadow overflow-hidden group">
                {path.thumbnailUrl ? (
                  <div className="h-40 overflow-hidden">
                    <img src={path.thumbnailUrl} alt={path.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <span className="text-blue-400 text-4xl">🗺</span>
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-semibold text-gray-900 line-clamp-2 mb-1">{path.title}</h2>
                  {path.creator && <p className="text-xs text-gray-500 mb-2">by {path.creator.fullName}</p>}
                  {path.description && <p className="text-sm text-gray-600 line-clamp-2 mb-3">{path.description}</p>}
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                    {path.courses?.length ?? 0} courses
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
