'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRef } from 'react';
import { sectionsApi, lessonsApi, scormApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { supabase } from '@/lib/supabase';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ─── Types ────────────────────────────────────────────────────────────────────

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
  isPublished: boolean;
  isPreview: boolean;
  durationMins?: number;
  quiz?: Quiz | null;
  flashCards?: any | null;
  scormPackage?: { id: string; version: string; entryPoint: string } | null;
}

interface Section {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  sections: Section[];
}

interface QuizCreateForm {
  title: string;
  timeLimitMinutes: number;
  maxAttempts: number;
  passScore: number;
  shuffleQuestions: boolean;
}

// ─── Fetch course with nested quiz/flashcard data ─────────────────────────────

function mapLesson(dataLesson: any): Lesson {
  return {
    ...dataLesson,
    orderIndex: dataLesson.orderIndex ?? dataLesson.order_index ?? 0,
    isPublished: dataLesson.isPublished ?? dataLesson.is_published ?? false,
    isPreview: dataLesson.isPreview ?? dataLesson.is_preview ?? false,
    durationMins: dataLesson.durationMins ?? dataLesson.duration_mins,
  };
}

function mapSection(dataSection: any): Section {
  return {
    ...dataSection,
    orderIndex: dataSection.orderIndex ?? dataSection.order_index ?? 0,
    lessons: (dataSection.lessons || []).map(mapLesson),
  };
}

