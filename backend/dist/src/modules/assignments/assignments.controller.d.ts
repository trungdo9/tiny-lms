import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, UpdateAssignmentDto, SubmitAssignmentDto, GradeSubmissionDto } from './dto/assignment.dto';
export declare class AssignmentsController {
    private service;
    constructor(service: AssignmentsService);
    create(activityId: string, dto: CreateAssignmentDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        activityId: string;
        maxScore: import("@prisma/client-runtime-utils").Decimal | null;
        instructions: string;
        dueDate: Date | null;
        allowLateSubmission: boolean;
        maxFileSize: number | null;
        allowedFileTypes: string[];
    }>;
    findOne(id: string): Promise<{
        activity: {
            title: string;
            lessonId: string;
        };
        _count: {
            submissions: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        activityId: string;
        maxScore: import("@prisma/client-runtime-utils").Decimal | null;
        instructions: string;
        dueDate: Date | null;
        allowLateSubmission: boolean;
        maxFileSize: number | null;
        allowedFileTypes: string[];
    }>;
    update(id: string, dto: UpdateAssignmentDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        activityId: string;
        maxScore: import("@prisma/client-runtime-utils").Decimal | null;
        instructions: string;
        dueDate: Date | null;
        allowLateSubmission: boolean;
        maxFileSize: number | null;
        allowedFileTypes: string[];
    }>;
    submit(id: string, dto: SubmitAssignmentDto, req: any): Promise<{
        id: string;
        userId: string;
        submittedAt: Date;
        score: import("@prisma/client-runtime-utils").Decimal | null;
        comment: string | null;
        fileUrl: string;
        fileName: string;
        feedback: string | null;
        assignmentId: string;
        gradedBy: string | null;
        gradedAt: Date | null;
    }>;
    grade(subId: string, dto: GradeSubmissionDto, req: any): Promise<{
        id: string;
        userId: string;
        submittedAt: Date;
        score: import("@prisma/client-runtime-utils").Decimal | null;
        comment: string | null;
        fileUrl: string;
        fileName: string;
        feedback: string | null;
        assignmentId: string;
        gradedBy: string | null;
        gradedAt: Date | null;
    }>;
    getSubmissions(id: string, req: any): Promise<({
        student: {
            id: string;
            fullName: string | null;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        userId: string;
        submittedAt: Date;
        score: import("@prisma/client-runtime-utils").Decimal | null;
        comment: string | null;
        fileUrl: string;
        fileName: string;
        feedback: string | null;
        assignmentId: string;
        gradedBy: string | null;
        gradedAt: Date | null;
    })[]>;
}
