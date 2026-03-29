'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface PendingGrading {
  id: string;
  quiz: { id: string; title: string; courseId: string };
  user: { id: string; fullName: string };
  answers: {
    id: string;
    textAnswer?: string;
    question: { id: string; content: string; defaultScore: number };
  }[];
}

async function fetchPendingGrading() {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/grading/pending`,
    {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    }
  );
  if (!response.ok) throw new Error('Failed to fetch pending grading');
  return response.json();
}

export default function GradingQueuePage() {
  const queryClient = useQueryClient();
  const [selectedAttempt, setSelectedAttempt] = useState<PendingGrading | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<PendingGrading['answers'][0] | null>(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: pending = [], isLoading } = useQuery<PendingGrading[]>({
    queryKey: ['grading', 'pending'],
    queryFn: fetchPendingGrading,
  });

  const gradeMutation = useMutation({
    mutationFn: async ({ attemptId, answerId, score, feedback }: { attemptId: string; answerId: string; score: number; feedback?: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/grading/attempts/${attemptId}/answers/${answerId}/grade`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ score, feedback: feedback || undefined }),
        }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to submit grade');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading', 'pending'] });
      setSuccess('Graded successfully!');
      setScore('');
      setFeedback('');
      setTimeout(() => setSuccess(''), 3000);

      // Clear selection if no more answers for this attempt
      const updatedAttempt = pending.find((a) => a.id === selectedAttempt?.id);
      if (!updatedAttempt || updatedAttempt.answers.length <= 1) {
        setSelectedAttempt(null);
        setSelectedAnswer(null);
      } else {
        const nextAnswer = updatedAttempt.answers.find((a) => a.id !== selectedAnswer?.id);
        if (nextAnswer) setSelectedAnswer(nextAnswer);
      }
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleGrade = () => {
    if (!selectedAttempt || !selectedAnswer) return;
    if (!score || Number(score) > selectedAnswer.question.defaultScore) {
      setError(`Score must be between 0 and ${selectedAnswer.question.defaultScore}`);
      return;
    }
    gradeMutation.mutate({
      attemptId: selectedAttempt.id,
      answerId: selectedAnswer.id,
      score: Number(score),
      feedback,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Manual Grading Queue</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg">{success}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-4">Pending Grading ({pending.length})</h2>
            {pending.length === 0 ? (
              <p className="text-gray-500">No pending submissions</p>
            ) : (
              <div className="space-y-3">
                {pending.map((attempt) => (
                  <div
                    key={attempt.id}
                    onClick={() => {
                      setSelectedAttempt(attempt);
                      setSelectedAnswer(attempt.answers[0] || null);
                    }}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAttempt?.id === attempt.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-medium">{attempt.user.fullName}</p>
                    <p className="text-sm text-gray-600">{attempt.quiz.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {attempt.answers.length} answer(s) to grade
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grading Form */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            {selectedAttempt && selectedAnswer ? (
              <>
                <div className="mb-6">
                  <h2 className="font-semibold mb-2">Student Answer</h2>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      Question: {selectedAnswer.question.content}
                    </p>
                    <p className="text-lg">
                      {selectedAnswer.textAnswer || 'No answer provided'}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Score (max: {selectedAnswer.question.defaultScore})
                  </label>
                  <input
                    type="number"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    min={0}
                    max={selectedAnswer.question.defaultScore}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Enter score"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Feedback (optional)</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    rows={3}
                    placeholder="Provide feedback to the student..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleGrade}
                    disabled={gradeMutation.isPending || !score}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {gradeMutation.isPending ? 'Submitting...' : 'Submit Grade'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAnswer(null);
                      setSelectedAttempt(null);
                    }}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>

                {/* Answer Navigation */}
                {selectedAttempt.answers.length > 1 && (
                  <div className="mt-6 pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">
                      Other answers in this submission:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAttempt.answers.map((answer, idx) => (
                        <button
                          key={answer.id}
                          onClick={() => setSelectedAnswer(answer)}
                          className={`px-3 py-1 rounded text-sm ${
                            selectedAnswer.id === answer.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          Answer {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Select a submission from the list to start grading
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
