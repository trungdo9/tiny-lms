'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { activitiesApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Activity {
  id: string;
  activity_type: 'quiz' | 'flashcard' | 'video' | 'file';
  title: string;
  is_published: boolean;
  content_url?: string;
  content_type?: string;
  quiz?: {
    id: string;
    _count?: { questions: number };
  };
  flash_card_deck?: {
    id: string;
    _count?: { cards: number };
  };
}

interface ActivityListProps {
  lessonId: string;
  activities: Activity[];
  isInstructor?: boolean;
}

const activityIcons: Record<string, string> = {
  quiz: '📝',
  flashcard: '📇',
  video: '🎬',
  file: '📄',
};

const activityLabels: Record<string, string> = {
  quiz: 'Quiz',
  flashcard: 'Flash Cards',
  video: 'Video',
  file: 'File',
};

export function ActivityList({ lessonId, activities, isInstructor = false }: ActivityListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

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

  const getActivityInfo = (activity: Activity) => {
    switch (activity.activity_type) {
      case 'quiz':
        return `${activity.quiz?._count?.questions || 0} questions`;
      case 'flashcard':
        return `${activity.flash_card_deck?._count?.cards || 0} cards`;
      case 'video':
        return activity.content_type || 'Video';
      case 'file':
        return activity.content_type || 'File';
      default:
        return '';
    }
  };

  const handleActivityClick = (activity: Activity) => {
    switch (activity.activity_type) {
      case 'quiz':
        router.push(`/quizzes/${activity.quiz?.id}`);
        break;
      case 'flashcard':
        router.push(`/instructor/flash-cards/create?lessonId=${lessonId}`);
        break;
      case 'video':
      case 'file':
        // Open content
        if (activity.content_url) {
          window.open(activity.content_url, '_blank');
        }
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

      {/* Activities List */}
      {activities.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No activities yet.</p>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
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
                      onClick={() => handleActivityClick(activity)}
                      className="px-2 py-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(activity.id)}
                      disabled={deleteMutation.isPending}
                      className="px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleActivityClick(activity)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    {activity.activity_type === 'quiz' ? 'Start' :
                     activity.activity_type === 'flashcard' ? 'Study' : 'View'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
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
