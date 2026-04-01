'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/retroui/Button';
import { ThumbnailInput } from './ThumbnailInput';
import { LevelSelector } from './LevelSelector';
import { FreeCourseToggle } from './FreeCourseToggle';
import { CourseTypeSelector } from './CourseTypeSelector';

type Level = 'beginner' | 'intermediate' | 'advanced';
type CourseType = 'blank' | 'clone';

interface CreateCourseFormProps {
  redirectTo: string;
}

export function CreateCourseForm({ redirectTo }: CreateCourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [courseType, setCourseType] = useState<CourseType>('blank');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    level: 'beginner' as Level,
    isFree: true,
  });

  const [sourceCourseId, setSourceCourseId] = useState('');
  const [importQuizMode, setImportQuizMode] = useState<'none' | 'clone_all' | 'import_from_quizzes'>('none');
  const [importFromQuizIds, setImportFromQuizIds] = useState('');

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

      if (courseType === 'clone' && sourceCourseId.trim()) {
        if (importQuizMode === 'import_from_quizzes' && normalizedQuizIds.length === 0) {
          throw new Error('Please enter at least one quiz ID to import questions when cloning a course.');
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
      router.push(redirectTo.replace('${course.id}', course.id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cloneFields = (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Source Course ID</label>
        <input
          type="text"
          value={sourceCourseId}
          onChange={(e) => setSourceCourseId(e.target.value)}
          className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          placeholder="Enter source course UUID"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Import Mode</label>
        <select
          value={importQuizMode}
          onChange={(e) => setImportQuizMode(e.target.value as 'none' | 'clone_all' | 'import_from_quizzes')}
          className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        >
          <option value="none">Do not include quizzes</option>
          <option value="clone_all">Clone all quizzes from source course</option>
          <option value="import_from_quizzes">Import questions from specific quizzes</option>
        </select>
      </div>

      {importQuizMode === 'import_from_quizzes' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quiz IDs to Import Questions</label>
          <textarea
            value={importFromQuizIds}
            onChange={(e) => setImportFromQuizIds(e.target.value)}
            className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            rows={3}
            placeholder="Enter quiz ID, separated by comma or newline"
          />
        </div>
      )}
    </>
  );

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Course</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Enter course description"
            />
          </div>

          <ThumbnailInput
            value={formData.thumbnailUrl}
            onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
          />

          <div className="grid grid-cols-2 gap-6">
            <LevelSelector
              value={formData.level}
              onChange={(level) => setFormData({ ...formData, level })}
            />

            <div className="flex items-center">
              <FreeCourseToggle
                checked={formData.isFree}
                onChange={(isFree) => setFormData({ ...formData, isFree })}
              />
            </div>
          </div>

          <CourseTypeSelector
            value={courseType}
            onChange={setCourseType}
            cloneFields={cloneFields}
          />

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Course'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
