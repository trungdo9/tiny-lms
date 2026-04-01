"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizzesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const courses_service_1 = require("../courses/courses.service");
const client_1 = require("@prisma/client");
const question_difficulty_util_1 = require("../questions/question-difficulty.util");
let QuizzesService = class QuizzesService {
    prisma;
    coursesService;
    constructor(prisma, coursesService) {
        this.prisma = prisma;
        this.coursesService = coursesService;
    }
    async create(userId, lessonId, dto, userRole = 'student') {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                section: { select: { id: true } },
                course: { select: { id: true, instructorId: true } },
            },
        });
        if (!lesson)
            throw new common_1.NotFoundException('Lesson not found');
        if (!(await this.coursesService.canManageCourse(lesson.course.id, userId, userRole))) {
            throw new common_1.ForbiddenException('You can only create quizzes for courses you are assigned to');
        }
        const existingActivity = await this.prisma.activity.findFirst({
            where: { lessonId, activityType: 'quiz' }
        });
        if (existingActivity) {
            throw new common_1.ConflictException('This lesson already has a quiz. Clone it instead if needed.');
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
                    passScore: dto.passScore !== undefined ? new client_1.Prisma.Decimal(dto.passScore) : undefined,
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
    async findMine(userId, search) {
        const courseInstructors = await this.prisma.courseInstructor.findMany({
            where: { profileId: userId },
            select: { courseId: true },
        });
        const courseIds = courseInstructors.map(ci => ci.courseId);
        const quizzes = await this.prisma.quiz.findMany({
            where: { courseId: { in: courseIds } },
            include: { course: { select: { id: true, title: true } }, _count: { select: { questions: true } } },
            orderBy: { createdAt: 'desc' },
        });
        if (!search)
            return quizzes;
        const kw = search.toLowerCase();
        return quizzes.filter(q => q.title.toLowerCase().includes(kw) || q.course?.title?.toLowerCase().includes(kw));
    }
    async findAll(courseId, sectionId) {
        const where = {};
        if (courseId)
            where.courseId = courseId;
        if (sectionId)
            where.sectionId = sectionId;
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
    async findByLesson(lessonId, userId, userRole) {
        const quiz = await this.prisma.quiz.findFirst({
            where: { activity: { lessonId } },
            include: {
                course: { select: { id: true, title: true, instructorId: true } },
                section: { select: { id: true, title: true } },
                activity: { select: { isPublished: true } },
                _count: { select: { attempts: true } },
            },
        });
        if (!quiz)
            return null;
        const isInstructor = userRole === 'admin' || quiz.course.instructorId === userId;
        if (!isInstructor && !quiz.activity?.isPublished)
            return null;
        if (!isInstructor && !quiz.activity?.isPublished) {
            return { ...quiz, questions: [] };
        }
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
    async findById(id) {
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
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        return quiz;
    }
    async update(id, userId, dto, userRole = 'student') {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
            include: { course: { select: { instructorId: true } } },
        });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        if (!(await this.coursesService.canManageCourse(quiz.courseId, userId, userRole))) {
            throw new common_1.ForbiddenException('You can only update quizzes for courses you are assigned to');
        }
        return this.prisma.quiz.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                timeLimitMinutes: dto.timeLimitMinutes,
                maxAttempts: dto.maxAttempts,
                passScore: dto.passScore !== undefined ? new client_1.Prisma.Decimal(dto.passScore) : undefined,
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
    async delete(id, userId, userRole = 'student') {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
            include: { course: { select: { instructorId: true } } },
        });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        if (!(await this.coursesService.canManageCourse(quiz.courseId, userId, userRole))) {
            throw new common_1.ForbiddenException('You can only delete quizzes for courses you are assigned to');
        }
        await this.prisma.quiz.delete({ where: { id } });
        return { success: true };
    }
    async clone(quizId, userId, dto, userRole = 'student') {
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
        if (!source)
            throw new common_1.NotFoundException('Source quiz not found');
        const targetLesson = await this.prisma.lesson.findUnique({
            where: { id: dto.targetLessonId },
            include: {
                section: { select: { id: true } },
                course: { select: { id: true, instructorId: true } },
            },
        });
        if (!targetLesson)
            throw new common_1.NotFoundException('Target lesson not found');
        if (!(await this.coursesService.canManageCourse(targetLesson.course.id, userId, userRole))) {
            throw new common_1.ForbiddenException('You do not have permission to manage the target course');
        }
        const existingInTarget = await this.prisma.activity.findFirst({
            where: { lessonId: dto.targetLessonId, activityType: 'quiz' },
        });
        if (existingInTarget) {
            throw new common_1.ConflictException('Target lesson already has a quiz');
        }
        const { id: _id, courseId: _c, sectionId: _s, activityId: _a, createdAt: _ca, updatedAt: _ua, activity: _sourceActivity, ...quizData } = source;
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
                    isPublished: false,
                    questions: {
                        create: source.questions.map((qq) => ({
                            questionId: qq.questionId,
                            bankId: qq.bankId,
                            pickCount: qq.pickCount,
                            difficultyFilter: (0, question_difficulty_util_1.normalizeOptionalQuestionDifficulty)(qq.difficultyFilter, 'difficultyFilter'),
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
    async addQuestion(id, userId, dto, userRole = 'student') {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
            include: { course: { select: { instructorId: true } } },
        });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        if (!(await this.coursesService.canManageCourse(quiz.courseId, userId, userRole))) {
            throw new common_1.ForbiddenException('You can only modify quizzes for courses you are assigned to');
        }
        if (!dto.questionId && !dto.bankId) {
            throw new common_1.BadRequestException('Either questionId or bankId must be provided');
        }
        if (dto.bankId && !dto.pickCount) {
            throw new common_1.BadRequestException('pickCount is required when using bankId');
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
                difficultyFilter: (0, question_difficulty_util_1.normalizeOptionalQuestionDifficulty)(dto.difficultyFilter, 'difficultyFilter'),
                tagFilter: dto.tagFilter,
                orderIndex,
                scoreOverride: dto.scoreOverride !== undefined ? new client_1.Prisma.Decimal(dto.scoreOverride) : undefined,
            },
            include: {
                question: { select: { id: true, content: true, type: true } },
                bank: { select: { id: true, title: true } },
            },
        });
    }
    async removeQuestion(quizId, quizQuestionId, userId, userRole = 'student') {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: { course: { select: { id: true } } },
        });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        if (!(await this.coursesService.canManageCourse(quiz.courseId, userId, userRole))) {
            throw new common_1.ForbiddenException('You can only modify quizzes for courses you are assigned to');
        }
        const quizQuestion = await this.prisma.quizQuestion.findUnique({ where: { id: quizQuestionId } });
        if (!quizQuestion || quizQuestion.quizId !== quizId) {
            throw new common_1.NotFoundException('Question not found in this quiz');
        }
        await this.prisma.quizQuestion.delete({ where: { id: quizQuestionId } });
        return { success: true };
    }
    async getQuestions(quizId) {
        const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        return this.prisma.quizQuestion.findMany({
            where: { quizId },
            include: {
                question: { include: { options: { orderBy: { orderIndex: 'asc' } } } },
                bank: { select: { id: true, title: true } },
            },
            orderBy: { orderIndex: 'asc' },
        });
    }
    async getLeaderboard(id, limit = 10) {
        const quiz = await this.prisma.quiz.findUnique({ where: { id } });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
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
};
exports.QuizzesService = QuizzesService;
exports.QuizzesService = QuizzesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        courses_service_1.CoursesService])
], QuizzesService);
//# sourceMappingURL=quizzes.service.js.map