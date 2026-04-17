'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

interface Attempt {
  id: string;
  status: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  timeSpentSecs: number;
  quiz: { title: string; showCorrectAnswer: boolean; showExplanation: boolean };
  attemptQuestions: {
    question: {
      content: string;
      type: string;
      mediaUrl?: string;
      explanation?: string;
      options?: { id: string; content: string; isCorrect?: boolean; matchKey?: string; matchValue?: string }[];
    };
    answer?: { selectedOptions?: string[]; textAnswer?: string; matchAnswer?: Record<string, string> };
  }[];
}

async function fetchResult(attemptId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/attempts/${attemptId}/result`,
    {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    }
  );
  if (!response.ok) throw new Error('Failed to load result');
  return response.json();
}

export default function QuizResultPage() {
  const params = useParams();
  const router = useRouter();
  const [showAnswers, setShowAnswers] = useState(false);
  const attemptId = params.attemptId as string;

  const { data: attempt, isLoading } = useQuery<Attempt>({
    queryKey: queryKeys.attempts.detail(attemptId),
    queryFn: () => fetchResult(attemptId),
    enabled: !!attemptId,
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!attempt) return <div>Result not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Score Card */}
        <div className={`rounded-lg shadow-lg p-8 mb-8 ${attempt.isPassed ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">
              {attempt.isPassed ? '🎉 Passed!' : '😔 Not Passed'}
            </h1>
            <p className="text-gray-600 mb-6">{attempt.quiz.title}</p>

            <div className="flex justify-center items-center gap-8">
              <div>
                <p className="text-5xl font-bold">{Math.round(attempt.percentage)}%</p>
                <p className="text-gray-500">Score</p>
              </div>
              <div className="h-16 w-px bg-gray-300"></div>
              <div>
                <p className="text-3xl font-semibold">{attempt.totalScore}/{attempt.maxScore}</p>
                <p className="text-gray-500">Points</p>
              </div>
              <div className="h-16 w-px bg-gray-300"></div>
              <div>
                <p className="text-3xl font-semibold">{formatTime(attempt.timeSpentSecs || 0)}</p>
                <p className="text-gray-500">Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => router.push(`/quizzes/${params.id}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry Quiz
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 border rounded-lg hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Review Answers */}
        {attempt.quiz.showCorrectAnswer && (
          <div>
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="w-full py-3 border rounded-lg hover:bg-gray-50 mb-4"
            >
              {showAnswers ? 'Hide' : 'Show'} Answer Review
            </button>

            {showAnswers && (
              <div className="space-y-4">
                {attempt.attemptQuestions.map((aq, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm">Q{index + 1}</span>
                      <span className="text-sm text-gray-500">{aq.question.type.replace('_', ' ')}</span>
                    </div>

                    <h3 className="text-lg mb-4">{aq.question.content}</h3>

                    {/* Options */}
                    {aq.question.options && (
                      <div className="space-y-2 mb-4">
                        {aq.question.options.map((opt) => {
                          const isSelected = aq.answer?.selectedOptions?.includes(opt.id);
                          const isCorrect = opt.isCorrect;

                          return (
                            <div
                              key={opt.id}
                              className={`p-3 rounded-lg border ${
                                isCorrect
                                  ? 'bg-green-50 border-green-300'
                                  : isSelected
                                  ? 'bg-red-50 border-red-300'
                                  : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isCorrect && <span className="text-green-600">✓</span>}
                                {isSelected && !isCorrect && <span className="text-red-600">✗</span>}
                                <span>{opt.content}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Short Answer */}
                    {aq.question.type === 'short_answer' && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Your Answer:</p>
                        <p className="p-3 bg-gray-50 rounded">{aq.answer?.textAnswer || '(No answer)'}</p>
                      </div>
                    )}

                    {/* Drag-Drop Text result */}
                    {aq.question.type === 'drag_drop_text' && (() => {
                      const correctMap: Record<string, string> = {};
                      aq.question.options?.forEach(o => { if (o.isCorrect && o.matchKey) correctMap[o.matchKey] = o.content; });
                      const studentMap: Record<string, string> = aq.answer?.matchAnswer || {};
                      const parts = aq.question.content.split(/(\[slot_\d+\])/);
                      return (
                        <div className="text-lg leading-relaxed mb-4">
                          {parts.map((part, i) => {
                            const m = part.match(/^\[(slot_\d+)\]$/);
                            if (!m) return <span key={i}>{part}</span>;
                            const slotId = m[1];
                            const student = studentMap[slotId];
                            const correct = correctMap[slotId];
                            const isRight = student?.toLowerCase() === correct?.toLowerCase();
                            return (
                              <span key={i} className={`inline-block mx-1 px-2 py-0.5 rounded border-2 font-medium ${
                                isRight ? 'bg-green-100 border-green-400 text-green-700'
                                  : student ? 'bg-red-100 border-red-400 text-red-700'
                                  : 'bg-gray-100 border-gray-300 text-gray-400'
                              }`}>
                                {student || '(empty)'}
                                {!isRight && <span className="ml-1 text-xs text-gray-500">→ {correct}</span>}
                              </span>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* Drag-Drop Image result */}
                    {aq.question.type === 'drag_drop_image' && (() => {
                      const zones = aq.question.options?.filter(o => o.matchValue) || [];
                      const studentMap: Record<string, string> = aq.answer?.matchAnswer || {};
                      return (
                        <div className="mb-4">
                          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                            <img src={aq.question.mediaUrl} alt="Question" className="w-full h-full object-contain bg-black" />
                            {zones.map(zone => {
                              let coords = { x: 50, y: 50, w: 10, h: 8 };
                              try { coords = JSON.parse(zone.matchValue!); } catch { /* fallback */ }
                              const placed = studentMap[zone.id];
                              const isRight = placed?.toLowerCase() === zone.content.toLowerCase();
                              return (
                                <div key={zone.id}
                                  className={`absolute flex flex-col items-center justify-center border-2 text-xs font-bold rounded ${
                                    isRight ? 'bg-green-200/70 border-green-500'
                                      : placed ? 'bg-red-200/70 border-red-500'
                                      : 'bg-gray-200/70 border-gray-400'
                                  }`}
                                  style={{ left: `${coords.x}%`, top: `${coords.y}%`, width: `${coords.w}%`, height: `${coords.h}%`, transform: 'translate(-50%,-50%)' }}
                                >
                                  <span>{placed || '?'}</span>
                                  {!isRight && <span className="text-green-700">{zone.content}</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Explanation */}
                    {attempt.quiz.showExplanation && aq.question.explanation && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 mb-1">Explanation:</p>
                        <p className="text-blue-700">{aq.question.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
