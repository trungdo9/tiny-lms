'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  timeLimitMinutes: number | null;
  maxAttempts: number | null;
  passScore: number | null;
  showCorrectAnswer: boolean;
  showExplanation: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  paginationMode: string;
  questionsPerPage: number;
  isPublished: boolean;
  availableFrom: string | null;
  availableUntil: string | null;
  showLeaderboard: boolean;
  course?: { id: string; title: string };
  _count: { questions: number; attempts: number };
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl: string | null;
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  submittedAt: string;
  timeSpentSecs: number | null;
}

async function fetchQuiz(quizId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/quizzes/${quizId}`, {
    headers: {
      Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
  });
  if (!response.ok) throw new Error('Quiz not found');
  return response.json();
}

async function fetchLeaderboard(quizId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/quizzes/${quizId}/leaderboard?limit=10`, {
    headers: {
      Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
  });
  if (!response.ok) return [];
  return response.json();
}

export default function QuizIntroPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const { data: quiz, isLoading } = useQuery<Quiz>({
    queryKey: queryKeys.quizzes.detail(quizId),
    queryFn: () => fetchQuiz(quizId),
    enabled: !!quizId,
  });

  const { data: leaderboard = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: ['quizzes', quizId, 'leaderboard'],
    queryFn: () => fetchLeaderboard(quizId),
    enabled: !!quizId && !!quiz?.showLeaderboard,
  });

  const startQuiz = async () => {
    setStarting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/quizzes/${quizId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to start quiz');
      }

      const attempt = await response.json();
      router.push(`/quizzes/${quizId}/attempt/${attempt.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => router.back()} className="text-blue-600 hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>

          {quiz.description && (
            <p className="text-gray-600 mb-6">{quiz.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Questions</p>
              <p className="text-2xl font-bold">{quiz._count.questions}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Time Limit</p>
              <p className="text-2xl font-bold">
                {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : 'Unlimited'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Max Attempts</p>
              <p className="text-2xl font-bold">
                {quiz.maxAttempts || 'Unlimited'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Pass Score</p>
              <p className="text-2xl font-bold">
                {quiz.passScore ? `${quiz.passScore}%` : 'None'}
              </p>
            </div>
          </div>

          {/* Quiz availability */}
          {(quiz.availableFrom || quiz.availableUntil) && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 mb-2">Quiz Availability</p>
              <p className="text-sm text-yellow-700">
                {quiz.availableFrom && (
                  <span>From: {new Date(quiz.availableFrom).toLocaleString()}</span>
                )}
                {quiz.availableFrom && quiz.availableUntil && <span> - </span>}
                {quiz.availableUntil && (
                  <span>Until: {new Date(quiz.availableUntil).toLocaleString()}</span>
                )}
              </p>
            </div>
          )}

          {/* Leaderboard */}
          {quiz.showLeaderboard && (leaderboard || []).length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Rank</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Name</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold">Score</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => (
                      <tr key={entry.userId} className="border-t border-gray-200">
                        <td className="px-4 py-2">
                          {entry.rank <= 3 ? (
                            <span className={`font-bold ${
                              entry.rank === 1 ? 'text-yellow-600' :
                              entry.rank === 2 ? 'text-gray-600' :
                              'text-amber-700'
                            }`}>#{entry.rank}</span>
                          ) : (
                            <span className="text-gray-600">#{entry.rank}</span>
                          )}
                        </td>
                        <td className="px-4 py-2 font-medium">{entry.userName}</td>
                        <td className="px-4 py-2 text-right">
                          {entry.percentage?.toFixed(1)}%
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span className={`inline-block px-2 py-1 text-xs rounded ${
                            entry.isPassed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {entry.isPassed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={startQuiz}
            disabled={starting || !quiz.isPublished}
            className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {starting ? 'Starting...' : quiz.isPublished ? 'Start Quiz' : 'Quiz Not Available'}
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            {quiz._count.attempts} attempt(s) made
          </p>
        </div>
      </div>
    </div>
  );
}
