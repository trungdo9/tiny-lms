'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { coursesApi } from '@/lib/api';
import { Copy, X, Check, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  courseId?: string;
  course?: { title: string };
  isPublished: boolean;
  _count?: { attempts: number };
}

interface Lesson {
  id: string;
  title: string;
  quiz?: { id: string };
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  sections?: Section[];
}

// ─── Clone Quiz Modal ─────────────────────────────────────────────────────────

function CloneQuizModal({
  quiz,
  onClose,
  onCloned,
}: {
  quiz: Quiz;
  onClose: () => void;
  onCloned: () => void;
}) {
  const [targetCourseId, setTargetCourseId] = useState('');
  const [targetLessonId, setTargetLessonId] = useState('');
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [targetCourse, setTargetCourse] = useState<Course | null>(null);

  // Fetch instructor's courses
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: queryKeys.courses.instructor({}),
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/courses/instructor`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch courses');
      return res.json();
    },
  });

  // Fetch sections when a course is selected
  const { data: sections = [], isLoading: loadingSections } = useQuery<Section[]>({
    queryKey: ['sections', targetCourseId],
    queryFn: async () => {
      if (!targetCourseId) return [];
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/courses/${targetCourseId}/sections`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch sections');
      return res.json();
    },
    enabled: !!targetCourseId,
  });

  const availableLessons = sections.flatMap((s) =>
    s.lessons.filter((l) => !l.quiz).map((l) => ({ ...l, sectionTitle: s.title }))
  );

  const handleClone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLessonId) return;
    setSaving(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/quizzes/${quiz.id}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ targetLessonId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Không clone được quiz');
      }
      onCloned();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold">Clone Quiz</h2>
            <p className="text-sm text-gray-500">Sao chép <strong>{quiz.title}</strong> sang bài học khác</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        {error && <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleClone} className="space-y-4">
          {/* Course selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khóa học đích</label>
            <select
              value={targetCourseId}
              onChange={(e) => { setTargetCourseId(e.target.value); setTargetLessonId(''); setTargetCourse(null); }}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none"
            >
              <option value="">-- Chọn khóa học --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          {/* Lesson selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bài học đích</label>
            {loadingSections ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang tải bài học...
              </div>
            ) : targetCourseId ? (
              <select
                value={targetLessonId}
                onChange={(e) => setTargetLessonId(e.target.value)}
                disabled={availableLessons.length === 0}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none disabled:opacity-50"
              >
                <option value="">-- Chọn bài học --</option>
                {availableLessons.length === 0 && <option disabled>Khóa học này không có bài học trống</option>}
                {availableLessons.map((l) => (
                  <option key={l.id} value={l.id}>{l.sectionTitle} › {l.title}</option>
                ))}
              </select>
            ) : (
              <div className="text-sm text-gray-400 py-2 border rounded-lg bg-gray-50">Chọn khóa học trước</div>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving || !targetLessonId} className="flex-1 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold rounded-lg text-sm transition-colors disabled:opacity-50">
              {saving ? 'Đang clone...' : '⎘ Clone Quiz'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
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
  const [cloneTarget, setCloneTarget] = useState<Quiz | null>(null);

  const { data: quizzes = [], isLoading } = useQuery<Quiz[]>({
    queryKey: queryKeys.quizzes.list(),
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
      queryClient.setQueryData<Quiz[]>(queryKeys.quizzes.list(), (old) =>
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
    setCloneTarget(quiz);
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
                        >
                          ⎘ Clone
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

        {cloneTarget && (
          <CloneQuizModal
            quiz={cloneTarget}
            onClose={() => setCloneTarget(null)}
            onCloned={() => {
              setCloneTarget(null);
              queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.list() });
            }}
          />
        )}
      </div>
    </div>
  );
}