async function safeFetchJson(url: string, token?: string) {
  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!res.ok) return null;

    const text = await res.text();
    if (!text) return null;

    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function fetchCourseOutline(courseId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`${API}/courses/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không tải được khóa học');
  const courseData = await res.json();

  let sectionsData = courseData.sections;
  if (!Array.isArray(sectionsData)) {
    sectionsData = await sectionsApi.getByCourse(courseId);
  }

  const course: Course = {
    ...courseData,
    sections: (sectionsData || []).map(mapSection),
  };

  const sectionsWithActivities = await Promise.all(
    (course.sections || []).map(async (section) => {
      const lessonsWithActivities = await Promise.all(
        (section.lessons || []).map(async (lesson) => {
          const [quiz, flashCards, scormPackage] = await Promise.all([
            safeFetchJson(`${API}/lessons/${lesson.id}/quizzes`, token),
            safeFetchJson(`${API}/lessons/${lesson.id}/flash-cards`, token),
            safeFetchJson(`${API}/scorm/package/lesson/${lesson.id}`, token),
          ]);

          return { ...lesson, quiz, flashCards, scormPackage };
        })
      );
      return { ...section, lessons: lessonsWithActivities };
    })
  );

  return { ...course, sections: sectionsWithActivities };
}

function QuizPickerModal({
  lesson,
  courseId,
  onClose,
  onQuizAttached,
}: {
  lesson: Lesson;
  courseId: string;
  onClose: () => void;
  onQuizAttached: (quiz: Quiz) => void;
}) {
  const [mode, setMode] = useState<'create' | 'select'>('create');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [form, setForm] = useState<QuizCreateForm>({
    title: `Quiz: ${lesson.title}`,
    timeLimitMinutes: 30,
    maxAttempts: 3,
    passScore: 70,
    shuffleQuestions: false,
  });

  const { data: quizzes = [], isLoading: isLoadingQuizzes } = useQuery<Quiz[]>({
    queryKey: ['quizzes', 'by-course', courseId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API}/quizzes`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error('Không tải được danh sách quiz');
      return res.json();
    },
    enabled: mode === 'select',
  });

  const selectableQuizzes = quizzes.filter((quiz) => quiz.id !== lesson.quiz?.id);

  const handleCreate = async (e: React.FormEvent) => {
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
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Không tạo được quiz');
      }
      onQuizAttached(await res.json());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Không tạo được quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleClone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizId) return;
    setSaving(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API}/quizzes/${selectedQuizId}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ targetLessonId: lesson.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Không gắn được quiz');
      }

      const quizRes = await fetch(`${API}/lessons/${lesson.id}/quizzes`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const attachedQuiz = quizRes.ok ? await quizRes.json() : null;
      if (attachedQuiz) onQuizAttached(attachedQuiz);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Không gắn được quiz');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Thêm Quiz cho bài học</h2>
          <p className="mt-1 text-sm text-gray-500 truncate">📖 {lesson.title}</p>
        </div>

        <div className="px-6 pt-4">
          <div className="inline-flex rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                mode === 'create' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tạo mới
            </button>
            <button
              type="button"
              onClick={() => setMode('select')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                mode === 'select' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Chọn quiz có sẵn
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          {mode === 'create' ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tên Quiz *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Thời gian</label>
                  <input
                    type="number"
                    min={1}
                    value={form.timeLimitMinutes}
                    onChange={(e) => setForm({ ...form, timeLimitMinutes: +e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Số lần làm</label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxAttempts}
                    onChange={(e) => setForm({ ...form, maxAttempts: +e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Điểm qua</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.passScore}
                    onChange={(e) => setForm({ ...form, passScore: +e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.shuffleQuestions}
                  onChange={(e) => setForm({ ...form, shuffleQuestions: e.target.checked })}
                />
                Trộn câu hỏi ngẫu nhiên
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
                >
                  {saving ? 'Đang tạo...' : 'Tạo quiz'}
                </button>
                <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleClone} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Quiz có sẵn</label>
                <select
                  value={selectedQuizId}
                  onChange={(e) => setSelectedQuizId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-teal-400"
                  required
                >
                  <option value="">-- Chọn quiz --</option>
                  {selectableQuizzes.map((quiz) => (
                    <option key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </option>
                  ))}
                </select>
                {isLoadingQuizzes && <p className="mt-2 text-xs text-gray-500">Đang tải danh sách quiz...</p>}
                {!isLoadingQuizzes && selectableQuizzes.length === 0 && (
                  <p className="mt-2 text-xs text-gray-500">Không có quiz phù hợp để gắn vào bài học này.</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving || !selectedQuizId}
                  className="flex-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
                >
                  {saving ? 'Đang gắn...' : 'Gắn quiz vào bài học'}
                </button>
                <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
                  Hủy
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Add Lesson Inline Form ───────────────────────────────────────────────────

function AddLessonForm({
  sectionId,
  courseId,
  onCreated,
  onCancel,
}: {
  sectionId: string;
  courseId: string;
  onCreated: (lesson: Lesson) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('text');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API}/sections/${sectionId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ title, type, courseId }),
      });
      if (!res.ok) throw new Error('Không tạo được bài học');
      const lesson = await res.json();
      onCreated(lesson);
      setTitle('');
      setType('text');
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit= { handleSubmit } className = "flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg mt-2" >
      <input
        type="text"
  value = { title }
  onChange = {(e) => setTitle(e.target.value)
}
placeholder = "Tên bài học mới..."
autoFocus
className = "flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none"
  />
  <select
        value={ type }
onChange = {(e) => setType(e.target.value)}
className = "px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
  >
  <option value="text" >📄 Text </option>
    < option value = "video" >▶️ Video </option>
      < option value = "pdf" >📑 PDF </option>
        < option value = "scorm" >📦 SCORM </option>
          </select>
          < button
type = "submit"
disabled = { saving || !title.trim()}
className = "px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
  >
  { saving? '...': 'Thêm' }
  </button>
  < button
type = "button"
onClick = { onCancel }
className = "px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
  >
  Hủy
  </button>
  </form>
  );
}

// ─── Rename Section Inline ────────────────────────────────────────────────────

function SectionRenameInput({
  section,
  onSaved,
  onCancel,
}: {
  section: Section;
  onSaved: (title: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(section.title);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || title === section.title) {
      onCancel();
      return;
    }
    setSaving(true);
    try {
      await sectionsApi.update(section.id, { title });
      onSaved(title);
    } catch {
      onCancel();
    } finally {
      setSaving(false);
    }
  };

  return (
    <input
      type= "text"
  value = { title }
  onChange = {(e) => setTitle(e.target.value)
}
onBlur = { handleSave }
onKeyDown = {(e) => {
  if (e.key === 'Enter') handleSave();
  if (e.key === 'Escape') onCancel();
}}
autoFocus
disabled = { saving }
className = "font-bold text-sm tracking-wide uppercase bg-transparent border-b-2 border-teal-400 outline-none px-0 py-0.5 w-full max-w-md"
  />
  );
}

// ─── Lesson Item ──────────────────────────────────────────────────────────────

function LessonItem({
  lesson,
  courseId,
  onDeleted,
  onScormUploaded,
  onQuizAttached,
}: {
  lesson: Lesson;
  courseId: string;
  onDeleted: (lessonId: string) => void;
  onScormUploaded?: (lessonId: string, pkg: any) => void;
  onQuizAttached?: (lessonId: string, quiz: Quiz) => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const scormInputRef = useRef<HTMLInputElement>(null);

  const typeIcon: Record<string, string> = {
    text: '📄',
    video: '▶️',
    pdf: '📑',
    quiz: '📝',
    scorm: '📦',
  };

  const handleDelete = async () => {
    if (!confirm('Xóa bài học này?')) return;
    setDeleting(true);
    try {
      await lessonsApi.delete(lesson.id);
      onDeleted(lesson.id);
    } catch {
      // silent
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className= "flex items-center justify-between py-2.5 px-4 rounded-lg hover:bg-white/60 group transition-colors" >
    <div className="flex items-center gap-3 min-w-0" >
      <span className="text-base shrink-0 opacity-70" > { typeIcon[lesson.type] || '📄' } </span>
        < span className = "text-sm text-gray-800 truncate" > { lesson.title } </span>
  {
    lesson.durationMins && (
      <span className="text-xs text-gray-400 shrink-0" > { lesson.durationMins } phút </span>
        )
  }
  </div>

    < div className = "flex items-center gap-1.5 shrink-0 ml-2" >
      {/* Quiz badge */ }
  {
    lesson.quiz && (
      <span
            className={
      `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${lesson.quiz.isPublished
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-amber-100 text-amber-700'
      }`
    }
    onClick = {() => router.push(`/admin/quizzes/${lesson.quiz!.id}`)
  }
  title = "Mở quiz"
    >
            📝 { lesson.quiz._count?.questions || 0 } Q
    </span>
        )
}

{/* Flash Cards badge */ }
{
  lesson.flashCards && (
    <span
            className={
    `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${lesson.flashCards.is_published
      ? 'bg-purple-100 text-purple-700'
      : 'bg-gray-100 text-gray-600'
    }`
  }
  onClick = {() => router.push(`/admin/flash-cards/${lesson.flashCards.id}`)
}
title = "Quản lý flash cards"
  >
            📇 { lesson.flashCards._count?.cards || lesson.flashCards.cards?.length || 0 }
</span>
        )}

{/* SCORM badge */ }
{
  lesson.type === 'scorm' && lesson.scormPackage && (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700" >
            📦 SCORM { lesson.scormPackage.version }
  </span>
        )
}

{/* Published badge */ }
{
  lesson.isPublished && (
    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-medium" >
      Live
      </span>
        )
}

{/* Hover actions */ }
{
  !lesson.quiz && (
    <button
            onClick={ () => setShowQuizModal(true) }
  className = "hidden group-hover:inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-900 text-white hover:bg-slate-700 transition-colors"
    >
    + Quiz
    </button>
        )
}

{
  !lesson.flashCards && (
    <button
            onClick={ () => router.push(`/admin/flash-cards/create?lessonId=${lesson.id}`) }
  className = "hidden group-hover:inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-purple-600 text-white hover:bg-purple-700 transition-colors"
    >
    + Cards
    </button>
        )
}

{
  lesson.type === 'scorm' && !lesson.scormPackage && (
    <>
    <input ref={ scormInputRef } type = "file" accept = ".zip" className = "hidden" onChange = { async(e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const pkg = await scormApi.uploadLesson(lesson.id, file);
      onScormUploaded?.(lesson.id, pkg);
    } catch { /* silent */ }
    finally { setUploading(false); }
  }
} />
  < button
onClick = {() => scormInputRef.current?.click()}
disabled = { uploading }
className = "hidden group-hover:inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
  >
  { uploading? '...': '+ SCORM' }
  </button>
  </>
        )}

<button
          onClick={ handleDelete }
disabled = { deleting }
className = "hidden group-hover:inline-flex items-center px-1.5 py-0.5 rounded text-xs text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
title = "Xóa bài học"
  >
          ✕
</button>
  </div>
  {showQuizModal && (
    <QuizPickerModal
      lesson={lesson}
      courseId={courseId}
      onClose={() => setShowQuizModal(false)}
      onQuizAttached={(quiz) => onQuizAttached?.(lesson.id, quiz)}
    />
  )}
  </div>
  );
}

// ─── Sortable Lesson Wrapper ─────────────────────────────────────────────────

function SortableLesson({
  lesson,
  courseId,
  onDeleted,
  onScormUploaded,
  onQuizAttached,
}: {
  lesson: Lesson;
  courseId: string;
  onDeleted: (lessonId: string) => void;
  onScormUploaded?: (lessonId: string, pkg: any) => void;
  onQuizAttached?: (lessonId: string, quiz: Quiz) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref= { setNodeRef } style = { style } {...attributes }>
      <div className="flex items-center" >
        {/* Drag handle for lesson */ }
        < button
  {...listeners }
  className = "p-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing mr-1"
  title = "Kéo để di chuyển"
    >
          ⋮⋮
  </button>
    < div className = "flex-1" >
      <LessonItem lesson={ lesson } courseId={ courseId } onDeleted = { onDeleted } onScormUploaded = { onScormUploaded } onQuizAttached = { onQuizAttached } />
        </div>
        </div>
        </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  section,
  index,
  courseId,
  isExpanded,
  onToggle,
  onDeleted,
  onLessonCreated,
  onLessonDeleted,
  onRenamed,
  onScormUploaded,
  onQuizAttached,
}: {
  section: Section;
  index: number;
  courseId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onDeleted: (sectionId: string) => void;
  onLessonCreated: (sectionId: string, lesson: Lesson) => void;
  onLessonDeleted: (sectionId: string, lessonId: string) => void;
  onRenamed: (sectionId: string, title: string) => void;
  onScormUploaded?: (sectionId: string, lessonId: string, pkg: any) => void;
  onQuizAttached?: (sectionId: string, lessonId: string, quiz: Quiz) => void;
}) {
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  const handleDelete = async () => {
    if (!confirm('Xóa section này và tất cả bài học bên trong?')) return;
    setDeleting(true);
    try {
      await sectionsApi.delete(section.id);
      onDeleted(section.id);
    } catch {
      // silent
    } finally {
      setDeleting(false);
    }
  };

  const quizCount = section.lessons.filter((l) => l.quiz).length;
  const moduleNumber = String(index + 1).padStart(2, '0');

  // Sort lessons by orderIndex
  const sortedLessons = [...section.lessons].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div
      ref= { setNodeRef }
  style = { style }
  className = "bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
    {/* Section Header */ }
    < div className = "flex items-center gap-4 px-5 py-4 cursor-pointer select-none group" >
      {/* Drag handle */ }
      < button
  {...attributes }
  {...listeners }
  className = "text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0"
  title = "Kéo để di chuyển"
    >
          ⋮⋮
  </button>

  {/* Module Number */ }
  <span className="text-3xl font-black text-gray-200 leading-none select-none shrink-0 w-10 text-center" >
    { moduleNumber }
    </span>

  {/* Title */ }
  <div className="flex-1 min-w-0" onClick = { onToggle } >
  {
    isRenaming?(
            <div onClick = {(e) => e.stopPropagation()
  } >
    <SectionRenameInput
                section={ section }
  onSaved = {(title) => {
    setIsRenaming(false);
    onRenamed(section.id, title);
  }
}
onCancel = {() => setIsRenaming(false)}
              />
  </div>
          ) : (
  <h3 className= "font-bold text-sm tracking-wide uppercase text-gray-800 truncate" >
  SECTION { moduleNumber }: { section.title }
</h3>
          )}
</div>

{/* Actions */ }
<div className="flex items-center gap-2 shrink-0" >
  <span className="text-xs text-gray-400" >
    { section.lessons.length } bài học
{ quizCount > 0 && <span className="ml-1 text-teal-600" >· { quizCount } quiz </span> }
</span>

{/* Edit title */ }
<button
            onClick={
  (e) => {
    e.stopPropagation();
    setIsRenaming(true);
  }
}
className = "opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
title = "Đổi tên section"
  >
            ✏️
</button>

{/* Delete */ }
<button
            onClick={
  (e) => {
    e.stopPropagation();
    handleDelete();
  }
}
disabled = { deleting }
className = "opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
title = "Xóa section"
  >
            🗑️
</button>

{/* Chevron */ }
<span
            className={
  `text-gray-400 text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
  }`
}
          >
            ▼
</span>
  </div>
  </div>

{/* Lessons List */ }
{
  isExpanded && (
    <div className="border-t border-gray-100" >
      <div className="px-2 py-2" >
        {
          section.lessons.length === 0 ? (
            <p className= "text-xs text-gray-400 py-6 text-center italic" >
            Chưa có bài học nào trong section này
            </ p >
            ) : (
    <SortableContext
                items= { sortedLessons.map((l) => l.id) }
  strategy = { verticalListSortingStrategy }
    >
    <div className="space-y-0.5" >
    {
      sortedLessons.map((lesson) => (
        <SortableLesson
                      key= { lesson.id }
                      lesson = { lesson }
                      courseId = { courseId }
                      onDeleted = {(lessonId) => onLessonDeleted(section.id, lessonId)}
  onScormUploaded = {(lessonId, pkg) => onScormUploaded?.(section.id, lessonId, pkg)
}
  onQuizAttached = {(lessonId, quiz) => onQuizAttached?.(section.id, lessonId, quiz)}
                    />
                  ))}
</div>
  </SortableContext>
            )}
</div>

{/* Action Bar */ }
<div className="flex items-center gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50/50" >
{
  showAddLesson?(
              <div className = "w-full" >
      <AddLessonForm
                  sectionId={ section.id
}
courseId = { courseId }
onCreated = {(lesson) => {
  onLessonCreated(section.id, lesson);
  setShowAddLesson(false);
}}
onCancel = {() => setShowAddLesson(false)}
                />
  </div>
            ) : (
  <>
  <button
                  onClick= {() => setShowAddLesson(true)}
className = "px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors"
  >
  + Thêm bài học
    </button>
    < span className = "text-gray-300" >| </span>
      < button className = "text-xs text-teal-600 hover:text-teal-800 font-medium transition-colors" >
        Upload tài liệu
          </button>
          < button className = "text-xs text-teal-600 hover:text-teal-800 font-medium transition-colors" >
            Import bài học
              </button>
              < button className = "text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors ml-auto flex items-center gap-1" >
                <span className="text-sm" >✨</span> Tạo với AI
                  </button>
                  </>
            )}
</div>
  </div>
      )}
</div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CourseOutlinePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const queryClient = useQueryClient();

  const [sections, setSections] = useState<Section[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch course data
  const { data: course, isLoading } = useQuery<Course>({
    queryKey: [...queryKeys.courses.detail(courseId), 'outline'],
    queryFn: () => fetchCourseOutline(courseId),
    enabled: !!courseId,
  });

  // Sync state when data loads
  useEffect(() => {
    if (course) {
      setSections(course.sections || []);
      setExpandedSections(new Set((course.sections || []).map((s) => s.id)));
    }
  }, [course]);

  // Add section
  const addSectionMutation = useMutation({
    mutationFn: async (title: string) => {
      const result = await sectionsApi.create(courseId, { title });
      return result;
    },
    onSuccess: (section: any) => {
      setSections((prev) => [...prev, { ...section, lessons: [] }]);
      setNewSectionTitle('');
      setExpandedSections((prev) => new Set([...prev, section.id]));
      queryClient.invalidateQueries({ queryKey: [...queryKeys.courses.detail(courseId), 'outline'] });
    },
  });

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    addSectionMutation.mutate(newSectionTitle);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const expandAll = () => setExpandedSections(new Set(sections.map((s) => s.id)));
  const collapseAll = () => setExpandedSections(new Set());

  const handleSectionDeleted = (sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    queryClient.invalidateQueries({ queryKey: [...queryKeys.courses.detail(courseId), 'outline'] });
  };

  const handleLessonCreated = (sectionId: string, lesson: Lesson) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, lessons: [...s.lessons, lesson] } : s
      )
    );
    queryClient.invalidateQueries({ queryKey: [...queryKeys.courses.detail(courseId), 'outline'] });
  };

  const handleLessonDeleted = (sectionId: string, lessonId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) }
          : s
      )
    );
    queryClient.invalidateQueries({ queryKey: [...queryKeys.courses.detail(courseId), 'outline'] });
  };

  const handleSectionRenamed = (sectionId: string, title: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, title } : s))
    );
    queryClient.invalidateQueries({ queryKey: [...queryKeys.courses.detail(courseId), 'outline'] });
  };

  const handleScormUploaded = (sectionId: string, lessonId: string, pkg: any) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.map((l) => l.id === lessonId ? { ...l, scormPackage: pkg } : l) }
          : s
      )
    );
    queryClient.invalidateQueries({ queryKey: [...queryKeys.courses.detail(courseId), 'outline'] });
  };

  const handleQuizAttached = (sectionId: string, lessonId: string, quiz: Quiz) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              lessons: section.lessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, quiz } : lesson
              ),
            }
          : section
      )
    );
    queryClient.invalidateQueries({ queryKey: [...queryKeys.courses.detail(courseId), 'outline'] });
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dragging a section
    const isDraggingSection = sections.some((s) => s.id === activeId);

    if (isDraggingSection) {
      // Reorder sections
      const oldIndex = sections.findIndex((s) => s.id === activeId);
      const newIndex = sections.findIndex((s) => s.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newSections = arrayMove(sections, oldIndex, newIndex);
        setSections(newSections);

        // Call API to persist
        try {
          await sectionsApi.reorder(courseId, newSections.map((s) => s.id));
          queryClient.invalidateQueries({ queryKey: [...queryKeys.courses.detail(courseId), 'outline'] });
        } catch (error) {
          console.error('Failed to reorder sections:', error);
          // Revert on error
          setSections(sections);
        }
      }
    } else {
      // Handle lesson reordering
      // Find which section contains the active and over lessons
      let activeSectionIdx = -1;
      let overSectionIdx = -1;
      let activeLessonIdx = -1;
      let overLessonIdx = -1;

      for (let i = 0; i < sections.length; i++) {
        const lessonIdx = sections[i].lessons.findIndex((l) => l.id === activeId);
        if (lessonIdx !== -1) {
          activeSectionIdx = i;
          activeLessonIdx = lessonIdx;
        }
        const overLessonIndex = sections[i].lessons.findIndex((l) => l.id === overId);
        if (overLessonIndex !== -1) {
          overSectionIdx = i;
          overLessonIdx = overLessonIndex;
        }
      }

      if (activeSectionIdx !== -1 && overSectionIdx !== -1) {
        const newSections = [...sections];

        if (activeSectionIdx === overSectionIdx) {
          // Same section - reorder within section
          const sectionLessons = [...newSections[activeSectionIdx].lessons];
          const reorderedLessons = arrayMove(sectionLessons, activeLessonIdx, overLessonIdx);
          newSections[activeSectionIdx] = {
            ...newSections[activeSectionIdx],
            lessons: reorderedLessons,
          };
          setSections(newSections);

          // Call API
          try {
            await lessonsApi.reorder(
              newSections[activeSectionIdx].id,
              reorderedLessons.map((l) => l.id)
            );
            queryClient.invalidateQueries({ queryKey: [...queryKeys.courses.detail(courseId), 'outline'] });
          } catch (error) {
            console.error('Failed to reorder lessons:', error);
            setSections(sections);
          }
        } else {
          // Different sections - move lesson between sections
          const activeSection = newSections[activeSectionIdx];
          const overSection = newSections[overSectionIdx];
          const [movedLesson] = activeSection.lessons.splice(activeLessonIdx, 1);
          overSection.lessons.splice(overLessonIdx, 0, movedLesson);

          setSections(newSections);

          // Call APIs for both sections
          try {
            await Promise.all([
              lessonsApi.reorder(
                activeSection.id,
                activeSection.lessons.map((l) => l.id)
              ),
              lessonsApi.reorder(
                overSection.id,
                overSection.lessons.map((l) => l.id)
              ),
            ]);
            queryClient.invalidateQueries({ queryKey: [...queryKeys.courses.detail(courseId), 'outline'] });
          } catch (error) {
            console.error('Failed to move lesson:', error);
            setSections(sections);
          }
        }
      }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const totalLessons = sections.reduce((sum, s) => sum + s.lessons.length, 0);
  const totalQuizzes = sections.reduce(
    (sum, s) => sum + s.lessons.filter((l) => l.quiz).length,
    0
  );

  // Memoize section IDs for SortableContext
  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  if (isLoading) {
    return (
      <div className= "flex items-center justify-center min-h-[60vh]" >
      <div className="flex flex-col items-center gap-3" >
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
          <span className="text-sm text-gray-400" > Đang tải course outline...</span>
            </div>
            </div>
    );
  }

  return (
    <div className= "min-h-screen bg-gray-50/80" >
    <div className="max-w-4xl mx-auto px-6 py-8" >
      {/* Breadcrumb / Tab Nav */ }
      < div className = "flex items-center gap-2 text-sm text-gray-400 mb-6" >
        <Link href="/admin/courses" className = "hover:text-gray-600 transition-colors" >
          Khóa học
            </Link>
            <span> / </span>
            < Link
  href = {`/admin/courses/${courseId}`
}
className = "hover:text-gray-600 transition-colors"
  >
  { course?.title || 'Chỉnh sửa'}
</Link>
  <span> / </span>
  < span className = "text-gray-800 font-medium" > Course Outline </span>
    </div>

{/* Header */ }
<div className="flex justify-between items-start mb-8" >
  <div>
  <h1 className="text-2xl font-bold text-gray-900" > Course Outline </h1>
    < p className = "text-sm text-gray-500 mt-1.5 max-w-xl" >
      Thiết kế cấu trúc khóa học, quản lý các module và bài học.Thêm quiz, flashcard và
              tài liệu cho từng bài học.
            </p>
  </div>
  < div className = "flex items-center gap-2" >
    <button
              onClick={ () => router.push(`/courses/${courseId}`) }
className = "inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-white hover:border-gray-300 transition-all"
  >
              👁️ Preview
  </button>
  < Link
href = {`/admin/courses/${courseId}`}
className = "inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold rounded-lg text-sm transition-colors"
  >
              ← Thông tin
  </Link>
  </div>
  </div>

{/* Stats bar */ }
<div className="flex items-center gap-6 mb-6 px-1" >
  <div className="flex items-center gap-4" >
    <span className="text-xs font-medium text-gray-500" >
      <span className="text-lg font-bold text-gray-800" > { sections.length } </span> sections
        </span>
        < span className = "text-gray-200" >| </span>
          < span className = "text-xs font-medium text-gray-500" >
            <span className="text-lg font-bold text-gray-800" > { totalLessons } </span> bài học
              </span>
              < span className = "text-gray-200" >| </span>
                < span className = "text-xs font-medium text-gray-500" >
                  <span className="text-lg font-bold text-teal-600" > { totalQuizzes } </span> quiz
                    </span>
                    </div>
                    < div className = "ml-auto flex gap-2" >
                      <button
              onClick={ expandAll }
className = "text-xs text-gray-400 hover:text-gray-600 transition-colors"
  >
  Mở tất cả
    </button>
    < span className = "text-gray-200" >| </span>
      < button
onClick = { collapseAll }
className = "text-xs text-gray-400 hover:text-gray-600 transition-colors"
  >
  Thu gọn
    </button>
    </div>
    </div>

{/* Sections with DnD */ }
{
  sections.length === 0 ? (
    <div className= "bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center" >
    <div className="text-4xl mb-3" >📚</div>
      < p className = "text-gray-400 mb-1 text-lg font-medium" > Chưa có section nào </p>
        < p className = "text-gray-400 text-sm" >
          Thêm section đầu tiên để bắt đầu thiết kế khóa học
            </p>
            </div>
        ) : (
    <DndContext
            sensors= { sensors }
  collisionDetection = { closestCenter }
  onDragStart = { handleDragStart }
  onDragEnd = { handleDragEnd }
    >
    <SortableContext
              items={ sectionIds }
  strategy = { verticalListSortingStrategy }
    >
    <div className="space-y-4" >
    {
      sections
                  .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((section, idx) => (
          <SectionCard
                      key= { section.id }
                      section = { section }
                      index = { idx }
                      courseId = { courseId }
                      isExpanded = { expandedSections.has(section.id) }
                      onToggle = {() => toggleSection(section.id)}
  onDeleted = { handleSectionDeleted }
  onLessonCreated = { handleLessonCreated }
  onLessonDeleted = { handleLessonDeleted }
  onRenamed = { handleSectionRenamed }
  onScormUploaded = { handleScormUploaded }
  onQuizAttached = { handleQuizAttached }
    />
                  ))
}
</div>
  </SortableContext>
  < DragOverlay dropAnimation = { dropAnimation } >
  {
    activeId?(
                <div className = "bg-white rounded-2xl border-2 border-teal-400 shadow-xl opacity-90" >
        {/* Simplified preview during drag */ }
                  { sections.find((s) => s.id === activeId) && (
      <div className="px-5 py-4">
        <span className="font-bold text-sm">
          SECTION { String(sections.findIndex((s) => s.id === activeId) + 1).padStart(2, '0') }: { ' ' }
{ sections.find((s) => s.id === activeId)?.title }
</span>
  </div>
                  )}
</div>
              ) : null}
</DragOverlay>
  </DndContext>
        )}

{/* Add Section */ }
<div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5" >
  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3" >
    Thêm section mới
      </p>
      < div className = "flex gap-2" >
        <input
              type="text"
value = { newSectionTitle }
onChange = {(e) => setNewSectionTitle(e.target.value)}
onKeyDown = {(e) => e.key === 'Enter' && handleAddSection()}
placeholder = "Tên section mới, ví dụ: Marketing Fundamentals..."
className = "flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none placeholder:text-gray-300"
  />
  <button
              onClick={ handleAddSection }
disabled = { addSectionMutation.isPending || !newSectionTitle.trim() }
className = "px-5 py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
  >
  { addSectionMutation.isPending ? 'Đang thêm...' : '+ Thêm section' }
  </button>
  </div>
  </div>

{/* Bottom spacing */ }
<div className="h-16" />
  </div>
  </div>
  );
}
