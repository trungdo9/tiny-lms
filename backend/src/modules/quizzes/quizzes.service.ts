import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CoursesService } from '../courses/courses.service';
import { CreateQuizDto, UpdateQuizDto, AddQuizQuestionDto, CloneQuizDto } from './dto/quiz.dto';
import { Prisma } from '@prisma/client';
import { normalizeOptionalQuestionDifficulty } from '../questions/question-difficulty.util';

@Injectable()
export class QuizzesService {
  constructor(
    private prisma: PrismaService,
    private coursesService: CoursesService,
  ) { }

  // ─── Create ────────────────────────────────────────────────────────────────

  async create(userId: string, lessonId: string, dto: CreateQuizDto, userRole: string = 'student') {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: { select: { id: true } },
        course: { select: { id: true, instructorId: true } },
      },
    });

    if (!lesson) throw new NotFoundException('Lesson not found');
    if (!(await this.coursesService.canManageCourse(lesson.course.id, userId, userRole))) {
      throw new ForbiddenException('You can only create quizzes for courses you are assigned to');
    }

    // Enforce: 1 lesson = 1 quiz max via Activity
    const existingActivity = await this.prisma.activity.findFirst({
      where: { lessonId, activityType: 'quiz' }
    });
    if (existingActivity) {
      throw new ConflictException('This lesson already has a quiz. Clone it instead if needed.');
    }

    return this.prisma.$transaction(async (tx) => {
      const activity = await tx.activity.create({
        data: {
          lessonId,
          activityType: 'quiz',
          title: dto.title,
          isPublished: dto.isPublished ?? false,
        },
      });

      return tx.quiz.create({
        data: {
          title: dto.title,
          description: dto.description,
          courseId: lesson.course.id,
          sectionId: lesson.section.id,
          activityId: activity.id,
          timeLimitMinutes: dto.timeLimitMinutes,
          maxAttempts: dto.maxAttempts,
          passScore: dto.passScore !== undefined ? new Prisma.Decimal(dto.passScore) : undefined,
          showResult: dto.showResult ?? 'immediately',
          showCorrectAnswer: dto.showCorrectAnswer ?? true,
          showExplanation: dto.showExplanation ?? true,
          shuffleQuestions: dto.shuffleQuestions ?? false,
          shuffleAnswers: dto.shuffleAnswers ?? false,
          paginationMode: dto.paginationMode ?? 'all',
          questionsPerPage: dto.questionsPerPage ?? 1,
          allowBackNavigation: dto.allowBackNavigation ?? true,
          isPublished: dto.isPublished ?? false,
          availableFrom: dto.availableFrom,
          availableUntil: dto.availableUntil,
          showLeaderboard: dto.showLeaderboard ?? false,
        },
        include: {
          course: { select: { id: true, title: true } },
          section: { select: { id: true, title: true } },
          _count: { select: { questions: true, attempts: true } },
        },
      });
    });
  }

  // ─── Read ───────────────────────────────────────────────────────────────────

  async findAll(courseId?: string, sectionId?: string) {
    const where: Record<string, unknown> = {};
    if (courseId) where.courseId = courseId;
    if (sectionId) where.sectionId = sectionId;

    return this.prisma.quiz.findMany({
      where,
      include: {
        course: { select: { id: true, title: true } },
        section: { select: { id: true, title: true } },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByLesson(lessonId: string, userId?: string, userRole?: string) {
    const quiz = await this.prisma.quiz.findFirst({
      where: { activity: { lessonId } },
      include: {
        course: { select: { id: true, title: true, instructorId: true } },
        section: { select: { id: true, title: true } },
        activity: { select: { isPublished: true } },
        _count: { select: { attempts: true } },
      },
    });

    if (!quiz) return null;

    // Only instructors can see unpublished quizzes and answer data
    const isInstructor = userRole === 'admin' || quiz.course.instructorId === userId;
    if (!isInstructor && !quiz.activity?.isPublished) return null;

    // For non-instructors, exclude question details from unpublished quizzes
    if (!isInstructor && !quiz.activity?.isPublished) {
      return { ...quiz, questions: [] };
    }

    // Include full question data
    const quizWithQuestions = await this.prisma.quiz.findFirst({
      where: { activity: { lessonId } },
      include: {
        course: { select: { id: true, title: true } },
        section: { select: { id: true, title: true } },
        questions: {
          include: {
            question: { include: { options: { orderBy: { orderIndex: 'asc' } } } },
            bank: { select: { id: true, title: true } },
          },
          orderBy: { orderIndex: 'asc' },
        },
        _count: { select: { attempts: true } },
      },
    });

    return quizWithQuestions;
  }

  async findById(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true } },
        section: { select: { id: true, title: true } },
        questions: {
          include: {
            question: { include: { options: { orderBy: { orderIndex: 'asc' } } } },
            bank: { select: { id: true, title: true } },
          },
          orderBy: { orderIndex: 'asc' },
        },
        _count: { select: { attempts: true } },
      },
    });

    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  // ─── Update ─────────────────────────────────────────────────────────────────

  async update(id: string, userId: string, dto: UpdateQuizDto, userRole: string = 'student') {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { course: { select: { instructorId: true } } },
    });

    if (!quiz) throw new NotFoundException('Quiz not found');
    if (!(await this.coursesService.canManageCourse(quiz.courseId, userId, userRole))) {
      throw new ForbiddenException('You can only update quizzes for courses you are assigned to');
    }

    return this.prisma.quiz.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        timeLimitMinutes: dto.timeLimitMinutes,
        maxAttempts: dto.maxAttempts,
        passScore: dto.passScore !== undefined ? new Prisma.Decimal(dto.passScore) : undefined,
        showResult: dto.showResult,
        showCorrectAnswer: dto.showCorrectAnswer,
        showExplanation: dto.showExplanation,
        shuffleQuestions: dto.shuffleQuestions,
        shuffleAnswers: dto.shuffleAnswers,
        paginationMode: dto.paginationMode,
        questionsPerPage: dto.questionsPerPage,
        allowBackNavigation: dto.allowBackNavigation,
        isPublished: dto.isPublished,
        availableFrom: dto.availableFrom,
        availableUntil: dto.availableUntil,
        showLeaderboard: dto.showLeaderboard,
      },
      include: { _count: { select: { questions: true } } },
    });
  }

  // ─── Delete ─────────────────────────────────────────────────────────────────

  async delete(id: string, userId: string, userRole: string = 'student') {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { course: { select: { instructorId: true } } },
    });

    if (!quiz) throw new NotFoundException('Quiz not found');
    if (!(await this.coursesService.canManageCourse(quiz.courseId, userId, userRole))) {
      throw new ForbiddenException('You can only delete quizzes for courses you are assigned to');
    }

    await this.prisma.quiz.delete({ where: { id } });
    return { success: true };
  }

  // ─── Clone Quiz ─────────────────────────────────────────────────────────────

  async clone(quizId: string, userId: string, dto: CloneQuizDto, userRole: string = 'student') {
    // Load source quiz
    const source = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        activity: { select: { lessonId: true } },
        questions: {
          include: { question: true, bank: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
    if (!source) throw new NotFoundException('Source quiz not found');

    // Validate target lesson
    const targetLesson = await this.prisma.lesson.findUnique({
      where: { id: dto.targetLessonId },
      include: {
        section: { select: { id: true } },
        course: { select: { id: true, instructorId: true } },
      },
    });
    if (!targetLesson) throw new NotFoundException('Target lesson not found');
    if (!(await this.coursesService.canManageCourse(targetLesson.course.id, userId, userRole))) {
      throw new ForbiddenException('You do not have permission to manage the target course');
    }

    // 1 lesson = 1 quiz
    const existingInTarget = await this.prisma.activity.findFirst({
      where: { lessonId: dto.targetLessonId, activityType: 'quiz' },
    });
    if (existingInTarget) {
      throw new ConflictException('Target lesson already has a quiz');
    }

    // Deep clone quiz
    const { id: _id, courseId: _c, sectionId: _s, activityId: _a,
      createdAt: _ca, updatedAt: _ua, activity: _sourceActivity, ...quizData } = source as any;

    return this.prisma.$transaction(async (tx) => {
      const newActivity = await tx.activity.create({
        data: {
          lessonId: dto.targetLessonId,
          activityType: 'quiz',
          title: quizData.title,
          isPublished: false,
        },
      });

      return tx.quiz.create({
        data: {
          ...quizData,
          courseId: targetLesson.course.id,
          sectionId: targetLesson.section.id,
          activityId: newActivity.id,
          isPublished: false, // cloned quiz starts as draft
          questions: {
            create: source.questions.map((qq) => ({
              questionId: qq.questionId,
              bankId: qq.bankId,
              pickCount: qq.pickCount,
              difficultyFilter: normalizeOptionalQuestionDifficulty(qq.difficultyFilter, 'difficultyFilter'),
              tagFilter: qq.tagFilter,
              orderIndex: qq.orderIndex,
              scoreOverride: qq.scoreOverride,
            })),
          },
        },
        include: {
          course: { select: { id: true, title: true } },
          section: { select: { id: true, title: true } },
          _count: { select: { questions: true } },
        },
      });
    });
  }

  // ─── Questions Management ────────────────────────────────────────────────────

  async addQuestion(id: string, userId: string, dto: AddQuizQuestionDto, userRole: string = 'student') {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { course: { select: { instructorId: true } } },
    });

    if (!quiz) throw new NotFoundException('Quiz not found');
    if (!(await this.coursesService.canManageCourse(quiz.courseId, userId, userRole))) {
      throw new ForbiddenException('You can only modify quizzes for courses you are assigned to');
    }
    if (!dto.questionId && !dto.bankId) {
      throw new BadRequestException('Either questionId or bankId must be provided');
    }
    if (dto.bankId && !dto.pickCount) {
      throw new BadRequestException('pickCount is required when using bankId');
    }

    const lastQuestion = await this.prisma.quizQuestion.findFirst({
      where: { quizId: id },
      orderBy: { orderIndex: 'desc' },
    });
    const orderIndex = (lastQuestion?.orderIndex ?? 0) + 1;

    return this.prisma.quizQuestion.create({
      data: {
        quizId: id,
        questionId: dto.questionId,
        bankId: dto.bankId,
        pickCount: dto.pickCount,
        difficultyFilter: normalizeOptionalQuestionDifficulty(dto.difficultyFilter, 'difficultyFilter'),
        tagFilter: dto.tagFilter,
        orderIndex,
        scoreOverride: dto.scoreOverride !== undefined ? new Prisma.Decimal(dto.scoreOverride) : undefined,
      },
      include: {
        question: { select: { id: true, content: true, type: true } },
        bank: { select: { id: true, title: true } },
      },
    });
  }

  async removeQuestion(quizId: string, quizQuestionId: string, userId: string, userRole: string = 'student') {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { course: { select: { id: true } } },
    });

    if (!quiz) throw new NotFoundException('Quiz not found');
    if (!(await this.coursesService.canManageCourse(quiz.courseId, userId, userRole))) {
      throw new ForbiddenException('You can only modify quizzes for courses you are assigned to');
    }

    const quizQuestion = await this.prisma.quizQuestion.findUnique({ where: { id: quizQuestionId } });
    if (!quizQuestion || quizQuestion.quizId !== quizId) {
      throw new NotFoundException('Question not found in this quiz');
    }

    await this.prisma.quizQuestion.delete({ where: { id: quizQuestionId } });
    return { success: true };
  }

  async getQuestions(quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    return this.prisma.quizQuestion.findMany({
      where: { quizId },
      include: {
        question: { include: { options: { orderBy: { orderIndex: 'asc' } } } },
        bank: { select: { id: true, title: true } },
      },
      orderBy: { orderIndex: 'asc' },
    });
  }

  // ─── Leaderboard ─────────────────────────────────────────────────────────────

  async getLeaderboard(id: string, limit: number = 10) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    // Cap limit to prevent DoS
    const safeLimit = Math.min(Math.max(limit, 1), 100);

    const attempts = await this.prisma.quizAttempt.findMany({
      where: { quizId: id, status: 'submitted', totalScore: { not: null } },
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true } },
      },
      orderBy: [{ totalScore: 'desc' }, { timeSpentSecs: 'asc' }],
      take: safeLimit,
    });

    return attempts.map((attempt, index) => ({
      rank: index + 1,
      userId: attempt.user.id,
      userName: attempt.user.fullName || 'Anonymous',
      avatarUrl: attempt.user.avatarUrl,
      score: attempt.totalScore,
      maxScore: attempt.maxScore,
      percentage: attempt.percentage,
      isPassed: attempt.isPassed,
      submittedAt: attempt.submittedAt,
      timeSpentSecs: attempt.timeSpentSecs,
    }));
  }
}
