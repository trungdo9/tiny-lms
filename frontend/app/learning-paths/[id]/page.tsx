'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { learningPathsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

function PathProgressBar({ completed, total, percent }: { completed: number; total: number; percent: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{completed}/{total} courses completed</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function LearningPathDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const { data: path, isLoading } = useQuery({
    queryKey: queryKeys.learningPaths.detail(id),
    queryFn: () => learningPathsApi.get(id),
  });

  const { data: progress } = useQuery({
    queryKey: queryKeys.learningPaths.withProgress(id),
    queryFn: () => learningPathsApi.getWithProgress(id),
    enabled: !!profile,
  });

  const enrollMutation = useMutation({
    mutationFn: () => learningPathsApi.enroll(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.withProgress(id) }),
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  if (!path) {
    return <div className="text-center py-20 text-gray-500">Learning path not found.</div>;
  }

  const isEnrolled = !!progress;
  const overallProgress = progress?.overallProgress ?? 0;
  const completedCount = progress?.courses?.filter((c: any) => c.completionPercentage === 100).length ?? 0;
  const totalCount = path.courses?.length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 space-y-6">

        {/* Header */}
        <div className="bg-white rounded-xl border overflow-hidden">
          {path.thumbnailUrl && (
            <div className="h-48 overflow-hidden">
              <img src={path.thumbnailUrl} alt={path.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-1">{path.title}</h1>
            {path.creator && <p className="text-sm text-gray-500 mb-3">by {path.creator.fullName}</p>}
            {path.description && <p className="text-gray-600 mb-4">{path.description}</p>}

            {isEnrolled ? (
              <PathProgressBar completed={completedCount} total={totalCount} percent={overallProgress} />
            ) : (
              <button
                onClick={() => {
                  if (!profile) { router.push('/login'); return; }
                  enrollMutation.mutate();
                }}
                disabled={enrollMutation.isPending}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
              </button>
            )}
          </div>
        </div>

        {/* Completion banner */}
        {overallProgress === 100 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
            <p className="text-green-800 font-semibold text-lg">🎉 You've completed this learning path!</p>
            <Link href="/certificates" className="text-green-700 underline text-sm mt-1 inline-block">View your certificate</Link>
          </div>
        )}

        {/* Course list */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-4">Courses in this path</h2>
          {path.courses?.length === 0 ? (
            <p className="text-gray-400 text-sm">No courses added yet.</p>
          ) : (
            <div className="space-y-3">
              {path.courses?.map((pc: any, index: number) => {
                const courseProgress = progress?.courses?.find((c: any) => c.courseId === pc.courseId);
                const done = courseProgress?.completionPercentage === 100;
                return (
                  <div key={pc.courseId} className="flex items-center gap-4 p-3 rounded-lg border">
                    <span className="text-sm font-mono text-gray-400 w-6 flex-shrink-0">{index + 1}</span>
                    {pc.course?.thumbnailUrl && (
                      <img src={pc.course.thumbnailUrl} alt="" className="w-14 h-10 object-cover rounded flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <Link href={`/courses/${pc.course?.slug}`} className="text-sm font-medium hover:text-blue-600 truncate block">
                        {pc.course?.title}
                      </Link>
                      {isEnrolled && (
                        <p className="text-xs text-gray-400">{courseProgress?.completionPercentage ?? 0}% complete</p>
                      )}
                    </div>
                    {isEnrolled && (
                      <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {done ? '✓ Done' : 'In progress'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
