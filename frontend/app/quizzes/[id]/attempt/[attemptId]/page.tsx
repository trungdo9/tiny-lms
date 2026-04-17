'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCenter,
  pointerWithin,
} from '@dnd-kit/core';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface QuestionOption {
  id: string;
  content: string;
  isCorrect?: boolean;
  matchKey?: string;
  matchValue?: string;
  orderIndex?: number;
}

interface Question {
  id: string;
  questionId: string;
  orderIndex: number;
  isFlagged: boolean;
  isAnswered: boolean;
  question: {
    content: string;
    type: string;
    mediaUrl?: string;
    explanation?: string;
    options?: QuestionOption[];
  };
  answer?: {
    selectedOptions?: string[];
    textAnswer?: string;
    matchAnswer?: Record<string, string>;
    orderAnswer?: string[];
  };
}

interface AttemptData {
  attempt: {
    id: string;
    status: string;
    currentPage: number;
    totalPages: number;
    expiresAt: string | null;
    quiz: {
      title: string;
      timeLimitMinutes: number | null;
      paginationMode: string;
      questionsPerPage: number;
      allowBackNavigation: boolean;
      shuffleQuestions: boolean;
      shuffleAnswers: boolean;
    };
  };
  questions: Question[];
}

interface QuestionSummary {
  id: string;
  questionId: string;
  orderIndex: number;
  pageNumber: number;
  isFlagged: boolean;
  isAnswered: boolean;
  question: {
    id: string;
    content: string;
    type: string;
  };
}

// API functions
async function fetchAttemptPage(attemptId: string, page: number): Promise<AttemptData> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${API}/attempts/${attemptId}/page/${page}`, {
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  if (!res.ok) throw new Error('Failed to load page');
  return res.json();
}

async function fetchAllQuestions(attemptId: string): Promise<QuestionSummary[]> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${API}/attempts/${attemptId}/questions`, {
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch questions');
  return res.json();
}

