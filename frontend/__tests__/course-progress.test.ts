import { describe, expect, it } from 'vitest';
import { getResumeLessonId } from '@/lib/course-progress';

describe('getResumeLessonId', () => {
  const sections = [
    {
      order_index: 1,
      lessons: [
        { id: 'l1', is_published: true, order_index: 1 },
        { id: 'l2', is_published: true, order_index: 2 },
      ],
    },
    {
      order_index: 2,
      lessons: [{ id: 'l3', is_published: true, order_index: 1 }],
    },
  ];

  it('returns in-progress lesson when there is saved position', () => {
    expect(
      getResumeLessonId(sections, [
        { lessonId: 'l1', isCompleted: true, lastPosition: 120, updatedAt: '2026-03-20T10:00:00Z' },
        { lessonId: 'l2', isCompleted: false, lastPosition: 45, updatedAt: '2026-03-21T10:00:00Z' },
      ])
    ).toBe('l2');
  });

  it('returns first incomplete lesson when only completions exist', () => {
    expect(
      getResumeLessonId(sections, [
        { lessonId: 'l1', isCompleted: true, lastPosition: 120, updatedAt: '2026-03-20T10:00:00Z' },
      ])
    ).toBe('l2');
  });

  it('returns current lesson when everything is completed', () => {
    expect(
      getResumeLessonId(sections, [
        { lessonId: 'l1', isCompleted: true, lastPosition: 120, updatedAt: '2026-03-20T10:00:00Z' },
        { lessonId: 'l2', isCompleted: true, lastPosition: 100, updatedAt: '2026-03-21T10:00:00Z' },
        { lessonId: 'l3', isCompleted: true, lastPosition: 80, updatedAt: '2026-03-22T10:00:00Z' },
      ])
    ).toBe('l3');
  });

  it('falls back to first published lesson without progress', () => {
    expect(getResumeLessonId(sections, [])).toBe('l1');
  });
});
