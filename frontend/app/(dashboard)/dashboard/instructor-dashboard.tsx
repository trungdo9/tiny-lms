'use client';

import Link from 'next/link';
import { LineChartCard, AreaChartCard } from '@/components/charts';
import { ExportButton } from '@/components/export-button';
import { exportToCsv } from '@/lib/export-csv';
import {
  BookOpen,
  ClipboardList,
  Users,
  BarChart3,
  Trophy,
  Clock,
  GraduationCap,
  FileQuestion,
} from 'lucide-react';
import { StatCard, StatCardSkeleton, ListSkeleton, EmptyState } from './dashboard-ui';

const MONTH_OPTIONS = [
  { label: '3 months', value: 3 },
  { label: '6 months', value: 6 },
  { label: '12 months', value: 12 },
];

interface InstructorData {
  stats: {
    totalCourses: number;
    totalEnrollments: number;
    totalAttempts: number;
    pendingGrading: number;
    averageScore: number;
    passRate: number;
  };
  courses: { id: string; title: string; enrollments: number }[];
  recentAttempts: {
    id: string;
    studentName: string;
    quizTitle: string;
    score: number;
    status: string;
  }[];
}

export function InstructorDashboard({
  data,
  isLoading,
  trends,
  months,
  onMonthsChange,
}: {
  data: InstructorData | undefined;
  isLoading: boolean;
  trends: any;
  months: number;
  onMonthsChange: (months: number) => void;
}) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-900">Instructor Dashboard</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {MONTH_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onMonthsChange(opt.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                months === opt.value
                  ? 'bg-white shadow-sm font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-10">
          <StatCard icon={BookOpen} label="Total Courses" value={data.stats.totalCourses} iconBg="bg-blue-50" iconColor="text-blue-600" />
          <StatCard icon={Users} label="Enrollments" value={data.stats.totalEnrollments} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
          <StatCard icon={ClipboardList} label="Attempts" value={data.stats.totalAttempts} iconBg="bg-purple-50" iconColor="text-purple-600" />
          <StatCard icon={Clock} label="Pending" value={data.stats.pendingGrading} iconBg="bg-amber-50" iconColor="text-amber-600" valueColor="text-amber-600" />
          <StatCard icon={BarChart3} label="Avg Score" value={`${data.stats.averageScore}%`} iconBg="bg-cyan-50" iconColor="text-cyan-600" />
          <StatCard icon={Trophy} label="Pass Rate" value={`${data.stats.passRate}%`} iconBg="bg-emerald-50" iconColor="text-emerald-600" valueColor="text-emerald-600" />
        </div>
      ) : null}

      {/* Trend Charts */}
      {trends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {trends.enrollmentTrends?.length > 0 && (
            <LineChartCard
              title="Enrollment Trends"
              description={`Monthly enrollments (${months} months)`}
              data={trends.enrollmentTrends}
              xKey="month"
              lines={[{ key: 'count', label: 'Enrollments', color: '#3b82f6' }]}
              height={250}
            />
          )}
          {trends.quizAttemptTrends?.length > 0 && (
            <AreaChartCard
              title="Quiz Performance"
              description={`Attempts & avg score (${months} months)`}
              data={trends.quizAttemptTrends}
              xKey="month"
              areas={[
                { key: 'count', label: 'Attempts', color: '#f59e0b' },
                { key: 'avgScore', label: 'Avg Score', color: '#10b981' },
              ]}
              height={250}
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Courses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">My Courses</h2>
            <div className="flex items-center gap-2">
              <ExportButton
                onClick={() =>
                  exportToCsv(data?.courses as any[] ?? [], {
                    filename: 'my-courses',
                    columns: [
                      { key: 'title', header: 'Title' },
                      { key: 'enrollments', header: 'Enrollments' },
                    ],
                  })
                }
                disabled={!data?.courses.length}
              />
              <Link href="/instructor/question-banks" className="text-sm font-medium text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors">
                Question Banks
              </Link>
            </div>
          </div>
          {isLoading ? (
            <ListSkeleton />
          ) : data?.courses.length === 0 ? (
            <EmptyState message="No courses yet" />
          ) : (
            <div className="space-y-3">
              {data?.courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/instructor/reports/courses/${course.id}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <p className="font-semibold text-slate-900">{course.title}</p>
                  </div>
                  <span className="text-xs font-medium bg-white text-gray-600 px-2.5 py-1 rounded-md border border-gray-200 shadow-sm">
                    {course.enrollments} enrollments
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Attempts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">Recent Submissions</h2>
            <ExportButton
              onClick={() =>
                exportToCsv(data?.recentAttempts as any[] ?? [], {
                  filename: 'recent-submissions',
                  columns: [
                    { key: 'studentName', header: 'Student' },
                    { key: 'quizTitle', header: 'Quiz' },
                    { key: 'score', header: 'Score (%)' },
                    { key: 'status', header: 'Status' },
                  ],
                })
              }
              disabled={!data?.recentAttempts.length}
            />
          </div>
          {isLoading ? (
            <ListSkeleton />
          ) : data?.recentAttempts.length === 0 ? (
            <EmptyState message="No submissions yet" />
          ) : (
            <div className="space-y-3">
              {data?.recentAttempts.map((attempt) => (
                <div key={attempt.id} className="p-4 rounded-lg bg-gray-50 border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">{attempt.studentName}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{attempt.quizTitle}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm whitespace-nowrap">
                    Score: {attempt.score}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-slate-900 rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/instructor/quizzes/grading" className="px-5 py-2.5 bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Grading Queue
            <span className="bg-amber-400 text-slate-900 px-2 py-0.5 rounded text-xs font-bold">
              {data?.stats.pendingGrading ?? 0}
            </span>
          </Link>
          <Link href="/instructor/question-banks" className="px-5 py-2.5 bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            <FileQuestion className="w-4 h-4" />
            Question Banks
          </Link>
        </div>
      </div>
    </div>
  );
}
