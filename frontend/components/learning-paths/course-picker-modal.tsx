'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningPathsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { supabase } from '@/lib/supabase';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchMyCourses() {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${API}/courses/instructor`, {
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch courses');
  return res.json();
}

interface Props {
  pathId: string;
  existingCourseIds: string[];
  onClose: () => void;
}

export function CoursePickerModal({ pathId, existingCourseIds, onClose }: Props) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: queryKeys.courses.instructor(),
    queryFn: fetchMyCourses,
  });

  const addMutation = useMutation({
    mutationFn: (courseId: string) => learningPathsApi.addCourse(pathId, { courseId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.detail(pathId) });
      onClose();
    },
  });

  const available = courses.filter(
    (c: any) =>
      !existingCourseIds.includes(c.id) &&
      c.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Add Course to Path</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="p-4 border-b">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your courses..."
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
          ) : available.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-8">
              {search ? 'No matching courses' : 'All your courses are already added'}
            </p>
          ) : (
            available.map((course: any) => (
              <button
                key={course.id}
                onClick={() => {
                  setAddingId(course.id);
                  addMutation.mutate(course.id, { onSettled: () => setAddingId(null) });
                }}
                disabled={addingId === course.id}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left border-b last:border-0 disabled:opacity-50"
              >
                {course.thumbnailUrl && (
                  <img src={course.thumbnailUrl} alt="" className="w-12 h-8 object-cover rounded flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{course.title}</p>
                  <p className="text-xs text-gray-400 capitalize">{course.status}</p>
                </div>
                {addingId === course.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 flex-shrink-0" />
                ) : (
                  <span className="text-blue-600 text-sm flex-shrink-0">Add</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
