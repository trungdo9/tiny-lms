'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { queryKeys } from '@/lib/query-keys';
import { learningPathsApi } from '@/lib/api';
import { CoursePickerModal } from '@/components/learning-paths/course-picker-modal';

// ─── Sortable Course Row ───────────────────────────────────────────────────────

function SortableCourseRow({ item, onRemove }: { item: any; onRemove: (courseId: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.courseId });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
      <button {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500 px-1">⠿</button>
      {item.course?.thumbnailUrl && (
        <img src={item.course.thumbnailUrl} alt="" className="w-12 h-8 object-cover rounded flex-shrink-0" />
      )}
      <span className="flex-1 text-sm font-medium truncate">{item.course?.title}</span>
      <button
        onClick={() => onRemove(item.courseId)}
        className="text-red-400 hover:text-red-600 text-sm px-2"
      >
        Remove
      </button>
    </div>
  );
}

// ─── Edit Page ─────────────────────────────────────────────────────────────────

export default function EditLearningPathPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showPicker, setShowPicker] = useState(false);
  const [metaSaving, setMetaSaving] = useState(false);

  const { data: path, isLoading } = useQuery({
    queryKey: queryKeys.learningPaths.detail(id),
    queryFn: () => learningPathsApi.get(id),
  });

  const [meta, setMeta] = useState<{ title: string; description: string; thumbnailUrl: string; isPublished: boolean } | null>(null);
  const form = meta ?? (path ? { title: path.title, description: path.description ?? '', thumbnailUrl: path.thumbnailUrl ?? '', isPublished: path.isPublished } : null);

  const updateMutation = useMutation({
    mutationFn: (data: any) => learningPathsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.detail(id) }),
  });

  const removeMutation = useMutation({
    mutationFn: (courseId: string) => learningPathsApi.removeCourse(id, courseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.detail(id) }),
  });

  const reorderMutation = useMutation({
    mutationFn: (courseIds: string[]) => learningPathsApi.reorderCourses(id, courseIds),
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const courses: any[] = path?.courses ?? [];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = courses.findIndex((c: any) => c.courseId === active.id);
    const newIndex = courses.findIndex((c: any) => c.courseId === over.id);
    const newOrder = arrayMove(courses, oldIndex, newIndex).map((c: any) => c.courseId);
    queryClient.setQueryData(queryKeys.learningPaths.detail(id), (old: any) => ({
      ...old,
      courses: arrayMove(old.courses, oldIndex, newIndex),
    }));
    reorderMutation.mutate(newOrder);
  };

  const handleMetaSave = async () => {
    if (!form) return;
    setMetaSaving(true);
    await updateMutation.mutateAsync({ title: form.title, description: form.description, thumbnailUrl: form.thumbnailUrl, isPublished: form.isPublished });
    setMetaSaving(false);
    setMeta(null);
  };

  if (isLoading || !form) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/instructor/learning-paths')} className="text-gray-400 hover:text-gray-600">←</button>
        <h1 className="text-xl font-bold">Edit Learning Path</h1>
      </div>

      {/* Metadata Card */}
      <div className="bg-white border rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Details</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            value={form.title}
            onChange={e => setMeta(f => ({ ...(f ?? form), title: e.target.value }))}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={e => setMeta(f => ({ ...(f ?? form), description: e.target.value }))}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
          <input
            type="url"
            value={form.thumbnailUrl}
            onChange={e => setMeta(f => ({ ...(f ?? form), thumbnailUrl: e.target.value }))}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Published</label>
          <button
            onClick={() => setMeta(f => ({ ...(f ?? form), isPublished: !(f ?? form).isPublished }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isPublished ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        <button
          onClick={handleMetaSave}
          disabled={metaSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {metaSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Courses Card */}
      <div className="bg-white border rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Courses ({courses.length})</h2>
          <button
            onClick={() => setShowPicker(true)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            + Add Course
          </button>
        </div>

        {courses.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No courses yet. Add courses to build your path.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={courses.map((c: any) => c.courseId)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {courses.map((item: any) => (
                  <SortableCourseRow
                    key={item.courseId}
                    item={item}
                    onRemove={(courseId) => removeMutation.mutate(courseId)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {showPicker && (
        <CoursePickerModal
          pathId={id}
          existingCourseIds={courses.map((c: any) => c.courseId)}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
