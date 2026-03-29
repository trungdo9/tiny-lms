'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { coursesApi, scormApi } from '@/lib/api';
import { InstructorManager } from '@/components/instructor-manager';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Section {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

interface Quiz {
  id: string;
  title: string;
  isPublished: boolean;
  _count?: { questions: number };
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  orderIndex: number;
  quiz?: Quiz | null;
}

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  thumbnailUrl: string;
  level: string;
  isFree: boolean;
  sections: Section[];
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

function mapLesson(dataLesson: any): Lesson {
  return {
    ...dataLesson,
    orderIndex: dataLesson.order_index ?? dataLesson.orderIndex ?? 0,
    title: dataLesson.title ?? '',
    type: dataLesson.type ?? 'text',
  };
}

function mapSection(dataSection: any): Section {
  return {
    ...dataSection,
    orderIndex: dataSection.order_index ?? dataSection.orderIndex ?? 0,
    title: dataSection.title ?? '',
    lessons: (dataSection.lessons || []).map(mapLesson),
  };
}

async function fetchCourse(courseId: string): Promise<Course> {
  const data = await coursesApi.get(courseId) as any;
  const sections = (data.sections || []).map(mapSection);

  const { data: { session } } = await supabase.auth.getSession();

  const sectionsWithQuizzes = await Promise.all(
    sections.map(async (section: Section) => ({
      ...section,
      lessons: await Promise.all(
        section.lessons.map(async (lesson: Lesson) => {
          try {
            const res = await fetch(`${API}/lessons/${lesson.id}/quizzes`, {
              headers: { Authorization: `Bearer ${session?.access_token}` },
            });
            if (!res.ok) return lesson;
            const quiz = await res.json();
            return { ...lesson, quiz };
          } catch {
            return lesson;
          }
        })
      ),
    }))
  );

  return {
    ...data,
    thumbnailUrl: data.thumbnailUrl ?? data.thumbnail_url ?? '',
    isFree: data.isFree ?? data.is_free ?? true,
    title: data.title ?? '',
    description: data.description ?? '',
    level: data.level ?? 'beginner',
    status: data.status ?? 'draft',
    sections: sectionsWithQuizzes,
  };
}

function QuizCreateModal({
  lesson,
  onClose,
  onCreated,
}: {
  lesson: Lesson;
  onClose: () => void;
  onCreated: (quiz: Quiz) => void;
}) {
  const [form, setForm] = useState({
    title: `Quiz: ${lesson.title}`,
    timeLimitMinutes: 30,
    maxAttempts: 3,
    passScore: 70,
    shuffleQuestions: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API}/lessons/${lesson.id}/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Không tạo được quiz');
      }
      onCreated(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-1">Tạo Quiz cho Bài học</h2>
        <p className="text-sm text-gray-500 mb-4 truncate">📖 {lesson.title}</p>
        {error && <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Quiz *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input type="number" min={1} value={form.timeLimitMinutes} onChange={(e) => setForm({ ...form, timeLimitMinutes: +e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input type="number" min={1} value={form.maxAttempts} onChange={(e) => setForm({ ...form, maxAttempts: +e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input type="number" min={0} max={100} value={form.passScore} onChange={(e) => setForm({ ...form, passScore: +e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.shuffleQuestions} onChange={(e) => setForm({ ...form, shuffleQuestions: e.target.checked })} className="rounded" />
            Trộn câu hỏi ngẫu nhiên
          </label>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving} className="flex-1 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold rounded-lg text-sm transition-colors disabled:opacity-50">
              {saving ? 'Đang tạo...' : '✓ Tạo Quiz'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CloneQuizModal({
  quiz,
  sections,
  onClose,
  onCloned,
}: {
  quiz: Quiz;
  sections: Section[];
  onClose: () => void;
  onCloned: () => void;
}) {
  const [targetLessonId, setTargetLessonId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      const res = await fetch(`${API}/quizzes/${quiz.id}/clone`, {
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
        <h2 className="text-lg font-bold mb-1">Clone Quiz</h2>
        <p className="text-sm text-gray-500 mb-4">Sao chép <strong>{quiz.title}</strong> sang bài học khác</p>
        {error && <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleClone} className="space-y-4">
          <select required value={targetLessonId} onChange={(e) => setTargetLessonId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none">
            <option value="">-- Chọn bài học --</option>
            {availableLessons.map((l) => (
              <option key={l.id} value={l.id}>{l.sectionTitle} › {l.title}</option>
            ))}
          </select>
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

function LessonRow({
  lesson,
  sections,
  onQuizCreated,
  onQuizCloned,
}: {
  lesson: Lesson;
  sections: Section[];
  onQuizCreated: (lessonId: string, quiz: Quiz) => void;
  onQuizCloned: () => void;
}) {
  const router = useRouter();
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [showCloneQuiz, setShowCloneQuiz] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 group">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-gray-400 text-xs w-4 shrink-0">{lesson.type === 'video' ? '▶' : lesson.type === 'quiz' ? '📝' : '📄'}</span>
          <span className="text-sm text-gray-700 truncate">{lesson.title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {lesson.quiz ? (
            <div className="flex items-center gap-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${lesson.quiz.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                onClick={() => router.push(`/instructor/quizzes/${lesson.quiz!.id}`)}
                title="Mở quiz"
              >
                📝 {lesson.quiz.title}
                {lesson.quiz._count && <span className="opacity-60"> ({lesson.quiz._count.questions}Q)</span>}
              </span>
              <button onClick={() => setShowCloneQuiz(true)} className="hidden group-hover:inline-flex items-center px-2 py-0.5 rounded text-xs border border-gray-200 hover:bg-gray-100 text-gray-500" title="Clone quiz sang bài học khác">⎘</button>
            </div>
          ) : (
            <button onClick={() => setShowCreateQuiz(true)} className="hidden group-hover:inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-900 text-white hover:bg-slate-700 transition-colors">+ Tạo Quiz</button>
          )}
        </div>
      </div>
      {showCreateQuiz && (
        <QuizCreateModal lesson={lesson} onClose={() => setShowCreateQuiz(false)} onCreated={(quiz) => { setShowCreateQuiz(false); onQuizCreated(lesson.id, quiz); }} />
      )}
      {showCloneQuiz && lesson.quiz && (
        <CloneQuizModal quiz={lesson.quiz} sections={sections} onClose={() => setShowCloneQuiz(false)} onCloned={() => { setShowCloneQuiz(false); onQuizCloned(); }} />
      )}
    </>
  );
}

function SectionCard({
  section,
  sections,
  onQuizCreated,
  onQuizCloned,
}: {
  section: Section;
  sections: Section[];
  onQuizCreated: (lessonId: string, quiz: Quiz) => void;
  onQuizCloned: () => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-medium text-slate-900">{section.title}</h3>
          <p className="text-xs text-gray-500">{section.lessons.length} bài học</p>
        </div>
      </div>
      <div className="space-y-1">
        {section.lessons.map((lesson) => (
          <LessonRow key={lesson.id} lesson={lesson} sections={sections} onQuizCreated={onQuizCreated} onQuizCloned={onQuizCloned} />
        ))}
      </div>
    </div>
  );
}


// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseId = params.id as string;

  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    level: 'beginner',
    status: 'draft',
    isFree: true,
  });
  const [sections, setSections] = useState<Section[]>([]);
  const [scormPackage, setScormPackage] = useState<{ id: string; version: string; title: string } | null>(null);
  const [scormUploading, setScormUploading] = useState(false);
  const scormFileRef = useRef<HTMLInputElement>(null);

  const { data: course, isLoading } = useQuery<Course>({
    queryKey: queryKeys.courses.detail(courseId),
    queryFn: () => fetchCourse(courseId),
    enabled: !!courseId,
  });

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        thumbnailUrl: course.thumbnailUrl || '',
        level: course.level || 'beginner',
        status: course.status || 'draft',
        isFree: course.isFree ?? true,
      });
      setSections(course.sections || []);
      scormApi.getPackageByCourse(courseId).then(setScormPackage).catch(() => {});
    }
  }, [course, courseId]);

  const handleScormUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setScormUploading(true);
      const result = await scormApi.uploadCourse(courseId, file);
      setScormPackage({ id: result.id, version: result.version, title: result.title });
    } catch (err: any) {
      setError(err.message || 'Failed to upload SCORM package');
    } finally {
      setScormUploading(false);
      if (scormFileRef.current) scormFileRef.current.value = '';
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API}/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Không lưu được');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.instructor() });
    },
    onError: (err: Error) => setError(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
      </div>
    );
  }

  const totalLessons = sections.reduce((sum, s) => sum + s.lessons.length, 0);
  const totalQuizzes = sections.reduce(
    (sum, s) => sum + s.lessons.filter((lesson) => lesson.quiz).length,
    0
  );

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Chỉnh sửa Khóa học</h1>
            <p className="text-sm text-gray-500 mt-1">
              {sections.length} phần · {totalLessons} bài học · {totalQuizzes} quiz
            </p>
            {/* Tabs */}
            <div className="flex gap-4 mt-3 border-b border-gray-200">
              <span className="text-sm font-semibold text-slate-900 pb-2 border-b-2 border-amber-400 cursor-default">
                Thông tin
              </span>
              <Link
                href={`/instructor/courses/${courseId}/outline`}
                className="text-sm text-gray-500 hover:text-gray-700 pb-2 border-b-2 border-transparent hover:border-gray-300 transition-colors"
              >
                Course Outline
              </Link>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setError(''); saveMutation.mutate(formData); }}
              disabled={saveMutation.isPending}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
            >
              Quay lại
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
        )}

        {/* Course Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Thông tin khóa học</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên khóa học</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cấp độ</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="beginner">Cơ bản</option>
                  <option value="intermediate">Trung cấp</option>
                  <option value="advanced">Nâng cao</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="draft">Nháp</option>
                  <option value="published">Đã xuất bản</option>
                  <option value="archived">Lưu trữ</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.isFree}
                onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                className="rounded"
              />
              Khóa học miễn phí
            </label>
          </div>
        </div>

        {/* Course Outline + Quiz Management */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Cấu trúc khóa học</h2>
              <p className="text-sm text-gray-500">
                {sections.length} phần · {totalLessons} bài học · {totalQuizzes} quiz
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/instructor/courses/${courseId}/outline`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-sm transition-colors"
              >
                <span>✏️</span> Chỉnh sửa Outline
              </Link>
              <Link
                href={`/instructor/quizzes`}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-slate-700 font-semibold rounded-lg text-sm transition-colors"
              >
                <span>📝</span> Quản lý Quiz
              </Link>
            </div>
          </div>

          {sections.length > 0 ? (
            <div className="mt-4 space-y-3">
              {sections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  sections={sections}
                  onQuizCreated={(lessonId, quiz) =>
                    setSections((prev) =>
                      prev.map((s) => ({
                        ...s,
                        lessons: s.lessons.map((l) => (l.id === lessonId ? { ...l, quiz } : l)),
                      }))
                    )
                  }
                  onQuizCloned={() => queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(courseId) })}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
              Khóa học này chưa có phần học nào. Hãy vào Outline để thêm phần học và bài học trước khi tạo quiz.
            </div>
          )}
        </div>

        {/* SCORM Package (Standalone Mode) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
          <h2 className="font-semibold text-gray-900 mb-4">SCORM Package (Standalone Mode)</h2>
          {scormPackage ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                📦 {scormPackage.title} — SCORM {scormPackage.version}
              </span>
              <button
                onClick={() => scormFileRef.current?.click()}
                disabled={scormUploading}
                className="text-xs text-red-500 hover:underline disabled:opacity-50"
              >
                {scormUploading ? 'Uploading...' : 'Replace'}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-3">
                Upload a SCORM package to use this course in standalone mode (no sections/lessons needed).
              </p>
              <button
                onClick={() => scormFileRef.current?.click()}
                disabled={scormUploading}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {scormUploading ? 'Uploading...' : 'Upload SCORM Package'}
              </button>
            </div>
          )}
          <input
            ref={scormFileRef}
            type="file"
            accept=".zip"
            onChange={handleScormUpload}
            className="hidden"
          />
        </div>

        {/* Instructor Management */}
        {courseId && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
            <InstructorManager courseId={courseId} />
          </div>
        )}
      </div>
    </div>
  );
}
