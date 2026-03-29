export declare class CreateCourseDto {
    title: string;
    description?: string;
    thumbnailUrl?: string;
    level?: string;
    isFree?: boolean;
    price?: number;
    categoryId?: string;
}
export declare class UpdateCourseDto {
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    level?: string;
    status?: string;
    isFree?: boolean;
    price?: number;
    categoryId?: string;
}
export declare class CourseQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    level?: string;
    isFree?: boolean;
    status?: string;
}
export declare class CloneCourseDto {
    title: string;
    description?: string;
    importQuizMode: 'none' | 'clone_all' | 'import_from_quizzes';
    importFromQuizIds?: string[];
}
export declare class CreateCategoryDto {
    name: string;
    slug?: string;
    parentId?: string;
}
export declare class UpdateCategoryDto {
    name?: string;
    slug?: string;
    parentId?: string;
}
