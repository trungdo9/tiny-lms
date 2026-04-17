'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getVideoEmbedUrl, isEmbedProvider } from '@/lib/video-utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { activitiesApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Activity {
  id: string;
  activity_type: 'quiz' | 'flashcard' | 'video' | 'file' | 'assignment';
  title: string;
  is_published: boolean;
  content_url?: string;
  content_type?: string;
  order_index?: number;
  quiz?: {
    id: string;
    _count?: { questions: number };
  };
  flash_card_deck?: {
    id: string;
    _count?: { cards: number };
  };
  assignment?: {
    id: string;
  };
}

interface ActivityListProps {
  lessonId: string;
  activities: Activity[];
  isInstructor?: boolean;
  onStartFlashCards?: () => void;
}

const activityIcons: Record<string, string> = {
  quiz: '📝',
  flashcard: '📇',
  video: '🎬',
  file: '📄',
  assignment: '📋',
};

const activityLabels: Record<string, string> = {
  quiz: 'Quiz',
  flashcard: 'Flash Cards',
  video: 'Video',
  file: 'File',
  assignment: 'Assignment',
};

export function ActivityList({
  lessonId,
  activities,
  isInstructor = false,
  onStartFlashCards,
}: ActivityListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [openVideoId, setOpenVideoId] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const reorderMutation = useMutation({
    mutationFn: (activityIds: string[]) => activitiesApi.reorder(lessonId, activityIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.byLesson(lessonId) });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activities.findIndex((a) => a.id === active.id);
    const newIndex = activities.findIndex((a) => a.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(activities, oldIndex, newIndex).map((a) => a.id);
    reorderMutation.mutate(newOrder);
  };

  const deleteMutation = useMutation({
    mutationFn: (activityId: string) => activitiesApi.delete(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.byLesson(lessonId) });
    },
  });

  const handleDelete = (activityId: string) => {
    if (confirm('Delete this activity?')) {
      deleteMutation.mutate(activityId);
    }
  };

  const handleActivityClick = (activity: Activity) => {
    switch (activity.activity_type) {
      case 'quiz':
        if (activity.quiz?.id) {
          router.push(`/quizzes/${activity.quiz.id}`);
        }
        break;
      case 'flashcard':
        if (onStartFlashCards) {
          onStartFlashCards();
        }
        break;
      case 'video':
        setOpenVideoId((prev) => (prev === activity.id ? null : activity.id));
        break;
      case 'file':
        if (activity.content_url) window.open(activity.content_url, '_blank');
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Activities</h3>
        {isInstructor && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            + Add Activity
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreate && (
        <ActivityCreateForm
          lessonId={lessonId}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* Edit Modal */}
      {editingActivity && (
        <ActivityEditModal
          activity={editingActivity}
          lessonId={lessonId}
          onClose={() => setEditingActivity(null)}
        />
      )}

      {/* Activities List */}
      {activities.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No activities yet.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={activities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {activities.map((activity) => (
                <div key={activity.id}>
                  <SortableActivityItem
                    activity={activity}
                    isInstructor={isInstructor}
                    onEdit={() => setEditingActivity(activity)}
                    onDelete={() => handleDelete(activity.id)}
                    onClick={() => handleActivityClick(activity)}
                    isDeletePending={deleteMutation.isPending}
                    openVideoId={openVideoId}
                  />
                  {!isInstructor && activity.activity_type === 'video' && openVideoId === activity.id && (
                    <ActivityVideoPlayer
                      url={activity.content_url ?? ''}
                      provider={activity.content_type ?? ''}
                    />
                  )}
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

    </div>
  );
}

// Sortable Activity Item
function SortableActivityItem({
  activity,
  isInstructor,
  onEdit,
  onDelete,
  onClick,
  isDeletePending,
  openVideoId,
}: {
  activity: Activity;
  isInstructor: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
  isDeletePending: boolean;
  openVideoId?: string | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 ${
        isDragging ? 'opacity-50 ring-2 ring-blue-400' : ''
      }`}
    >
      {/* Drag Handle */}
      {isInstructor && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 mr-2 text-gray-400 hover:text-gray-600"
          title="Drag to reorder"
        >
          ⠿
        </button>
      )}

      <div className="flex items-center gap-3 flex-1">
        <span className="text-2xl">{activityIcons[activity.activity_type]}</span>
        <div>
          <p className="font-medium">{activity.title}</p>
          <p className="text-sm text-gray-500">
            {activityLabels[activity.activity_type]} • {getActivityInfo(activity)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded text-xs ${
          activity.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {activity.is_published ? 'Published' : 'Draft'}
        </span>

        {isInstructor ? (
          <>
            <button
              onClick={onEdit}
              className="px-2 py-1 text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              disabled={isDeletePending}
              className="px-2 py-1 text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </>
        ) : (
          <button
            onClick={onClick}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            {activity.activity_type === 'quiz' ? 'Start' :
             activity.activity_type === 'flashcard' ? 'Study' :
             activity.activity_type === 'video'
               ? openVideoId === activity.id ? 'Close' : 'Watch'
               : 'View'}
          </button>
        )}
      </div>
    </div>
  );
}

// Get activity info helper (moved outside for reuse)
function getActivityInfo(activity: Activity) {
  switch (activity.activity_type) {
    case 'quiz':
      return `${activity.quiz?._count?.questions || 0} questions`;
    case 'flashcard':
      return `${activity.flash_card_deck?._count?.cards || 0} cards`;
    case 'video':
      return activity.content_type || 'Video';
    case 'file':
      return activity.content_type || 'File';
    case 'assignment':
      return 'Assignment';
    default:
      return '';
  }
}

// Inline video player sub-component (student view only)
function ActivityVideoPlayer({ url, provider }: { url: string; provider: string }) {
  const embedUrl = getVideoEmbedUrl(url, provider);
  if (!embedUrl) return null;

  return (
    <div className="border-[4px] border-black shadow-[8px_8px_0px_0px_#000] bg-black overflow-hidden mt-1">
      <div className="aspect-video w-full">
        {isEmbedProvider(provider) ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <video src={embedUrl} controls className="w-full h-full" />
        )}
      </div>
    </div>
  );
}

// Create Activity Form Component
function ActivityCreateForm({ lessonId, onClose }: { lessonId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [activityType, setActivityType] = useState<'quiz' | 'flashcard' | 'video' | 'file'>('quiz');
  const [title, setTitle] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [contentType, setContentType] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: any) => activitiesApi.create(lessonId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.byLesson(lessonId) });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      activityType,
      title,
      isPublished: false,
      contentUrl: activityType === 'video' || activityType === 'file' ? contentUrl : undefined,
      contentType: activityType === 'video' || activityType === 'file' ? contentType : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow space-y-3 border">
      <h4 className="font-medium">Create Activity</h4>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Type</label>
        <select
          value={activityType}
          onChange={(e) => setActivityType(e.target.value as any)}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="quiz">Quiz</option>
          <option value="flashcard">Flash Cards</option>
          <option value="video">Video</option>
          <option value="file">File</option>
          <option value="assignment">Assignment</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="Activity title"
          required
        />
      </div>

      {(activityType === 'video' || activityType === 'file') && (
        <>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Content URL</label>
            <input
              type="url"
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Content Type</label>
            <input
              type="text"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder={activityType === 'video' ? 'youtube, vimeo' : 'pdf, doc'}
            />
          </div>
        </>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {createMutation.isPending ? 'Creating...' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Edit Activity Modal
function ActivityEditModal({ activity, lessonId, onClose }: { activity: Activity; lessonId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(activity.title);
  const [isPublished, setIsPublished] = useState(activity.is_published);
  const [contentUrl, setContentUrl] = useState(activity.content_url || '');
  const [contentType, setContentType] = useState(activity.content_type || '');

  const updateMutation = useMutation({
    mutationFn: (data: any) => activitiesApi.update(activity.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.byLesson(lessonId) });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      title,
      isPublished,
      contentUrl: activity.activity_type === 'video' || activity.activity_type === 'file' ? contentUrl : undefined,
      contentType: activity.activity_type === 'video' || activity.activity_type === 'file' ? contentType : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Edit Activity</h4>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          {(activity.activity_type === 'video' || activity.activity_type === 'file') && (
            <>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Content URL</label>
                <input
                  type="url"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Content Type</label>
                <input
                  type="text"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder={activity.activity_type === 'video' ? 'youtube, vimeo' : 'pdf, doc'}
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="isPublished" className="text-sm">Published</label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
