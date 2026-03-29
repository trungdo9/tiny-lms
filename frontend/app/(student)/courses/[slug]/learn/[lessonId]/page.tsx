'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonsApi, progressApi, coursesApi, flashCardsApi, activitiesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/retroui/Button';
import { queryKeys } from '@/lib/query-keys';
import { ArrowLeft, ArrowRight, Menu, CheckCircle2 } from 'lucide-react';
import { LessonPageSkeleton } from './lesson-skeleton';
import { LessonContent } from './lesson-content';
import { LessonSidebar } from './lesson-sidebar';

interface Lesson {
  id: string;
  title: string;
  type: string;
  content: string;
  video_url: string;
  video_provider: string;
  pdf_url: string;
  is_preview: boolean;
  section: { id: string; title: string; course_id: string };
  userProgress?: { is_completed: boolean; last_position: number };
}

interface Course {
  id: string;
  title: string;
  slug: string;
  sections: {
    id: string;
    title: string;
    lessons: { id: string; title: string; type: string; is_published: boolean }[];
  }[];
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFlashCards, setShowFlashCards] = useState(false);

  const slug = params.slug as string;
  const lessonId = params.lessonId as string;
  const videoRef = useRef<HTMLVideoElement>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: lesson, isLoading, error: lessonError } = useQuery<Lesson>({
    queryKey: queryKeys.lessons.forLearning(lessonId),
    queryFn: () => lessonsApi.getForLearning(lessonId) as Promise<Lesson>,
    enabled: !!lessonId,
  });

  const { data: course } = useQuery<Course>({
    queryKey: queryKeys.courses.detailBySlug(slug),
    queryFn: () => coursesApi.get(slug) as Promise<Course>,
    enabled: !!slug,
  });

  const { data: flashDeck } = useQuery({
    queryKey: queryKeys.flashCards.deck(lessonId),
    queryFn: () => flashCardsApi.getDeckByLesson(lessonId),
    enabled: !!lessonId,
  });

  const { data: activities } = useQuery<any[]>({
    queryKey: queryKeys.activities.byLesson(lessonId),
    queryFn: () => activitiesApi.getByLesson(lessonId) as Promise<any[]>,
    enabled: !!lessonId,
  });

  const completeMutation = useMutation({
    mutationFn: () => progressApi.markComplete(lessonId),
    onSuccess: () => {
      queryClient.setQueryData<Lesson>(queryKeys.lessons.forLearning(lessonId), (old) =>
        old ? { ...old, userProgress: { is_completed: true, last_position: old.userProgress?.last_position || 0 } } : old
      );
    },
  });

  useEffect(() => {
    if (lessonError instanceof Error && lessonError.message.includes('enroll')) router.push(`/courses/${slug}`);
  }, [lessonError, router, slug]);

  useEffect(() => {
    if (lesson?.type !== 'video' || !user) return;
    saveIntervalRef.current = setInterval(() => {
      if (videoRef.current) {
        progressApi.savePosition(lessonId, Math.floor(videoRef.current.currentTime)).catch(() => {});
      }
    }, 10000);
    return () => { if (saveIntervalRef.current) clearInterval(saveIntervalRef.current); };
  }, [lesson?.type, user, lessonId]);

  if (isLoading || authLoading) return <LessonPageSkeleton />;

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-black font-black text-2xl" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Lesson not found</p>
      </div>
    );
  }

  const allLessons = course?.sections.flatMap((s) => s.lessons.filter((l) => l.is_published)) || [];
  const idx = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = idx > 0 ? allLessons[idx - 1] : null;
  const nextLesson = idx >= 0 && idx < allLessons.length - 1 ? allLessons[idx + 1] : null;

  return (
    <div className="min-h-screen bg-gray-50 flex font-medium" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
      <LessonSidebar slug={slug} lessonId={lessonId} course={course} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="bg-[#ffdb33] border-b-[4px] border-black p-4 px-8 flex items-center justify-between z-0">
          <div className="flex items-center gap-6">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="text-black hover:scale-110 transition-transform">
                <Menu className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-black font-black text-2xl truncate max-w-2xl" style={{ fontFamily: 'var(--font-archivo-black)' }}>
              {lesson.title}
            </h1>
          </div>
          {lesson.userProgress?.is_completed && (
            <span className="bg-green-400 text-black border-2 border-black px-3 py-1 font-black text-sm shadow-[2px_2px_0px_0px_#000] flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> COMPLETED
            </span>
          )}
        </div>

        <LessonContent
          lesson={lesson}
          lessonId={lessonId}
          videoRef={videoRef}
          onVideoTimeUpdate={() => {}}
          onVideoEnded={() => completeMutation.mutate()}
          onComplete={() => completeMutation.mutate()}
          activities={activities}
          flashDeck={flashDeck}
          showFlashCards={showFlashCards}
          onShowFlashCards={setShowFlashCards}
        />

        {/* Footer Navigation */}
        <div className="bg-white border-t-[4px] border-black p-4 md:p-6 px-8 flex items-center justify-between z-0">
          <div>
            {prevLesson && (
              <Link href={`/courses/${slug}/learn/${prevLesson.id}`} className="text-black font-bold flex items-center gap-2 hover:underline decoration-2 underline-offset-4">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Previous:</span>
                <span className="truncate max-w-[150px] sm:max-w-xs">{prevLesson.title}</span>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            {!lesson.userProgress?.is_completed && (
              <Button
                onClick={() => { if (user && lessonId) completeMutation.mutate(); }}
                disabled={completeMutation.isPending}
                className="bg-white text-black border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-[2px] hover:-translate-x-[2px] transition-all font-black px-6 disabled:opacity-50 disabled:translate-y-0 disabled:translate-x-0 disabled:shadow-none"
              >
                {completeMutation.isPending ? 'Saving...' : 'Mark Complete'}
              </Button>
            )}
            {nextLesson && (
              <Button asChild className="bg-[#ffdb33] text-black border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#ffd000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-[2px] hover:-translate-x-[2px] transition-all font-black px-6">
                <Link href={`/courses/${slug}/learn/${nextLesson.id}`}>
                  <span className="hidden sm:inline mr-2">Next:</span>
                  <span className="truncate max-w-[100px] sm:max-w-[200px]">{nextLesson.title}</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
