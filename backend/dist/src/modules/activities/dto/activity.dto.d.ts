export declare class CreateActivityDto {
    activityType: 'quiz' | 'flashcard' | 'video' | 'file';
    title: string;
    isPublished?: boolean;
    contentUrl?: string;
    contentType?: string;
}
export declare class UpdateActivityDto {
    title?: string;
    isPublished?: boolean;
    contentUrl?: string;
    contentType?: string;
}
export declare class ReorderActivitiesDto {
    activityIds: string[];
}
