import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class GradingService {
  constructor(private prisma: PrismaService) {}

  async getPendingGrading(instructorId: string, quizId?: string) {
    // Verify instructor
    const where: any = {
      quiz: {
        isPublished: true,
      },
      status: 'submitted',
    };

    if (quizId) {
      where.quizId = quizId;
    }

    const attempts = await this.prisma.quizAttempt.findMany({
      where,
      include: {
        quiz: { select: { id: true, title: true, courseId: true } },
        user: { select: { id: true, fullName: true } },
        answers: {
          where: {
            question: { type: 'essay' },
          },
          include: {
            question: { select: { id: true, content: true, defaultScore: true } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // Filter to only answers that need grading (scoreEarned is null)
    return attempts.map(attempt => ({
      ...attempt,
      answers: attempt.answers.filter(a => a.scoreEarned === null),
    })).filter(attempt => attempt.answers.length > 0);
  }

  async gradeAnswer(attemptId: string, answerId: string, instructorId: string, data: { score: number; feedback?: string }) {
    // Verify instructor owns the quiz
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: { quiz: { include: { course: true } } },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.quiz.course?.instructorId !== instructorId) {
      throw new ForbiddenException('You can only grade quizzes for your own courses');
    }

    // Get the answer
    const answer = await this.prisma.quizAnswer.findFirst({
      where: { id: answerId, attemptId },
      include: { question: true },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    if (answer.question.type !== 'essay') {
      throw new BadRequestException('This answer does not require manual grading');
    }

    // Check max score
    if (data.score > Number(answer.question.defaultScore)) {
      throw new BadRequestException(`Score cannot exceed ${answer.question.defaultScore}`);
    }

    // Update answer
    const updated = await this.prisma.quizAnswer.update({
      where: { id: answerId },
      data: {
        scoreEarned: data.score,
        isCorrect: data.score >= Number(answer.question.defaultScore) * 0.5,
      },
    });

    // Recalculate attempt total
    await this.recalculateAttempt(attemptId);

    return updated;
  }

  private async recalculateAttempt(attemptId: string) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        attemptQuestions: {
          include: { question: true },
        },
        answers: true,
        quiz: true,
      },
    });

    if (!attempt) return;

    let totalScore = 0;
    let maxScore = 0;

    for (const aq of attempt.attemptQuestions) {
      maxScore += Number(aq.question.defaultScore) || 1;
      const answer = attempt.answers.find((a) => a.questionId === aq.questionId);
      if (answer?.scoreEarned) {
        totalScore += Number(answer.scoreEarned);
      }
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passScore = attempt.quiz?.passScore ? Number(attempt.quiz.passScore) : 0;

    await this.prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        totalScore,
        maxScore,
        percentage,
        isPassed: percentage >= passScore,
      },
    });
  }
}
