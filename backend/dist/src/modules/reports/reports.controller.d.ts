import { ReportsService } from './reports.service';
export declare class ReportsController {
    private service;
    constructor(service: ReportsService);
    getAdminDashboard(): Promise<{
        totalUsers: number;
        totalCourses: number;
        totalEnrollments: number;
        activeUsers30d: number;
        totalRevenue: number;
        pendingPayments: number;
    }>;
    getAdminTrends(months?: string): Promise<{
        userGrowth: {
            month: string;
            count: number;
        }[];
        enrollmentTrends: {
            month: string;
            count: number;
        }[];
    }>;
    getTopCourses(limit?: string): Promise<{
        courses: {
            id: string;
            title: string;
            enrollments: number;
        }[];
    }>;
    getRevenueStats(months?: string): Promise<{
        monthly: {
            month: string;
            revenue: number;
        }[];
        total: number;
    }>;
    getInstructorTrends(req: any, months?: string): Promise<{
        enrollmentTrends: {
            month: string;
            count: number;
        }[];
        quizAttemptTrends: {
            month: string;
            count: number;
            avgScore: number;
        }[];
    }>;
    getInstructorDashboard(req: any): Promise<{
        stats: {
            totalCourses: number;
            totalEnrollments: number;
            totalAttempts: number;
            pendingGrading: number;
            averageScore: number;
            passRate: number;
        };
        courses: {
            id: string;
            title: string;
            enrollments: number;
        }[];
        recentAttempts: {
            id: string;
            studentName: string;
            quizTitle: string;
            score: number;
            status: string;
            submittedAt: Date | null;
        }[];
    }>;
    getCourseReport(id: string, req: any): Promise<{
        course: {
            id: string;
            title: string;
        };
        stats: {
            totalEnrollments: number;
            completionRate: number;
            totalLessons: number;
            totalQuizzes: number;
        };
        students: {
            id: string;
            name: string;
            email: string;
            progress: number;
            enrolledAt: Date;
        }[];
        quizSummary: {
            id: string;
            title: string;
            attempts: number;
        }[];
    }>;
    getCourseStudents(id: string, req: any): Promise<{
        id: string;
        fullName: string;
        email: string;
        joinedAt: Date;
        progress: number;
        completedLessons: number;
        totalLessons: number;
    }[]>;
    getQuizReport(id: string, req: any): Promise<{
        quiz: {
            id: string;
            title: string;
        };
        stats: {
            totalAttempts: number;
            passedAttempts: number;
            failedAttempts: number;
            passRate: number;
            averageScore: number;
            averageTimeMinutes: number | null;
        };
        scoreDistribution: {
            range: string;
            count: number;
        }[];
        recentAttempts: {
            id: string;
            studentName: string;
            score: number;
            isPassed: boolean | null;
            maxScore: number;
            totalScore: number;
            submittedAt: Date | null;
        }[];
    }>;
    getQuizQuestionAnalysis(id: string, req: any): Promise<{
        questionId: string | null;
        content: string;
        type: string;
        defaultScore: import("@prisma/client-runtime-utils").Decimal;
        totalAnswers: number;
        correctAnswers: number;
        failureRate: number;
    }[]>;
}
