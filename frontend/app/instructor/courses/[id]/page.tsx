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

interface Lesson {
  id: string;
  title: string;
  type: string;
  orderIndex: number;
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
  return {
    ...data,
    thumbnailUrl: data.thumbnailUrl ?? data.thumbnail_url ?? '',
    isFree: data.isFree ?? data.is_free ?? true,
    title: data.title ?? '',
    description: data.description ?? '',
    level: data.level ?? 'beginner',
    status: data.status ?? 'draft',
    sections: (data.sections || []).map(mapSection),
  };
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

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Chỉnh sửa Khóa học</h1>
            <p className="text-sm text-gray-500 mt-1">
              {sections.length} phần · {totalLessons} bài học
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

        {/* Course Outline Link */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Cấu trúc khóa học</h2>
              <p className="text-sm text-gray-500">
                {sections.length} phần · {totalLessons} bài học
              </p>
            </div>
            <Link
              href={`/instructor/courses/${courseId}/outline`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              <span>✏️</span> Chỉnh sửa Outline
            </Link>
          </div>
          {sections.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-2">Preview:</div>
              <div className="space-y-1">
                {sections.slice(0, 3).map((section, idx) => (
                  <div key={section.id} className="text-sm text-gray-700">
                    <span className="font-medium">Phần {idx + 1}:</span> {section.title}
                    <span className="text-gray-400 ml-2">({section.lessons.length} bài)</span>
                  </div>
                ))}
                {sections.length > 3 && (
                  <div className="text-sm text-gray-400">+ {sections.length - 3} phần khác...</div>
                )}
              </div>
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
