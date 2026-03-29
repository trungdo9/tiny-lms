'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { userActivityApi } from '@/lib/api';
import { AreaChartCard, ActivityHeatmap } from '@/components/charts';
import { ExportButton } from '@/components/export-button';
import { exportToCsv } from '@/lib/export-csv';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchDashboard() {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${API}/users/me/dashboard`, {
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

async function fetchQuizHistory() {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${API}/users/me/quiz-history`, {
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default function ProgressPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard', 'student'],
    queryFn: fetchDashboard,
  });

  const { data: quizHistory = [] } = useQuery<any[]>({
    queryKey: queryKeys.quizHistory(),
    queryFn: fetchQuizHistory,
  });

  const { data: activity } = useQuery({
    queryKey: queryKeys.activity(6),
    queryFn: () => userActivityApi.getMyActivity(6),
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" /></div>;
  }

  const stats = dashboard?.stats || { totalCourses: 0, completedCourses: 0, totalQuizzes: 0 };
  const courses = dashboard?.enrolledCourses || [];

  // Quiz score trend
  const quizTrend = quizHistory
    .filter((a: any) => a.submittedAt)
    .map((a: any) => ({
      date: new Date(a.submittedAt).toISOString().slice(0, 10),
      score: a.score || 0,
    }))
    .reverse();

  // Avg quiz score
  const avgScore = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((s: number, a: any) => s + (a.score || 0), 0) / quizHistory.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900">My Progress</h1>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-700">← Back to Dashboard</Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Enrolled', value: stats.totalCourses, color: 'text-gray-900' },
            { label: 'Completed', value: stats.completedCourses, color: 'text-emerald-600' },
            { label: 'Avg Quiz Score', value: `${avgScore}%`, color: 'text-blue-600' },
            { label: 'Quizzes Taken', value: stats.totalQuizzes, color: 'text-amber-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Per-Course Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Course Progress</h2>
            <ExportButton
              onClick={() => exportToCsv(courses, { filename: 'my-progress', columns: [{ key: 'courseTitle', header: 'Course' }, { key: 'completedLessons', header: 'Completed' }, { key: 'totalLessons', header: 'Total' }, { key: 'progress', header: 'Progress %' }] })}
              disabled={courses.length === 0}
            />
          </div>
          {courses.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No courses enrolled yet</p>
          ) : (
            <div className="space-y-4">
              {courses.map((c: any) => (
                <div key={c.courseId} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.courseTitle}</p>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap">{c.completedLessons}/{c.totalLessons} ({c.progress}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {quizTrend.length > 0 && (
            <AreaChartCard
              title="Quiz Score Trend"
              description="Your scores over time"
              data={quizTrend}
              xKey="date"
              areas={[{ key: 'score', label: 'Score', color: '#6366f1' }]}
              height={250}
            />
          )}
          {activity?.daily && (
            <ActivityHeatmap data={activity.daily} />
          )}
        </div>
      </div>
    </div>
  );
}
