'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sourceCourseId, setSourceCourseId] = useState('');
  const [importQuizMode, setImportQuizMode] = useState<'none' | 'clone_all' | 'import_from_quizzes'>('none');
  const [importFromQuizIds, setImportFromQuizIds] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    level: 'beginner',
    isFree: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const normalizedQuizIds = importFromQuizIds
        .split(/[\n,]/)
        .map((id) => id.trim())
        .filter(Boolean);

      let response: Response;

      if (sourceCourseId.trim()) {
        if (importQuizMode === 'import_from_quizzes' && normalizedQuizIds.length === 0) {
          throw new Error('Hãy nhập ít nhất một quiz ID để import câu hỏi khi clone khóa học.');
        }

        response = await fetch(`${apiBase}/courses/${sourceCourseId.trim()}/clone`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            importQuizMode,
            importFromQuizIds: importQuizMode === 'import_from_quizzes' ? normalizedQuizIds : undefined,
          }),
        });
      } else {
        response = await fetch(`${apiBase}/courses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Failed to create course');
      }

      const course = await response.json();
      router.push(`/instructor/courses/${course.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Course</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter course title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Enter course description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail URL
            </label>
            <input
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isFree"
                checked={formData.isFree}
                onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isFree" className="text-sm text-gray-700">
                Free Course
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Clone từ khóa học có sẵn (tùy chọn)</h2>
              <p className="mt-1 text-sm text-slate-600">
                Nếu nhập Source Course ID, form này sẽ dùng endpoint clone course thay vì tạo khóa học trống.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source Course ID</label>
              <input
                type="text"
                value={sourceCourseId}
                onChange={(e) => setSourceCourseId(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                placeholder="UUID của khóa học nguồn"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quiz import mode</label>
              <select
                value={importQuizMode}
                onChange={(e) => setImportQuizMode(e.target.value as 'none' | 'clone_all' | 'import_from_quizzes')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="none">Không mang quiz theo</option>
                <option value="clone_all">Clone toàn bộ quiz từ course nguồn</option>
                <option value="import_from_quizzes">Chỉ import câu hỏi từ các quiz chỉ định</option>
              </select>
            </div>

            {importQuizMode === 'import_from_quizzes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quiz IDs để import câu hỏi</label>
                <textarea
                  value={importFromQuizIds}
                  onChange={(e) => setImportFromQuizIds(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                  rows={3}
                  placeholder="Nhập quiz ID, ngăn cách bằng dấu phẩy hoặc xuống dòng"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