export default function QuizAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [data, setData] = useState<AttemptData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showNavigator, setShowNavigator] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const { id: quizId, attemptId } = params as { id: string; attemptId: string };

  // Fetch current page data
  const { data: pageData, isLoading: pageLoading } = useQuery<AttemptData>({
    queryKey: queryKeys.attempts.page(attemptId, data?.attempt?.currentPage || 1),
    queryFn: () => fetchAttemptPage(attemptId, data?.attempt?.currentPage || 1),
    enabled: !!attemptId && !!data?.attempt?.currentPage,
  });

  // Fetch all questions for navigator
  const { data: allQuestions = [] } = useQuery<QuestionSummary[]>({
    queryKey: queryKeys.attempts.questions(attemptId),
    queryFn: () => fetchAllQuestions(attemptId),
    enabled: !!attemptId,
  });

  // Initial fetch
  useEffect(() => {
    if (attemptId && !data) {
      fetchAttemptPage(attemptId, 1).then(setData).catch((err) => setError(err.message));
    }
  }, [attemptId]);

  // Update data when pageData changes
  useEffect(() => {
    if (pageData) {
      setData(pageData);
    }
  }, [pageData]);

  // Flag mutation
  const flagMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${API}/attempts/${attemptId}/questions/${questionId}/flag`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attempts.page(attemptId, data?.attempt?.currentPage || 1) });
      queryClient.invalidateQueries({ queryKey: queryKeys.attempts.questions(attemptId) });
    },
  });

  const toggleFlag = (questionId: string) => {
    flagMutation.mutate(questionId);
  };

  // Save answer - fire and forget (debounced in component)
  const saveAnswer = useCallback(async (questionId: string, answer: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${API}/attempts/${attemptId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ questionId, ...answer }),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.attempts.questions(attemptId) });
    } catch (err) {
      console.error('Failed to save answer:', err);
    }
  }, [attemptId, queryClient]);

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${API}/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!response.ok) throw await response.json();
    },
    onSuccess: () => {
      router.push(`/quizzes/${quizId}/result/${attemptId}`);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to submit');
    },
  });

  const handleSubmit = () => {
    setSubmitting(true);
    submitMutation.mutate();
  };

  // Exit protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (data?.attempt?.status === 'in_progress') {
        e.preventDefault();
        e.returnValue = 'You have an in-progress quiz. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [data?.attempt?.status]);

  // Timer - use expiresAt for accurate sync across sessions
  useEffect(() => {
    if (!data?.attempt?.expiresAt || data?.attempt?.status !== 'in_progress') return;

    const calculateTimeLeft = () => {
      const expires = new Date(data.attempt.expiresAt!).getTime();
      const now = Date.now();
      return Math.max(0, Math.floor((expires - now) / 1000));
    };

    if (timeLeft === null) {
      setTimeLeft(calculateTimeLeft());
    }

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      if (remaining <= 0) {
        clearInterval(timer);
        handleSubmit();
        setTimeLeft(0);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data?.attempt?.expiresAt, data?.attempt?.status]);

  // fetchPage is now handled by useQuery with queryClient.invalidateQueries for refresh
  const fetchPage = async (page: number) => {
    try {
      const result = await fetchAttemptPage(attemptId, page);
      setData(result);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAnswerChange = (questionId: string, field: string, value: any) => {
    if (!data) return;

    setData({
      ...data,
      questions: data.questions.map((q) => {
        if (q.questionId === questionId) {
          return { ...q, isAnswered: true };
        }
        return q;
      }),
    });

    const answer = data.questions.find((q) => q.questionId === questionId)?.answer || {};
    setTimeout(() => {
      saveAnswer(questionId, { ...answer, [field]: value });
    }, 500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft === null) return 'bg-gray-100';
    if (timeLeft <= 60) return 'bg-red-100 text-red-600 animate-pulse';
    if (timeLeft <= 300) return 'bg-yellow-100 text-yellow-600';
    return 'bg-blue-100 text-blue-600';
  };

  const getQuestionStatus = (q: QuestionSummary) => {
    if (q.isFlagged) return 'flagged';
    if (q.isAnswered) return 'answered';
    return 'unanswered';
  };

  // Progress calculation
  const answeredCount = allQuestions.filter((q) => q.isAnswered).length;
  const flaggedCount = allQuestions.filter((q) => q.isFlagged).length;
  const totalCount = allQuestions.length;

  if (pageLoading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return <div>No data</div>;

  const { attempt, questions } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="font-semibold truncate text-lg">{attempt.quiz.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-green-600 font-medium">{answeredCount}/{totalCount}</span>
              <span className="text-gray-400">answered</span>
              {flaggedCount > 0 && (
                <span className="text-yellow-600">• {flaggedCount} flagged</span>
              )}
            </div>

            {/* Timer */}
            {timeLeft !== null && (
              <div className={`px-4 py-2 rounded-lg font-mono font-bold ${getTimerColor()}`}>
                {formatTime(timeLeft)}
              </div>
            )}

            {/* Navigator Toggle */}
            <button
              onClick={() => setShowNavigator(!showNavigator)}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm"
            >
              {showNavigator ? 'Hide' : 'Show'} List
            </button>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={submitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-200">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${(answeredCount / totalCount) * 100}%` }}
          />
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Question Navigator Sidebar */}
        {showNavigator && (
          <aside className="w-64 bg-white border-r p-4 hidden md:block h-[calc(100vh-60px)] sticky top-[60px] overflow-y-auto">
            <h3 className="font-semibold mb-3">Questions</h3>
            <div className="grid grid-cols-5 gap-2">
              {allQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => fetchPage(q.pageNumber)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    q.questionId === questions[0]?.questionId
                      ? 'ring-2 ring-blue-500'
                      : ''
                  } ${
                    getQuestionStatus(q) === 'flagged'
                      ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400'
                      : getQuestionStatus(q) === 'answered'
                      ? 'bg-green-100 text-green-700 border-2 border-green-400'
                      : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {q.orderIndex + 1}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded"></div>
                <span>Not answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded"></div>
                <span>Flagged</span>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 px-4 py-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
          )}

          {questions.map((q, index) => (
            <div key={q.id} className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                    Question {q.orderIndex + 1}
                  </span>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    {q.question.type.replace('_', ' ')}
                  </span>
                  {q.isAnswered && (
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs flex items-center">
                      ✓ Answered
                    </span>
                  )}
                </div>
                <button
                  onClick={() => toggleFlag(q.questionId)}
                  className={`p-2 rounded-lg transition ${
                    q.isFlagged
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-yellow-500'
                  }`}
                  title={q.isFlagged ? 'Remove flag' : 'Flag for review'}
                >
                  {q.isFlagged ? '🚩' : '⚐'}
                </button>
              </div>

              <h2 className="text-lg mb-6">{q.question.content}</h2>

              {/* Single Choice */}
              {(q.question.type === 'single' || q.question.type === 'true_false') && (
                <div className="space-y-3">
                  {q.question.options?.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        q.answer?.selectedOptions?.includes(opt.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.questionId}
                        checked={q.answer?.selectedOptions?.includes(opt.id)}
                        onChange={() => handleAnswerChange(q.questionId, 'selectedOptions', [opt.id])}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="text-base">{opt.content}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Multi Choice */}
              {q.question.type === 'multi' && (
                <div className="space-y-3">
                  {q.question.options?.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        q.answer?.selectedOptions?.includes(opt.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={q.answer?.selectedOptions?.includes(opt.id)}
                        onChange={(e) => {
                          const current = q.answer?.selectedOptions || [];
                          const updated = e.target.checked
                            ? [...current, opt.id]
                            : current.filter((id) => id !== opt.id);
                          handleAnswerChange(q.questionId, 'selectedOptions', updated);
                        }}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="text-base">{opt.content}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Short Answer */}
              {q.question.type === 'short_answer' && (
                <textarea
                  value={q.answer?.textAnswer || ''}
                  onChange={(e) => handleAnswerChange(q.questionId, 'textAnswer', e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              )}

              {/* Essay */}
              {q.question.type === 'essay' && (
                <textarea
                  value={q.answer?.textAnswer || ''}
                  onChange={(e) => handleAnswerChange(q.questionId, 'textAnswer', e.target.value)}
                  placeholder="Write your essay answer..."
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={8}
                />
              )}

              {/* Matching */}
              {q.question.type === 'matching' && (
                <MatchingInput
                  options={q.question.options || []}
                  answer={q.answer?.matchAnswer || {}}
                  onChange={(matchAnswer) => handleAnswerChange(q.questionId, 'matchAnswer', matchAnswer)}
                />
              )}

              {/* Ordering */}
              {q.question.type === 'ordering' && (
                <OrderingInput
                  options={q.question.options || []}
                  answer={q.answer?.orderAnswer || []}
                  onChange={(orderAnswer) => handleAnswerChange(q.questionId, 'orderAnswer', orderAnswer)}
                />
              )}

              {/* Cloze */}
              {q.question.type === 'cloze' && (
                <ClozeInput
                  content={q.question.content}
                  options={q.question.options || []}
                  answer={q.answer?.textAnswer || ''}
                  onChange={(textAnswer) => handleAnswerChange(q.questionId, 'textAnswer', textAnswer)}
                />
              )}

              {/* Drag-Drop Text */}
              {q.question.type === 'drag_drop_text' && (
                <DragDropTextInput
                  content={q.question.content}
                  options={q.question.options || []}
                  answer={(q.answer?.matchAnswer as Record<string, string>) || {}}
                  onChange={(val) => handleAnswerChange(q.questionId, 'matchAnswer', val)}
                />
              )}

              {/* Drag-Drop Image */}
              {q.question.type === 'drag_drop_image' && (
                <DragDropImageInput
                  mediaUrl={q.question.mediaUrl || ''}
                  options={q.question.options || []}
                  answer={(q.answer?.matchAnswer as Record<string, string>) || {}}
                  onChange={(val) => handleAnswerChange(q.questionId, 'matchAnswer', val)}
                />
              )}
            </div>
          ))}

          {/* Pagination */}
          {attempt.quiz.paginationMode === 'one_by_one' ? (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-medium">Question {attempt.currentPage} of {attempt.totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchPage(attempt.currentPage - 1)}
                  disabled={attempt.currentPage <= 1 || !attempt.quiz.allowBackNavigation}
                  className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchPage(attempt.currentPage + 1)}
                  disabled={attempt.currentPage >= attempt.totalPages}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {attempt.currentPage >= attempt.totalPages ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
          ) : attempt.quiz.paginationMode === 'paginated' ? (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Page {attempt.currentPage} of {attempt.totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchPage(attempt.currentPage - 1)}
                  disabled={attempt.currentPage <= 1 || !attempt.quiz.allowBackNavigation}
                  className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchPage(attempt.currentPage + 1)}
                  disabled={attempt.currentPage >= attempt.totalPages}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-green-50 rounded-lg text-center">
              <p className="text-green-600">All questions on one page • Total {attempt.totalPages} questions</p>
            </div>
          )}
        </main>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Submit Quiz</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-green-700">Answered:</span>
                <span className="font-bold text-green-700">{answeredCount}/{totalCount}</span>
              </div>
              <div className="flex justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-yellow-700">Flagged for review:</span>
                <span className="font-bold text-yellow-700">{flaggedCount}</span>
              </div>
              <div className="flex justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-red-700">Not answered:</span>
                <span className="font-bold text-red-700">{totalCount - answeredCount}</span>
              </div>
            </div>

            {totalCount - answeredCount > 0 && (
              <p className="text-yellow-600 text-sm mb-4">
                ⚠️ You have {totalCount - answeredCount} unanswered question(s). Are you sure you want to submit?
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Review Answers
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  handleSubmit();
                }}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// DragDropText — draggable token chip
function DraggableToken({ id, content, dimmed }: { id: string; content: string; dimmed?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <span
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`inline-block px-3 py-1 border-2 border-black bg-white font-medium text-sm rounded cursor-grab select-none transition-opacity ${
        isDragging ? 'opacity-0' : dimmed ? 'opacity-40' : 'opacity-100'
      }`}
    >
      {content}
    </span>
  );
}

// DragDropText — droppable slot
function DroppableSlot({ id, placed }: { id: string; placed?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <span
      ref={setNodeRef}
      className={`inline-block min-w-[80px] mx-1 px-3 py-1 border-b-2 align-middle text-center text-sm font-medium transition-colors ${
        placed
          ? 'border-blue-500 bg-blue-50 text-blue-800'
          : isOver
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-400 bg-gray-50 text-gray-400'
      }`}
    >
      {placed || '　'}
    </span>
  );
}

// DragDropText — word bank drop target (to return tokens)
function DroppableBank({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: '__bank__' });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-wrap gap-2 p-3 border-2 border-dashed rounded-lg min-h-[48px] transition-colors ${
        isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
      }`}
    >
      {children}
    </div>
  );
}

function DragDropTextInput({
  content,
  options,
  answer,
  onChange,
}: {
  content: string;
  options: QuestionOption[];
  answer: Record<string, string>;
  onChange: (answer: Record<string, string>) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor));
  const [activeContent, setActiveContent] = useState<string | null>(null);

  const parts = content.split(/(\[slot_\d+\])/);
  const placedSet = new Set(Object.values(answer));

  const handleDragStart = (event: any) => {
    const opt = options.find((o) => o.id === event.active.id);
    setActiveContent(opt?.content ?? null);
  };

  const handleDragEnd = (event: any) => {
    setActiveContent(null);
    const { active, over } = event;
    if (!over) return;
    const opt = options.find((o) => o.id === active.id);
    if (!opt) return;

    if (over.id === '__bank__') {
      // Remove token from wherever it was placed
      const updated = { ...answer };
      for (const [slot, val] of Object.entries(updated)) {
        if (val === opt.content) delete updated[slot];
      }
      onChange(updated);
    } else {
      // Place token in slot (over.id is slot string like "slot_0")
      onChange({ ...answer, [over.id as string]: opt.content });
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Drag words into the correct slots.</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="text-lg leading-loose">
          {parts.map((part, i) => {
            const m = part.match(/^\[slot_(\d+)\]$/);
            if (m) {
              const slotId = `slot_${m[1]}`;
              return <DroppableSlot key={i} id={slotId} placed={answer[slotId]} />;
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-2">Word bank:</p>
          <DroppableBank>
            {options.map((opt) => (
              <DraggableToken key={opt.id} id={opt.id} content={opt.content} dimmed={placedSet.has(opt.content)} />
            ))}
          </DroppableBank>
        </div>
        <DragOverlay>
          {activeContent && (
            <span className="inline-block px-3 py-1 border-2 border-black bg-yellow-100 font-medium text-sm rounded shadow-lg cursor-grabbing">
              {activeContent}
            </span>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// DragDropImage — draggable label chip
function DraggableLabel({ id, content }: { id: string; content: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <span
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`inline-block px-3 py-1 border-2 border-black bg-white font-medium text-sm rounded cursor-grab select-none transition-opacity ${
        isDragging ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {content}
    </span>
  );
}

// DragDropImage — droppable zone overlay
function DroppableZone({ id, coords, placed }: { id: string; coords: { x: number; y: number; w: number; h: number }; placed?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'absolute',
        left: `${coords.x}%`,
        top: `${coords.y}%`,
        width: `${coords.w}%`,
        height: `${coords.h}%`,
        transform: 'translate(-50%, -50%)',
      }}
      className={`flex items-center justify-center border-2 border-dashed text-xs font-medium transition-colors ${
        placed
          ? 'border-blue-500 bg-blue-500/20 text-blue-900'
          : isOver
          ? 'border-blue-400 bg-blue-400/20'
          : 'border-white/70 bg-black/10 text-white'
      }`}
    >
      {placed || 'Drop here'}
    </div>
  );
}

function DragDropImageInput({
  mediaUrl,
  options,
  answer,
  onChange,
}: {
  mediaUrl: string;
  options: QuestionOption[];
  answer: Record<string, string>;
  onChange: (answer: Record<string, string>) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor));
  const [activeContent, setActiveContent] = useState<string | null>(null);

  const zones = options.filter((o) => o.matchValue != null && o.matchValue !== '');
  const distractors = options.filter((o) => o.matchValue == null || o.matchValue === '');
  const placedSet = new Set(Object.values(answer));

  const handleDragStart = (event: any) => {
    const opt = options.find((o) => o.id === event.active.id);
    setActiveContent(opt?.content ?? null);
  };

  const handleDragEnd = (event: any) => {
    setActiveContent(null);
    const { active, over } = event;
    if (!over || over.id === '__label_bank__') return;
    const opt = options.find((o) => o.id === active.id);
    if (!opt) return;
    onChange({ ...answer, [over.id as string]: opt.content });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Drag labels onto the correct zones in the image.</p>
      <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
          <img src={mediaUrl} alt="Question image" className="w-full h-full object-contain bg-black" />
          {zones.map((zone) => {
            let coords = { x: 50, y: 50, w: 15, h: 10 };
            try { coords = JSON.parse(zone.matchValue!); } catch { /* fallback */ }
            return (
              <DroppableZone key={zone.id} id={zone.id} coords={coords} placed={answer[zone.id]} />
            );
          })}
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-2">Labels:</p>
          <div className="flex flex-wrap gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            {[...zones, ...distractors].map((opt) => (
              <DraggableLabel key={opt.id} id={opt.id} content={opt.content} />
            ))}
          </div>
        </div>
        <DragOverlay>
          {activeContent && (
            <span className="inline-block px-3 py-1 border-2 border-black bg-yellow-100 font-medium text-sm rounded shadow-lg cursor-grabbing">
              {activeContent}
            </span>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// Matching Input Component
function MatchingInput({
  options,
  answer,
  onChange,
}: {
  options: QuestionOption[];
  answer: Record<string, string>;
  onChange: (answer: Record<string, string>) => void;
}) {
  const leftOptions = options.filter((o) => o.matchKey);
  const rightOptions = options.filter((o) => o.matchValue);

  const handleSelect = (leftId: string, rightId: string) => {
    onChange({ ...answer, [leftId]: rightId });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Match each item on the left with the correct item on the right.</p>
      {leftOptions.map((left) => (
        <div key={left.id} className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg">
          <span className="flex-1 font-medium">{left.content}</span>
          <span className="text-gray-400">→</span>
          <select
            value={answer[left.id] || ''}
            onChange={(e) => handleSelect(left.id, e.target.value)}
            className="flex-1 p-3 border-2 border-gray-200 rounded-lg"
          >
            <option value="">Select match...</option>
            {rightOptions.map((right) => (
              <option key={right.id} value={right.id}>
                {right.content}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

// Ordering Input Component
function OrderingInput({
  options,
  answer,
  onChange,
}: {
  options: QuestionOption[];
  answer: string[];
  onChange: (answer: string[]) => void;
}) {
  const [items, setItems] = useState<string[]>(answer.length > 0 ? answer : options.map((o) => o.id));

  useEffect(() => {
    if (answer.length === 0) {
      setItems(options.map((o) => o.id));
    }
  }, [options, answer]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    if (direction === 'up' && index > 0) {
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    } else if (direction === 'down' && index < newItems.length - 1) {
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    }
    setItems(newItems);
    onChange(newItems);
  };

  const getOptionContent = (id: string) => options.find((o) => o.id === id)?.content || '';

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Arrange the items in the correct order.</p>
      <div className="space-y-2">
        {items.map((id, index) => (
          <div key={id} className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg bg-white">
            <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
              {index + 1}
            </span>
            <span className="flex-1">{getOptionContent(id)}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => moveItem(index, 'up')}
                disabled={index === 0}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, 'down')}
                disabled={index === items.length - 1}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Cloze Input Component
function ClozeInput({
  content,
  options,
  answer,
  onChange,
}: {
  content: string;
  options: QuestionOption[];
  answer: string;
  onChange: (answer: string) => void;
}) {
  const parts = content.split(/(\[[^\]]+\])/);
  const blanks = options.filter((o) => o.matchKey?.startsWith('blank'));

  const handleBlankChange = (blankId: string, value: string) => {
    const currentAnswers: Record<string, string> = answer ? JSON.parse(answer) : {};
    currentAnswers[blankId] = value;
    onChange(JSON.stringify(currentAnswers));
  };

  const getAnswerValue = (blankId: string): string => {
    try {
      const currentAnswers: Record<string, string> = answer ? JSON.parse(answer) : {};
      return currentAnswers[blankId] || '';
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-lg leading-relaxed">
        {parts.map((part, index) => {
          const blankMatch = part.match(/\[blank:([^\]]+)\]/);
          if (blankMatch) {
            const blankId = blankMatch[1];
            return (
              <span key={index} className="inline-block mx-1">
                <input
                  type="text"
                  value={getAnswerValue(blankId)}
                  onChange={(e) => handleBlankChange(blankId, e.target.value)}
                  placeholder="answer"
                  className="w-32 p-2 border-b-2 border-blue-500 focus:outline-none text-center"
                />
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
      {blanks.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Available answers:</p>
          <div className="flex flex-wrap gap-2">
            {blanks.map((blank) => (
              <span key={blank.id} className="px-3 py-1 bg-white border rounded text-sm">
                {blank.content}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
