export declare class CreateLessonDto {
    title: string;
    type: string;
    content?: string;
    videoUrl?: string;
    videoProvider?: string;
    pdfUrl?: string;
    durationMins?: number;
    orderIndex?: number;
    isPreview?: boolean;
    isPublished?: boolean;
    prerequisiteLessonId?: string;
    availableAfterDays?: number;
}
export declare class UpdateLessonDto {
    title?: string;
    type?: string;
    content?: string;
    videoUrl?: string;
    videoProvider?: string;
    pdfUrl?: string;
    durationMins?: number;
    orderIndex?: number;
    isPreview?: boolean;
    isPublished?: boolean;
    prerequisiteLessonId?: string;
    availableAfterDays?: number;
}
export declare class ReorderLessonsDto {
    lessonIds: string[];
}
