import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateAssignmentDto, UpdateAssignmentDto, SubmitAssignmentDto, GradeSubmissionDto } from './dto/assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(activityId: string, dto: CreateAssignmentDto, userId: string) {
    // Verify activity exists and user owns it
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      include: { lesson: { include: { course: true } } },
    });

    if (!activity) throw new NotFoundException('Activity not found');
    if (activity.activityType !== 'assignment') {
      throw new BadRequestException('Activity type must be "assignment"');
    }
    if (activity.lesson.course.instructorId !== userId) {
      throw new ForbiddenException('You can only create assignments for your own courses');
    }

    return this.prisma.assignment.create({
      data: {
        activityId,
        instructions: dto.instructions,
        maxScore: dto.maxScore,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        allowLateSubmission: dto.allowLateSubmission ?? false,
        maxFileSize: dto.maxFileSize,
        allowedFileTypes: dto.allowedFileTypes || [],
      },
    });
  }

  async findOne(id: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: {
        activity: { select: { title: true, lessonId: true } },
        _count: { select: { submissions: true } },
      },
    });

    if (!assignment) throw new NotFoundException('Assignment not found');
    return assignment;
  }

  async update(id: string, dto: UpdateAssignmentDto, userId: string) {
    const assignment = await this.getAssignmentWithOwnerCheck(id, userId);

    return this.prisma.assignment.update({
      where: { id },
      data: {
        instructions: dto.instructions,
        maxScore: dto.maxScore,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        allowLateSubmission: dto.allowLateSubmission,
        maxFileSize: dto.maxFileSize,
        allowedFileTypes: dto.allowedFileTypes,
      },
    });
  }

  async submit(assignmentId: string, dto: SubmitAssignmentDto, userId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { activity: { include: { lesson: true } } },
    });

    if (!assignment) throw new NotFoundException('Assignment not found');

    // Check enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: assignment.activity.lesson.courseId } },
    });
    if (!enrollment) {
      throw new ForbiddenException('You must be enrolled to submit assignments');
    }

    // Check due date
    if (assignment.dueDate && new Date() > assignment.dueDate && !assignment.allowLateSubmission) {
      throw new BadRequestException('Submission deadline has passed');
    }

    return this.prisma.assignmentSubmission.upsert({
      where: { assignmentId_userId: { assignmentId, userId } },
      update: {
        fileUrl: dto.fileUrl,
        fileName: dto.fileName,
        comment: dto.comment,
        submittedAt: new Date(),
        score: null,
        feedback: null,
        gradedBy: null,
        gradedAt: null,
      },
      create: {
        assignmentId,
        userId,
        fileUrl: dto.fileUrl,
        fileName: dto.fileName,
        comment: dto.comment,
      },
    });
  }

  async grade(submissionId: string, dto: GradeSubmissionDto, graderId: string) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: { activity: { include: { lesson: { include: { course: true } } } } },
        },
      },
    });

    if (!submission) throw new NotFoundException('Submission not found');

    const course = submission.assignment.activity.lesson.course;
    if (course.instructorId !== graderId) {
      throw new ForbiddenException('Only the course instructor can grade submissions');
    }

    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score: dto.score,
        feedback: dto.feedback,
        gradedBy: graderId,
        gradedAt: new Date(),
      },
    });
  }

  async getSubmissions(assignmentId: string, userId: string) {
    await this.getAssignmentWithOwnerCheck(assignmentId, userId);

    return this.prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        student: { select: { id: true, fullName: true, avatarUrl: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  private async getAssignmentWithOwnerCheck(id: string, userId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: { activity: { include: { lesson: { include: { course: true } } } } },
    });

    if (!assignment) throw new NotFoundException('Assignment not found');
    if (assignment.activity.lesson.course.instructorId !== userId) {
      throw new ForbiddenException('You can only manage your own assignments');
    }

    return assignment;
  }
}
