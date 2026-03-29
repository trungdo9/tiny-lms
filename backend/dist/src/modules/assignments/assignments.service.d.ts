import { PrismaService } from '../../common/prisma.service';
import { CreateAssignmentDto, UpdateAssignmentDto, SubmitAssignmentDto, GradeSubmissionDto } from './dto/assignment.dto';
export declare class AssignmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(activityId: string, dto: CreateAssignmentDto, userId: string): Promise<{
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
    update(id: string, dto: UpdateAssignmentDto, userId: string): Promise<{
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
    submit(assignmentId: string, dto: SubmitAssignmentDto, userId: string): Promise<{
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
    grade(submissionId: string, dto: GradeSubmissionDto, graderId: string): Promise<{
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
    getSubmissions(assignmentId: string, userId: string): Promise<({
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
    private getAssignmentWithOwnerCheck;
}
