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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAdminDashboard() {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
        const [totalUsers, totalCourses, totalEnrollments, activeUsers30d, revenueResult, pendingPayments] = await Promise.all([
            this.prisma.profile.count(),
            this.prisma.course.count(),
            this.prisma.enrollment.count(),
            this.prisma.profile.count({ where: { lastLoginAt: { gte: thirtyDaysAgo } } }),
            this.prisma.payment.aggregate({ where: { status: 'completed' }, _sum: { amount: true } }),
            this.prisma.payment.count({ where: { status: 'pending' } }),
        ]);
        return {
            totalUsers,
            totalCourses,
            totalEnrollments,
            activeUsers30d,
            totalRevenue: Number(revenueResult._sum.amount || 0),
            pendingPayments,
        };
    }
    async getAdminTrends(months) {
        const since = new Date();
        since.setMonth(since.getMonth() - months);
        const userGrowth = await this.prisma.$queryRaw `
      SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month, COUNT(*)::int AS count
      FROM profiles
      WHERE created_at >= ${since}
      GROUP BY month ORDER BY month
    `;
        const enrollmentTrends = await this.prisma.$queryRaw `
      SELECT to_char(date_trunc('month', enrolled_at), 'YYYY-MM') AS month, COUNT(*)::int AS count
      FROM enrollments
      WHERE enrolled_at >= ${since}
      GROUP BY month ORDER BY month
    `;
        return { userGrowth, enrollmentTrends };
    }
    async getTopCourses(limit) {
        const courses = await this.prisma.course.findMany({
            include: {
                _count: { select: { enrollments: true } },
            },
            orderBy: { enrollments: { _count: 'desc' } },
            take: limit,
        });
        return {
            courses: courses.map(c => ({
                id: c.id,
                title: c.title,
                enrollments: c._count.enrollments,
            })),
        };
    }
    async getRevenueStats(months) {
        const since = new Date();
        since.setMonth(since.getMonth() - months);
        const monthly = await this.prisma.$queryRaw `
      SELECT to_char(date_trunc('month', completed_at), 'YYYY-MM') AS month,
             SUM(amount)::float AS revenue
      FROM payments
      WHERE status = 'completed' AND completed_at >= ${since}
      GROUP BY month ORDER BY month
    `;
        const total = monthly.reduce((s, m) => s + m.revenue, 0);
        return { monthly, total };
    }
    async getInstructorTrends(instructorId, months) {
        const since = new Date();
        since.setMonth(since.getMonth() - months);
        const courseIds = (await this.prisma.course.findMany({
            where: { instructorId },
            select: { id: true },
        })).map(c => c.id);
        if (courseIds.length === 0) {
            return { enrollmentTrends: [], quizAttemptTrends: [] };
        }
        const enrollmentTrends = await this.prisma.$queryRaw `
      SELECT to_char(date_trunc('month', enrolled_at), 'YYYY-MM') AS month, COUNT(*)::int AS count
      FROM enrollments
      WHERE course_id = ANY(${courseIds}::uuid[]) AND enrolled_at >= ${since}
      GROUP BY month ORDER BY month
    `;
        const quizAttemptTrends = await this.prisma.$queryRaw `
      SELECT to_char(date_trunc('month', qa.submitted_at), 'YYYY-MM') AS month,
             COUNT(*)::int AS count,
             ROUND(AVG(qa.percentage)::numeric, 1)::float AS avgscore
      FROM quiz_attempts qa
      JOIN quizzes q ON q.id = qa.quiz_id
      WHERE q.course_id = ANY(${courseIds}::uuid[]) AND qa.status = 'submitted' AND qa.submitted_at >= ${since}
      GROUP BY month ORDER BY month
    `;
        return {
            enrollmentTrends,
            quizAttemptTrends: quizAttemptTrends.map(t => ({ month: t.month, count: t.count, avgScore: t.avgscore })),
        };
    }
    async getInstructorDashboard(instructorId) {
        const courses = await this.prisma.course.findMany({
            where: { instructorId },
            include: {
                _count: { select: { enrollments: true, sections: true } },
            },
        });
        const courseIds = courses.map(c => c.id);
        const quizzes = await this.prisma.quiz.findMany({
            where: { courseId: { in: courseIds } },
            include: {
                _count: { select: { attempts: true } },
            },
        });
        const quizIds = quizzes.map(q => q.id);
        const recentAttempts = await this.prisma.quizAttempt.findMany({
            where: { quizId: { in: quizIds } },
            include: {
                user: true,
                quiz: true,
            },
            orderBy: { submittedAt: 'desc' },
            take: 10,
        });
        const totalEnrollments = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
        const totalAttempts = quizzes.reduce((sum, q) => sum + q._count.attempts, 0);
        const allAttempts = await this.prisma.quizAttempt.findMany({
            where: { quizId: { in: quizIds } },
        });
        const submittedAttempts = allAttempts.filter(a => a.status === 'submitted');
        const passedAttempts = submittedAttempts.filter(a => a.isPassed).length;
        const avgScore = submittedAttempts.length > 0
            ? Math.round(submittedAttempts.reduce((sum, a) => sum + Number(a.percentage || 0), 0) / submittedAttempts.length)
            : 0;
        const passRate = submittedAttempts.length > 0
            ? Math.round((passedAttempts / submittedAttempts.length) * 100)
            : 0;
        const pendingAttempts = await this.prisma.quizAttempt.findMany({
            where: {
                quiz: { course: { instructorId } },
                status: 'submitted',
            },
            include: {
                answers: {
                    where: {
                        question: { type: 'essay' },
                    },
                },
            },
        });
        const pendingGrading = pendingAttempts.filter(a => a.answers.some(ans => ans.scoreEarned === null)).length;
        return {
            stats: {
                totalCourses: courses.length,
                totalEnrollments,
                totalAttempts,
                pendingGrading,
                averageScore: avgScore,
                passRate,
            },
            courses: courses.map(c => ({
                id: c.id,
                title: c.title,
                enrollments: c._count.enrollments,
            })),
            recentAttempts: recentAttempts.map(a => ({
                id: a.id,
                studentName: a.user?.fullName || 'Unknown',
                quizTitle: a.quiz?.title || 'Unknown',
                score: Number(a.percentage || 0),
                status: a.status,
                submittedAt: a.submittedAt,
            })),
        };
    }
    async getCourseReport(courseId, instructorId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (course.instructorId !== instructorId) {
            throw new common_1.ForbiddenException('You can only view reports for your own courses');
        }
        const enrollments = await this.prisma.enrollment.findMany({
            where: { courseId },
            include: {
                user: true,
            },
        });
        const totalLessons = await this.prisma.lesson.count({
            where: { section: { courseId } },
        });
        const lessons = await this.prisma.lesson.findMany({
            where: { section: { courseId } },
            select: { id: true },
        });
        const lessonIds = lessons.map(l => l.id);
        const userIds = enrollments.map(e => e.userId);
        const progress = await this.prisma.lessonProgress.findMany({
            where: {
                userId: { in: userIds },
                lessonId: { in: lessonIds },
                isCompleted: true,
            },
        });
        const completedByUser = progress.reduce((acc, p) => {
            acc[p.userId] = (acc[p.userId] || 0) + 1;
            return acc;
        }, {});
        const completedEnrollments = enrollments.filter(e => totalLessons > 0 && (completedByUser[e.userId] || 0) >= totalLessons).length;
        const completionRate = enrollments.length > 0
            ? Math.round((completedEnrollments / enrollments.length) * 100)
            : 0;
        const quizzes = await this.prisma.quiz.findMany({
            where: { courseId },
            include: {
                _count: { select: { attempts: true } },
            },
        });
        return {
            course: { id: course.id, title: course.title },
            stats: {
                totalEnrollments: enrollments.length,
                completionRate,
                totalLessons,
                totalQuizzes: quizzes.length,
            },
            students: enrollments.map(e => ({
                id: e.user?.id || '',
                name: e.user?.fullName || 'Unknown',
                email: '',
                progress: totalLessons > 0
                    ? Math.round(((completedByUser[e.userId] || 0) / totalLessons) * 100)
                    : 0,
                enrolledAt: e.enrolledAt,
            })),
            quizSummary: quizzes.map(q => ({
                id: q.id,
                title: q.title,
                attempts: q._count.attempts,
            })),
        };
    }
    async getCourseStudents(courseId, instructorId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (course.instructorId !== instructorId) {
            throw new common_1.ForbiddenException('You can only view reports for your own courses');
        }
        const enrollments = await this.prisma.enrollment.findMany({
            where: { courseId },
            include: {
                user: true,
            },
            orderBy: { enrolledAt: 'desc' },
        });
        const totalLessons = await this.prisma.lesson.count({
            where: { section: { courseId } },
        });
        const userIds = enrollments.map(e => e.userId);
        const lessons = await this.prisma.lesson.findMany({
            where: { section: { courseId } },
            select: { id: true },
        });
        const lessonIdList = lessons.map(l => l.id);
        const progress = await this.prisma.lessonProgress.findMany({
            where: {
                userId: { in: userIds },
                lessonId: { in: lessonIdList },
                isCompleted: true,
            },
        });
        const progressByUser = progress.reduce((acc, p) => {
            acc[p.userId] = (acc[p.userId] || 0) + 1;
            return acc;
        }, {});
        return enrollments.map(e => ({
            id: e.user?.id || '',
            fullName: e.user?.fullName || 'Unknown',
            email: '',
            joinedAt: e.user?.createdAt || e.enrolledAt,
            progress: totalLessons > 0
                ? Math.round(((progressByUser[e.userId] || 0) / totalLessons) * 100)
                : 0,
            completedLessons: progressByUser[e.userId] || 0,
            totalLessons,
        }));
    }
    async getQuizReport(quizId, instructorId) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: { course: true },
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (!quiz.course || quiz.course.instructorId !== instructorId) {
            throw new common_1.ForbiddenException('You can only view reports for your own quizzes');
        }
        const attempts = await this.prisma.quizAttempt.findMany({
            where: { quizId },
            include: {
                user: true,
            },
            orderBy: { submittedAt: 'desc' },
        });
        const totalAttempts = attempts.length;
        const passedAttempts = attempts.filter(a => a.isPassed).length;
        const failedAttempts = totalAttempts - passedAttempts;
        const averageScore = totalAttempts > 0
            ? Math.round(attempts.reduce((sum, a) => sum + Number(a.percentage || 0), 0) / totalAttempts)
            : 0;
        const scoreRanges = [
            { range: '0-20', min: 0, max: 20, count: 0 },
            { range: '21-40', min: 21, max: 40, count: 0 },
            { range: '41-60', min: 41, max: 60, count: 0 },
            { range: '61-80', min: 61, max: 80, count: 0 },
            { range: '81-100', min: 81, max: 100, count: 0 },
        ];
        attempts.forEach(a => {
            const pct = Number(a.percentage || 0);
            const range = scoreRanges.find(r => pct >= r.min && pct <= r.max);
            if (range)
                range.count++;
        });
        const avgTimeMinutes = totalAttempts > 0
            ? Math.round(attempts.reduce((sum, a) => {
                if (a.startedAt && a.submittedAt) {
                    return sum + (a.submittedAt.getTime() - a.startedAt.getTime()) / 60000;
                }
                return sum;
            }, 0) / totalAttempts)
            : 0;
        const recentAttempts = attempts.slice(0, 20).map(a => ({
            id: a.id,
            studentName: a.user?.fullName || 'Unknown',
            score: Number(a.percentage || 0),
            isPassed: a.isPassed,
            maxScore: Number(a.maxScore || 0),
            totalScore: Number(a.totalScore || 0),
            submittedAt: a.submittedAt,
        }));
        return {
            quiz: { id: quiz.id, title: quiz.title },
            stats: {
                totalAttempts,
                passedAttempts,
                failedAttempts,
                passRate: totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0,
                averageScore,
                averageTimeMinutes: avgTimeMinutes || null,
            },
            scoreDistribution: scoreRanges.map(r => ({ range: r.range, count: r.count })),
            recentAttempts,
        };
    }
    async getQuizQuestionAnalysis(quizId, instructorId) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: { course: true },
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (!quiz.course || quiz.course.instructorId !== instructorId) {
            throw new common_1.ForbiddenException('You can only view reports for your own quizzes');
        }
        const quizQuestions = await this.prisma.quizQuestion.findMany({
            where: { quizId },
            include: {
                question: {
                    include: { options: true },
                },
            },
        });
        const questionIds = quizQuestions
            .map(qq => qq.questionId)
            .filter((id) => id !== null && id !== undefined);
        if (questionIds.length === 0) {
            return [];
        }
        const answers = await this.prisma.quizAnswer.findMany({
            where: {
                questionId: { in: questionIds },
                attempt: { quizId },
            },
            include: { question: true },
        });
        const analysis = quizQuestions.map(qq => {
            if (!qq.question) {
                return null;
            }
            const questionAnswers = answers.filter(a => a.questionId === qq.questionId);
            const totalAnswers = questionAnswers.length;
            const correctAnswers = questionAnswers.filter(a => a.isCorrect).length;
            const failureRate = totalAnswers > 0
                ? Math.round(((totalAnswers - correctAnswers) / totalAnswers) * 100)
                : 0;
            return {
                questionId: qq.questionId,
                content: qq.question.content,
                type: qq.question.type,
                defaultScore: qq.question.defaultScore,
                totalAnswers,
                correctAnswers,
                failureRate,
            };
        }).filter((item) => item !== null);
        return analysis.sort((a, b) => b.failureRate - a.failureRate);
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map