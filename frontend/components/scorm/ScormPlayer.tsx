'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { scormApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { createScorm12Api, createScorm2004Api } from './ScormApiShim';
import type { ScormHandlers } from './ScormApiShim';

interface ScormPlayerProps {
  lessonId?: string;
  packageId?: string;
  onComplete?: () => void;
}

export function ScormPlayer({ lessonId, packageId: directPackageId, onComplete }: ScormPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pendingBuffer = useRef<Record<string, string>>({});
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptIdRef = useRef<string | null>(null);
  const cmiStore = useRef<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const finishedRef = useRef(false);

  // Fetch package info (only when using lessonId mode)
  const { data: packageInfo } = useQuery({
    queryKey: queryKeys.scorm.package(lessonId || ''),
    queryFn: () => scormApi.getPackageByLesson(lessonId!),
    enabled: !!lessonId && !directPackageId,
  });

  const resolvedPackageId = directPackageId || packageInfo?.id;

  const flush = useCallback(async () => {
    if (!attemptIdRef.current) return;
    const values = { ...pendingBuffer.current };
    if (Object.keys(values).length === 0) return;
    pendingBuffer.current = {};
    try {
      await scormApi.updateAttempt(attemptIdRef.current, values);
    } catch (err) {
      console.error('SCORM flush failed:', err);
    }
  }, []);

  const enqueueFlush = useCallback(() => {
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(flush, 2000);
  }, [flush]);

  // Init attempt and inject API shim
  useEffect(() => {
    if (!resolvedPackageId) return;

    let cancelled = false;

    async function init() {
      try {
        const result = await scormApi.initAttempt(resolvedPackageId!, lessonId);
        if (cancelled) return;

        attemptIdRef.current = result.attemptId;
        cmiStore.current = { ...result.cmiData };

        const handlers: ScormHandlers = {
          getValue: (key: string) => cmiStore.current[key] ?? '',
          setValue: (key: string, value: string) => {
            cmiStore.current[key] = value;
            pendingBuffer.current[key] = value;
            enqueueFlush();
            return 'true';
          },
          commit: () => {
            flush();
            return 'true';
          },
          finish: () => {
            if (finishedRef.current) return 'true';
            finishedRef.current = true;
            flush().then(async () => {
              if (attemptIdRef.current) {
                await scormApi.finishAttempt(attemptIdRef.current);
                onComplete?.();
              }
            });
            return 'true';
          },
        };

        const shim12 = createScorm12Api(handlers);
        const shim2004 = createScorm2004Api(handlers);

        // Inject API on iframe's contentWindow before setting src
        const iframe = iframeRef.current;
        if (iframe) {
          // Set a blank page first to get contentWindow access
          iframe.src = 'about:blank';
          await new Promise<void>((resolve) => {
            iframe.onload = () => resolve();
          });

          const contentWindow = iframe.contentWindow as any;
          if (contentWindow) {
            contentWindow.API = shim12;
            contentWindow.API_1484_11 = shim2004;
          }

          // Also set on parent window as fallback
          (window as any).API = shim12;
          (window as any).API_1484_11 = shim2004;

          // Now load the actual SCORM content
          iframe.src = `/scorm/content/${result.packageId}/${result.entryPoint}`;
        }

        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to initialize SCORM');
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      if (flushTimer.current) clearTimeout(flushTimer.current);
      // Cleanup global API
      delete (window as any).API;
      delete (window as any).API_1484_11;
    };
  }, [resolvedPackageId, lessonId, flush, enqueueFlush, onComplete]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
        </div>
      )}
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title="SCORM Content"
      />
    </div>
  );
}
