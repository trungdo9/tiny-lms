export declare class CreateLearningPathDto {
    title: string;
    description?: string;
    thumbnailUrl?: string;
}
export declare class UpdateLearningPathDto {
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    isPublished?: boolean;
}
export declare class AddCourseToPathDto {
    courseId: string;
    isRequired?: boolean;
}
export declare class ReorderPathCoursesDto {
    courseIds: string[];
}
