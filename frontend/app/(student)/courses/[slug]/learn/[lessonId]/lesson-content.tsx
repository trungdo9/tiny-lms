'use client';

import { RefObject } from 'react';
import { ScormPlayer } from '@/components/scorm/ScormPlayer';
import { ActivityList } from '@/components/activity';
import { FlashCardStudy } from '@/components/flash-card';
import { Button } from '@/components/retroui/Button';
import { Layers, X } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  type: string;
  content: string;
  video_url: string;
  video_provider: string;
  pdf_url: string;
}

function getVideoEmbedUrl(url: string, provider: string) {
  if (!url) return null;
  if (provider === 'youtube') {
    const id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return id ? `https://www.youtube.com/embed/${id[1]}` : null;
  }
  if (provider === 'vimeo') {
    const id = url.match(/vimeo\.com\/(\d+)/);
    return id ? `https://player.vimeo.com/video/${id[1]}` : null;
  }
  return url;
}

interface LessonContentProps {
  lesson: Lesson;
  lessonId: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  onVideoTimeUpdate: () => void;
  onVideoEnded: () => void;
  onComplete: () => void;
  activities: any[] | undefined;
  flashDeck: any;
  showFlashCards: boolean;
  onShowFlashCards: (show: boolean) => void;
}

export function LessonContent({
  lesson,
  lessonId,
  videoRef,
  onVideoTimeUpdate,
  onVideoEnded,
  onComplete,
  activities,
  flashDeck,
  showFlashCards,
  onShowFlashCards,
}: LessonContentProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 md:p-10">
      {lesson.type === 'video' && lesson.video_url && (
        <div className="max-w-5xl mx-auto border-[4px] border-black shadow-[8px_8px_0px_0px_#000] bg-black mb-10 overflow-hidden">
          <div className="aspect-video w-full">
            {lesson.video_provider === 'youtube' || lesson.video_provider === 'vimeo' ? (
              <iframe
                src={getVideoEmbedUrl(lesson.video_url, lesson.video_provider) || ''}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                src={lesson.video_url}
                controls
                onTimeUpdate={onVideoTimeUpdate}
                onEnded={onVideoEnded}
                className="w-full h-full"
              />
            )}
          </div>
        </div>
      )}

      {lesson.type === 'pdf' && lesson.pdf_url && (
        <div className="max-w-5xl mx-auto h-[calc(100vh-250px)] border-[4px] border-black shadow-[8px_8px_0px_0px_#000] mb-10">
          <iframe src={lesson.pdf_url} className="w-full h-full" />
        </div>
      )}

      {lesson.type === 'text' && (
        <div className="max-w-4xl mx-auto p-10 bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] mb-10">
          <div className="prose max-w-none text-black">{lesson.content || 'No content'}</div>
        </div>
      )}

      {lesson.type === 'quiz' && (
        <div className="max-w-3xl mx-auto pb-10">
          <div className="bg-[#ff8a00] border-[4px] border-black rounded-none shadow-[8px_8px_0px_0px_#000] p-10 text-center">
            <h3
              className="text-4xl font-black mb-4 text-black"
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              Quiz Challenge
            </h3>
            <p
              className="text-black font-bold text-lg mb-8"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Test your knowledge to complete this lesson.
            </p>
            <Button
              size="lg"
              className="bg-white text-black border-[3px] border-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-[2px] hover:-translate-x-[2px] transition-all font-black text-xl px-10"
            >
              Start Quiz
            </Button>
          </div>
        </div>
      )}

      {lesson.type === 'scorm' && (
        <div
          className="max-w-5xl mx-auto border-[4px] border-black shadow-[8px_8px_0px_0px_#000] mb-10 overflow-hidden"
          style={{ height: 'calc(100vh - 200px)' }}
        >
          <ScormPlayer lessonId={lessonId} onComplete={onComplete} />
        </div>
      )}

      {/* Activities Section */}
      {activities && activities.length > 0 && (
        <div className="max-w-4xl mx-auto p-8 mb-10 bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000]">
          <h3
            className="text-2xl font-black mb-6 border-b-[3px] border-black pb-4 text-black"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Additional Materials
          </h3>
          <ActivityList lessonId={lessonId} activities={activities} isInstructor={false} />
        </div>
      )}

      {/* Flash Cards Section */}
      {flashDeck &&
        (flashDeck as any).is_published &&
        (flashDeck as any).cards?.length > 0 &&
        !showFlashCards && (
          <div className="max-w-3xl mx-auto pb-10">
            <div className="bg-[#ffdb33] border-[4px] border-black p-10 text-center shadow-[8px_8px_0px_0px_#000]">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Layers className="w-8 h-8 text-black" />
                <h3
                  className="text-3xl font-black text-black"
                  style={{ fontFamily: 'var(--font-archivo-black)' }}
                >
                  Flash Cards Study
                </h3>
              </div>
              <p className="text-black font-bold text-xl mb-8">
                {(flashDeck as any).title} - {(flashDeck as any).cards.length} cards
              </p>
              <Button
                onClick={() => onShowFlashCards(true)}
                size="lg"
                className="bg-black text-[#ffdb33] border-[3px] border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-[2px] hover:-translate-x-[2px] transition-all font-black text-xl px-10"
              >
                Study Now
              </Button>
            </div>
          </div>
        )}

      {showFlashCards && (
        <FlashCardOverlay lessonId={lessonId} onClose={() => onShowFlashCards(false)} />
      )}
    </div>
  );
}

function FlashCardOverlay({ lessonId, onClose }: { lessonId: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-white/95 z-50 overflow-auto border-[8px] border-black flex items-center justify-center">
      <div className="min-h-screen py-12 w-full max-w-5xl">
        <FlashCardStudy lessonId={lessonId} onComplete={onClose} />
      </div>
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_#000] transition-all"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
}
