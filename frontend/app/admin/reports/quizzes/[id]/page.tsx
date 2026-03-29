'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Clock3, Target, TrendingUp } from 'lucide-react';
import { reportsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { BarChartCard, PieChartCard } from '@/components/charts';

interface QuizReport {
  quiz: { id: string; title: string };
  stats: {
    totalAttempts: number;
    passedAttempts: number;
    failedAttempts: number;
    passRate: number;
    averageScore: number;
    averageTimeMinutes: number | null;
  };
  scoreDistribution: { range: string; count: number }[];
  recentAttempts: {
    id: string;
    studentName: string;
    score: number;
    isPassed: boolean;
    maxScore: number;
    totalScore: number;
    submittedAt: string;
  }[];
}

interface QuestionAnalysis {
  questionId: string;
  content: string;
  type: string;
  totalAnswers: number;
  correctAnswers: number;
  failureRate: number;
}

export default function QuizReportPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
  const [activeTab, setActiveTab] = useState<'overview' | 'attempts' | 'analysis'>('overview');

  const { data, isLoading, error } = useQuery<QuizReport>({
    queryKey: queryKeys.reports.quiz(quizId),
    queryFn: () => reportsApi.getQuizReport(quizId),
    enabled: !!quizId,
  });

  const { data: questionAnalysis = [] } = useQuery<QuestionAnalysis[]>({
    queryKey: ['reports', 'quizzes', quizId, 'question-analysis'],
    queryFn: () => reportsApi.getQuizQuestionAnalysis(quizId),
    enabled: activeTab === 'analysis' && !!quizId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {(error as Error).message}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const passFail = [
    { name: 'Đạt', value: data.stats.passedAttempts, color: '#10b981' },
    { name: 'Trượt', value: data.stats.failedAttempts, color: '#ef4444' },
  ];

  const tabs = [
    { id: 'overview' as const, label: 'Tổng quan' },
    { id: 'attempts' as const, label: 'Lượt tham gia' },
    { id: 'analysis' as const, label: 'Phân tích câu hỏi' },
  ];

  const statCards = [
    {
      label: 'Total Attempts',
      value: data.stats.totalAttempts,
      icon: TrendingUp,
      color: 'text-gray-900',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
    },
    {
      label: 'Pass Rate',
      value: `${data.stats.passRate}%`,
      icon: Target,
      color: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Average Score',
      value: `${data.stats.averageScore}%`,
      icon: CheckCircle2,
      color: 'text-blue-600',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Average Time',
      value: data.stats.averageTimeMinutes ? `${data.stats.averageTimeMinutes}m` : '-',
      icon: Clock3,
      color: 'text-amber-600',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-6 mb-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <p className="text-sm text-gray-500 mb-1">Quiz report</p>
          <h1 className="text-2xl font-bold text-gray-900">{data.quiz.title}</h1>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white shadow-sm font-medium text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;

              return (
                <div key={stat.label} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                    </div>
                    <p className="text-xs text-gray-500 uppercase">{stat.label}</p>
                  </div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BarChartCard
                title="Phân phối điểm số"
                data={data.scoreDistribution}
                xKey="range"
                bars={[{ key: 'count', label: 'Học viên', color: '#2563eb' }]}
                height={300}
              />
            </div>
            <PieChartCard title="Tỷ lệ Đạt / Trượt" data={passFail} height={260} />
          </div>
        </div>
      )}

      {activeTab === 'attempts' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 uppercase bg-gray-50">
                <th className="px-6 py-4">Học viên</th>
                <th className="px-6 py-4">Điểm đạt được</th>
                <th className="px-6 py-4">Kết quả</th>
                <th className="px-6 py-4 text-right">Ngày nộp bài</th>
              </tr>
            </thead>
            <tbody>
              {data.recentAttempts.map((attempt) => (
                <tr key={attempt.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{attempt.studentName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">{attempt.score}%</span>
                    <span className="text-gray-400 ml-2">({attempt.totalScore} / {attempt.maxScore})</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        attempt.isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {attempt.isPassed ? 'Đạt' : 'Trượt'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-500">
                    {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
              {data.recentAttempts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                    Chưa có lượt nộp bài nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 uppercase bg-gray-50">
                <th className="px-6 py-4">Câu hỏi</th>
                <th className="px-6 py-4">Loại</th>
                <th className="px-6 py-4 text-center">Tổng HS</th>
                <th className="px-6 py-4 text-center">Đúng</th>
                <th className="px-6 py-4 text-right">Tỷ lệ sai</th>
              </tr>
            </thead>
            <tbody>
              {questionAnalysis.map((item) => (
                <tr key={item.questionId} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 max-w-md">
                    <div className="text-sm font-medium text-gray-900 truncate">{item.content}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600 uppercase">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">{item.totalAnswers}</td>
                  <td className="px-6 py-4 text-center text-sm font-medium text-emerald-600">{item.correctAnswers}</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.failureRate > 50
                          ? 'bg-red-100 text-red-700'
                          : item.failureRate > 25
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {item.failureRate}%
                    </span>
                  </td>
                </tr>
              ))}
              {questionAnalysis.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                    Chưa có dữ liệu phân tích
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 300ms ease-out forwards;
        }
      `}</style>
    </div>
  );
}
