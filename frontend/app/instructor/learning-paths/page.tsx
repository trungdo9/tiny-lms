'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { learningPathsApi } from '@/lib/api';

export default function InstructorLearningPathsPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: paths = [], isLoading } = useQuery({
    queryKey: queryKeys.learningPaths.mine(),
    queryFn: () => learningPathsApi.getMine(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => learningPathsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.mine() }),
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Learning Paths</h1>
        <Link href="/instructor/learning-paths/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          + New Learning Path
        </Link>
      </div>

      {paths.length === 0 ? (
        <div className="bg-white rounded-lg border p-10 text-center text-gray-500">
          <p className="mb-4">No learning paths yet.</p>
          <Link href="/instructor/learning-paths/create" className="text-blue-600 hover:underline text-sm">Create your first path</Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border divide-y">
          {paths.map((path: any) => (
            <div key={path.id} className="flex items-center justify-between p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{path.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${path.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {path.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {path._count?.courses ?? 0} courses · {path._count?.enrollments ?? 0} enrolled
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/instructor/learning-paths/${path.id}`} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50">
                  Edit
                </Link>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${path.title}"?`)) {
                      setDeletingId(path.id);
                      deleteMutation.mutate(path.id, { onSettled: () => setDeletingId(null) });
                    }
                  }}
                  disabled={deletingId === path.id}
                  className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
