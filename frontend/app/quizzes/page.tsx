'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  course?: { title: string };
  attemptCount?: number;
}

async function fetchQuizzes() {
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
  const [error, setError] = useState('');

  const { data: quizzes, isLoading } = useQuery<Quiz[]>({
    queryKey: queryKeys.quizzes.list(),
    queryFn: fetchQuizzes,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Available Quizzes</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
        )}

        {!quizzes || quizzes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No quizzes available</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {(quizzes || []).map((quiz) => (
              <Link
                key={quiz.id}
                href={`/quizzes/${quiz.id}`}
                className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <h2 className="text-lg font-semibold mb-2">{quiz.title}</h2>
                {quiz.course && (
                  <p className="text-sm text-gray-500 mb-2">{quiz.course.title}</p>
                )}
                {quiz.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">{quiz.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
