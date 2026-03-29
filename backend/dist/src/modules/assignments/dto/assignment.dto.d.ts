export declare class CreateAssignmentDto {
    instructions: string;
    maxScore?: number;
    dueDate?: string;
    allowLateSubmission?: boolean;
    maxFileSize?: number;
    allowedFileTypes?: string[];
}
export declare class UpdateAssignmentDto extends CreateAssignmentDto {
}
export declare class SubmitAssignmentDto {
    fileUrl: string;
    fileName: string;
    comment?: string;
}
export declare class GradeSubmissionDto {
    score: number;
    feedback?: string;
}
