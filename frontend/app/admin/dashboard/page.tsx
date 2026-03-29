'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { LineChartCard, BarChartCard } from '@/components/charts';
import { ExportButton } from '@/components/export-button';
import { exportToCsv } from '@/lib/export-csv';
import {
  Users,
  BookOpen,
  GraduationCap,
  Activity,
  Banknote,
  Clock,
} from 'lucide-react';

const MONTH_OPTIONS = [
  { label: '3 months', value: 3 },
  { label: '6 months', value: 6 },
  { label: '12 months', value: 12 },
];

const STAT_CONFIG = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: 'text-gray-900', iconBg: 'bg-gray-100', iconColor: 'text-gray-600' },
  { key: 'totalCourses', label: 'Courses', icon: BookOpen, color: 'text-blue-600', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { key: 'totalEnrollments', label: 'Enrollments', icon: GraduationCap, color: 'text-emerald-600', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { key: 'activeUsers30d', label: 'Active (30d)', icon: Activity, color: 'text-amber-600', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  { key: 'totalRevenue', label: 'Revenue', icon: Banknote, color: 'text-indigo-600', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600', format: (v: number) => `${v.toLocaleString()}₫` },
  { key: 'pendingPayments', label: 'Pending Payments', icon: Clock, color: 'text-red-600', iconBg: 'bg-red-50', iconColor: 'text-red-600' },
] as const;

function StatCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-gray-100 rounded-lg" />
        <div className="h-3 w-16 bg-gray-100 rounded" />
      </div>
      <div className="h-7 w-12 bg-gray-100 rounded" />
    </div>
  );
}

export default function AdminDashboardPage() {
  const [months, setMonths] = useState(12);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.adminReports.dashboard(),
    queryFn: () => reportsApi.adminDashboard(),
  });

  const { data: trends } = useQuery({
    queryKey: queryKeys.adminReports.trends(months),
    queryFn: () => reportsApi.adminTrends(months),
  });

  const { data: topCourses } = useQuery({
    queryKey: queryKeys.adminReports.topCourses(10),
    queryFn: () => reportsApi.adminTopCourses(10),
  });

  const { data: revenue } = useQuery({
    queryKey: queryKeys.adminReports.revenue(months),
    queryFn: () => reportsApi.adminRevenue(months),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {MONTH_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMonths(opt.value)}
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

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statsLoading
          ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats &&
            STAT_CONFIG.map((s) => {
              const Icon = s.icon;
              const raw = (stats as any)[s.key];
              const value = 'format' in s && s.format ? s.format(raw) : raw;
              return (
                <div key={s.key} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 ${s.iconBg} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${s.iconColor}`} />
                    </div>
                    <p className="text-xs text-gray-500 uppercase">{s.label}</p>
                  </div>
                  <p className={`text-2xl font-bold ${s.color}`}>{value}</p>
                </div>
              );
            })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {trends?.userGrowth && (
          <LineChartCard
            title="User Growth"
            description="New registrations per month"
            data={trends.userGrowth}
            xKey="month"
            lines={[{ key: 'count', label: 'Users', color: '#3b82f6' }]}
          />
        )}
        {trends?.enrollmentTrends && (
          <LineChartCard
            title="Enrollment Trends"
            description="New enrollments per month"
            data={trends.enrollmentTrends}
            xKey="month"
            lines={[{ key: 'count', label: 'Enrollments', color: '#10b981' }]}
          />
        )}
      </div>

      {/* Revenue + Top Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {revenue?.monthly && (
          <BarChartCard
            title="Revenue"
            description={`Total: ${revenue.total.toLocaleString()}₫`}
            data={revenue.monthly}
            xKey="month"
            bars={[{ key: 'revenue', label: 'Revenue', color: '#6366f1' }]}
          />
        )}

        {topCourses?.courses && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Top Courses by Enrollment</h3>
              <ExportButton
                onClick={() =>
                  exportToCsv(topCourses.courses as any, {
                    filename: 'top-courses',
                    columns: [
                      { key: 'title', header: 'Title' },
                      { key: 'enrollments', header: 'Enrollments' },
                    ],
                  })
                }
                disabled={topCourses.courses.length === 0}
              />
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 uppercase">
                  <th className="text-left pb-2">Course</th>
                  <th className="text-right pb-2">Enrollments</th>
                </tr>
              </thead>
              <tbody>
                {topCourses.courses.map((c: any, i: number) => (
                  <tr key={c.id} className="border-t border-gray-50">
                    <td className="py-2 text-sm">
                      <span className="text-gray-400 mr-2">{i + 1}.</span>
                      {c.title}
                    </td>
                    <td className="py-2 text-sm text-right font-medium">{c.enrollments}</td>
                  </tr>
                ))}
                {topCourses.courses.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-gray-500 text-sm">
                      No courses yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
