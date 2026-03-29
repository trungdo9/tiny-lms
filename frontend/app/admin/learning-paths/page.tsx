'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { learningPathsApi } from '@/lib/api';

export default function AdminLearningPathsPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: paths = [], isLoading } = useQuery({
    queryKey: [...queryKeys.learningPaths.list(), 'all'],
    queryFn: () => learningPathsApi.list(true),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => learningPathsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.list() }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => learningPathsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.list() }),
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Learning Paths (Admin)</h1>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Creator</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Courses</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {paths.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-gray-400 py-8">No learning paths found.</td></tr>
            ) : paths.map((path: any) => (
              <tr key={path.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{path.title}</td>
                <td className="px-4 py-3 text-gray-500">{path.creator?.fullName ?? '—'}</td>
                <td className="px-4 py-3 text-center text-gray-500">{path.courses?.length ?? 0}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => updateMutation.mutate({ id: path.id, data: { isPublished: !path.isPublished } })}
                    className={`text-xs px-2 py-1 rounded-full font-medium ${path.isPublished ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    {path.isPublished ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${path.title}"?`)) {
                        setDeletingId(path.id);
                        deleteMutation.mutate(path.id, { onSettled: () => setDeletingId(null) });
                      }
                    }}
                    disabled={deletingId === path.id}
                    className="text-red-500 hover:text-red-700 text-xs disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
