type Maybe<T> = T | null | undefined;

type CourseLesson = {
  id: string;
  is_published?: boolean;
  isPublished?: boolean;
  order_index?: number;
  orderIndex?: number;
};

type CourseSection = {
  order_index?: number;
  orderIndex?: number;
  lessons?: CourseLesson[];
};

type LessonProgress = {
  lessonId?: string;
  lesson_id?: string;
  isCompleted?: boolean;
  is_completed?: boolean;
  lastPosition?: number;
  last_position?: number;
  updatedAt?: string;
  updated_at?: string;
};

function getOrder(value: { order_index?: number; orderIndex?: number }) {
  return value.order_index ?? value.orderIndex ?? 0;
}

function isPublishedLesson(lesson: CourseLesson) {
  return Boolean(lesson.is_published ?? lesson.isPublished);
}

function getProgressLessonId(progress: LessonProgress) {
  return progress.lessonId ?? progress.lesson_id ?? '';
}

function getLastPosition(progress: LessonProgress) {
  return progress.lastPosition ?? progress.last_position ?? 0;
}

function isCompleted(progress: LessonProgress) {
  return Boolean(progress.isCompleted ?? progress.is_completed);
}

function getUpdatedAt(progress: LessonProgress) {
  return progress.updatedAt ?? progress.updated_at ?? '';
}

export function getResumeLessonId(
  sections: Maybe<CourseSection[]>,
  progressLessons: Maybe<LessonProgress[]>,
): string | null {
  const orderedLessons = (sections ?? [])
    .slice()
    .sort((a, b) => getOrder(a) - getOrder(b))
    .flatMap((section) =>
      (section.lessons ?? [])
        .filter(isPublishedLesson)
        .slice()
        .sort((a, b) => getOrder(a) - getOrder(b))
    );

  if (orderedLessons.length === 0) return null;

  const progressMap = new Map((progressLessons ?? []).map((item) => [getProgressLessonId(item), item]));

  const inProgressLesson = orderedLessons.find((lesson) => {
    const progress = progressMap.get(lesson.id);
    return progress && !isCompleted(progress) && getLastPosition(progress) > 0;
  });

  if (inProgressLesson) return inProgressLesson.id;

  const firstIncompleteLesson = orderedLessons.find((lesson) => {
    const progress = progressMap.get(lesson.id);
    return !progress || !isCompleted(progress);
  });

  if (firstIncompleteLesson) return firstIncompleteLesson.id;

  const mostRecentlyTouchedCompletedLesson = [...(progressLessons ?? [])]
    .filter((item) => isCompleted(item))
    .sort((a, b) => getUpdatedAt(b).localeCompare(getUpdatedAt(a)))[0];

  const completedLessonId = mostRecentlyTouchedCompletedLesson
    ? getProgressLessonId(mostRecentlyTouchedCompletedLesson)
    : null;

  if (!completedLessonId) return orderedLessons[0].id;

  const completedIndex = orderedLessons.findIndex((lesson) => lesson.id === completedLessonId);
  return orderedLessons[completedIndex + 1]?.id ?? orderedLessons[completedIndex]?.id ?? orderedLessons[0].id;
}
