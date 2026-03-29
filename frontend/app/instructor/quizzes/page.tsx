'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  courseId?: string;
  course?: { title: string };
  isPublished: boolean;
  _count?: { attempts: number };
}

async function fetchInstructorQuizzes() {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/quizzes`,
    {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    }
  );
  if (!response.ok) throw new Error('Failed to fetch quizzes');
  return response.json();
}

export default function QuizzesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const { data: quizzes = [], isLoading } = useQuery<Quiz[]>({
    queryKey: queryKeys.quizzes.instructor(),
    queryFn: fetchInstructorQuizzes,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/quizzes/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }
      );
      if (!response.ok) throw new Error('Failed to delete quiz');
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<Quiz[]>(queryKeys.quizzes.instructor(), (old) =>
        old ? old.filter(q => q.id !== deletedId) : []
      );
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    deleteMutation.mutate(id);
  };

  const handleClone = (quiz: Quiz) => {
    if (!quiz.courseId) {
      setError('Quiz này chưa gắn vào khóa học nào, hãy clone từ trang outline của khóa học đích.');
      return;
    }

    router.push(`/instructor/courses/${quiz.courseId}/outline`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Quizzes</h1>
          <Link
            href="/instructor/quizzes/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Quiz
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
        )}

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No quizzes yet</p>
            <Link href="/instructor/quizzes/create" className="text-blue-600 hover:underline">
              Create your first quiz
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Quiz</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Course</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Attempts</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="border-t">
                    <td className="px-4 py-3">
                      <Link href={`/quizzes/${quiz.id}`} className="font-medium hover:text-blue-600">
                        {quiz.title}
                      </Link>
                      {quiz.description && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {quiz.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {quiz.course?.title || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        quiz.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {quiz.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {quiz._count?.attempts || 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/quizzes/${quiz.id}`}
                          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/reports/quizzes/${quiz.id}`}
                          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                        >
                          Reports
                        </Link>
                        <button
                          onClick={() => handleClone(quiz)}
                          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                          title="Clone from the course outline so you can choose the target lesson"
                        >
                          Clone in Outline
                        </button>
                        <button
                          onClick={() => handleDelete(quiz.id)}
                          className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
