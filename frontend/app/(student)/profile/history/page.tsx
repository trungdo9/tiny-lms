'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

interface QuizHistory {
  id: string;
  quizId: string;
  quizTitle: string;
  courseId: string;
  score: number;
  maxScore: number;
  totalScore: number;
  isPassed: boolean;
  status: string;
  startedAt: string;
  submittedAt: string;
}

async function fetchQuizHistory() {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/me/quiz-history`,
    {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    }
  );
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
}

export default function QuizHistoryPage() {
  const [error, setError] = useState('');

  const { data: history, isLoading } = useQuery<QuizHistory[]>({
    queryKey: queryKeys.quizHistory(),
    queryFn: fetchQuizHistory,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Quiz History</h1>
        <p className="text-gray-600 mb-6">View all your quiz attempts</p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Quiz</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Score</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {(history || []).map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3">{item.quizTitle}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium">
                      {item.score}%
                    </span>
                    <span className="text-gray-500 text-sm ml-1">
                      ({item.totalScore}/{item.maxScore})
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.status === 'submitted'
                          ? item.isPassed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {item.status === 'submitted' ? (item.isPassed ? 'Passed' : 'Failed') : item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
              {!history || history.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No quiz attempts yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
