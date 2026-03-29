export declare class CreateSectionDto {
    title: string;
    orderIndex?: number;
}
export declare class UpdateSectionDto {
    title?: string;
    orderIndex?: number;
}
export declare class ReorderSectionsDto {
    sectionIds: string[];
}
