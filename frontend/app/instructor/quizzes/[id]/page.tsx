'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Course {
  id: string;
  title: string;
}

async function fetchCourses(): Promise<Course[]> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${API}/courses/instructor`, {
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch courses');
  return res.json();
}

async function fetchQuiz(quizId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${API}/quizzes/${quizId}`, {
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch quiz');
  return res.json();
}

export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const quizId = params.id as string;

  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    timeLimitMinutes: 30,
    maxAttempts: 3,
    passScore: 70,
    showResult: 'after_submit',
    showCorrectAnswer: true,
    showExplanation: true,
    shuffleQuestions: false,
    shuffleAnswers: false,
    paginationMode: 'all',
    questionsPerPage: 1,
    allowBackNavigation: true,
    isPublished: false,
    availableFrom: '',
    availableUntil: '',
    showLeaderboard: false,
  });

  // Fetch courses
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: queryKeys.courses.instructor(),
    queryFn: fetchCourses,
  });

  // Fetch quiz
  const { data: quiz, isLoading } = useQuery({
    queryKey: queryKeys.quizzes.detail(quizId),
    queryFn: () => fetchQuiz(quizId),
    enabled: !!quizId,
  });

  // Update formData when quiz loads
  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title || '',
        description: quiz.description || '',
        courseId: quiz.courseId || '',
        timeLimitMinutes: quiz.timeLimitMinutes || 30,
        maxAttempts: quiz.maxAttempts || 3,
        passScore: quiz.passScore || 70,
        showResult: quiz.showResult || 'after_submit',
        showCorrectAnswer: quiz.showCorrectAnswer ?? true,
        showExplanation: quiz.showExplanation ?? true,
        shuffleQuestions: quiz.shuffleQuestions || false,
        shuffleAnswers: quiz.shuffleAnswers || false,
        paginationMode: quiz.paginationMode || 'all',
        questionsPerPage: quiz.questionsPerPage || 1,
        allowBackNavigation: quiz.allowBackNavigation ?? true,
        isPublished: quiz.isPublished || false,
        availableFrom: quiz.availableFrom ? quiz.availableFrom.slice(0, 16) : '',
        availableUntil: quiz.availableUntil ? quiz.availableUntil.slice(0, 16) : '',
        showLeaderboard: quiz.showLeaderboard || false,
      });
    }
  }, [quiz]);

  // Save quiz mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${API}/quizzes/${quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update quiz');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.detail(quizId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.list() });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSave = () => {
    setError('');
    saveMutation.mutate(formData);
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
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Quiz</h1>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time (min)</label>
              <input
                type="number"
                min="1"
                value={formData.timeLimitMinutes}
                onChange={(e) => setFormData({ ...formData, timeLimitMinutes: parseInt(e.target.value) })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
              <input
                type="number"
                min="1"
                value={formData.maxAttempts}
                onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pass Score (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.passScore}
                onChange={(e) => setFormData({ ...formData, passScore: parseInt(e.target.value) })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pagination</label>
              <select
                value={formData.paginationMode}
                onChange={(e) => setFormData({ ...formData, paginationMode: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="all">All questions</option>
                <option value="paginated">Paginated</option>
                <option value="one_by_one">One by one</option>
              </select>
            </div>
            <div className="space-y-2 pt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.shuffleQuestions}
                  onChange={(e) => setFormData({ ...formData, shuffleQuestions: e.target.checked })}
                />
                <span className="text-sm">Shuffle Questions</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.shuffleAnswers}
                  onChange={(e) => setFormData({ ...formData, shuffleAnswers: e.target.checked })}
                />
                <span className="text-sm">Shuffle Answers</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                />
                <span className="text-sm">Published</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.showLeaderboard}
                  onChange={(e) => setFormData({ ...formData, showLeaderboard: e.target.checked })}
                />
                <span className="text-sm">Show Leaderboard</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available From</label>
              <input
                type="datetime-local"
                value={formData.availableFrom}
                onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available Until</label>
              <input
                type="datetime-local"
                value={formData.availableUntil}
                onChange={(e) => setFormData({ ...formData, availableUntil: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
