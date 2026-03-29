'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { BarChartCard, PieChartCard } from '@/components/charts';

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Main Component ──────────────────────────────────────────────────────────

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
      <div className= "flex items-center justify-center p-12" >
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
        </div>
    );
  }

  if (error) {
    return (
      <div className= "p-8 text-center bg-red-50 border-2 border-red-900 mx-8 mt-8 capitalize font-black text-red-900" >
      {(error as Error).message
  }
  </div>
    );
}

if (!data) return null;

const passFail = [
  { name: 'Đạt', value: data.stats.passedAttempts, color: '#10b981' },
  { name: 'Trượt', value: data.stats.failedAttempts, color: '#ef4444' },
];

const TABS = [
  { id: 'overview' as const, label: 'Tổng quan' },
  { id: 'attempts' as const, label: 'Lượt tham gia' },
  { id: 'analysis' as const, label: 'Phân tích câu hỏi' },
];

return (
  <div className= "p-8" >
  <div className="max-w-6xl mx-auto" >
    {/* Header */ }
    < div className = "mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4" >
      <div>
      <div className="flex items-center gap-2 mb-2 leading-none" >
        <button
                onClick={ () => router.back() }
className = "text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
  >
                ← Quay lại
  </button>
  < span className = "text-slate-200" >| </span>
    < span className = "text-[10px] font-black uppercase tracking-widest text-slate-400" >
      Báo cáo bài thi
        </span>
        </div>
        < h1 className = "text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none" >
          { data.quiz.title }
          </h1>
          </div>

{/* Tabs */ }
<div className="flex gap-2" >
{
  TABS.map((tab) => (
    <button
                key= { tab.id }
                onClick = {() => setActiveTab(tab.id)}
className = {`relative px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'scale-95' : 'hover:-translate-y-0.5'
  }`}
              >
  <div className={
    `absolute inset-0 border-2 border-slate-900 translate-x-0.5 translate-y-0.5 ${activeTab === tab.id ? 'bg-slate-900' : 'bg-white'
    }`
} />
  < div className = {`relative px-1 ${activeTab === tab.id ? 'text-white' : 'text-slate-900'
    }`}>
      { tab.label }
      </div>
      </button>
            ))}
</div>
  </div>

{/* ─── Overview Tab ─────────────────────────────────────────── */ }
{
  activeTab === 'overview' && (
    <div className="space-y-8 animate-fadeIn" >
      {/* Stats */ }
      < div className = "grid grid-cols-2 lg:grid-cols-4 gap-4" >
      {
        [
        { label: 'Tổng lượt thi', value: data.stats.totalAttempts, icon: '🔥' },
        { label: 'Tỷ lệ đạt', value: `${data.stats.passRate}%`, icon: '🎯', cls: 'text-emerald-500' },
        { label: 'Điểm trung bình', value: `${data.stats.averageScore}%`, icon: '📊' },
        { label: 'Thời gian TB', value: data.stats.averageTimeMinutes ? `${data.stats.averageTimeMinutes}m` : '-', icon: '⏱️' },
              ].map((stat, idx) => (
          <div key= { idx } className = "relative group" >
          <div className="absolute inset-0 bg-slate-900 translate-x-1 translate-y-1" />
        <div className="relative bg-white border-2 border-slate-900 p-5" >
        <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter mb-1" > { stat.label } </p>
        < div className = {`text-2xl font-black ${stat.cls || 'text-slate-900'}`} >
        { stat.value }
        </div>
        </div>
        </div>
              ))
}
</div>

{/* Charts */ }
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8" >
  <div className="lg:col-span-2 relative" >
    <div className="absolute inset-0 bg-slate-900 translate-x-2 translate-y-2" />
      <div className="relative bg-white border-2 border-slate-900 p-6" >
        <BarChartCard
                    title="Phân phối điểm số"
data = { data.scoreDistribution }
xKey = "range"
bars = { [{ key: 'count', label: 'Học viên', color: '#0f172a' }]}
height = { 300}
  />
  </div>
  </div>
  < div className = "relative" >
    <div className="absolute inset-0 bg-slate-900 translate-x-2 translate-y-2" />
      <div className="relative bg-white border-2 border-slate-900 p-6 h-full flex flex-col" >
        <PieChartCard
                    title="Tỷ lệ Đạt / Trượt"
data = { passFail }
height = { 260}
  />
  </div>
  </div>
  </div>
  </div>
        )}

{/* ─── Attempts Tab ─────────────────────────────────────────── */ }
{
  activeTab === 'attempts' && (
    <div className="relative animate-fadeIn" >
      <div className="absolute inset-0 bg-slate-900 translate-x-2 translate-y-2" />
        <div className="relative bg-white border-2 border-slate-900 overflow-hidden" >
          <table className="w-full text-left" >
            <thead>
            <tr className="border-b-2 border-slate-900 bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-widest" >
              <th className="px-6 py-4" > Học viên </th>
                < th className = "px-6 py-4" > Điểm đạt được </th>
                  < th className = "px-6 py-4" > Kết quả </th>
                    < th className = "px-6 py-4 text-right" > Ngày nộp bài </th>
                      </tr>
                      </thead>
                      < tbody className = "divide-y-2 divide-slate-100 italic" >
                      {
                        data.recentAttempts.map((attempt) => (
                          <tr key= { attempt.id } className = "hover:bg-slate-50 transition-colors" >
                          <td className="px-6 py-4 text-xs font-black text-slate-900 uppercase" > { attempt.studentName } </td>
                        < td className = "px-6 py-4" >
                        <span className="text-xs font-black text-slate-900" > { attempt.score } % </span>
                        < span className = "text-[10px] text-slate-400 font-bold ml-2" > ({ attempt.totalScore } / { attempt.maxScore }) </span>
                        </td>
                        < td className = "px-6 py-4" >
                        <span
                          className={`px-2 py-0.5 border-2 text-[10px] font-black uppercase ${attempt.isPassed
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-red-500 bg-red-50 text-red-700'
                          }`}
                        >
                        { attempt.isPassed ? 'Đạt' : 'Trượt' }
                        </span>
                        </td>
                        < td className = "px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase" >
                          { attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : '-' }
                          </td>
                          </tr>
                  ))
}
{
  data.recentAttempts.length === 0 && (
    <tr>
    <td colSpan={ 4 } className = "px-6 py-12 text-center text-slate-400 text-xs font-black uppercase tracking-widest" >
      Chưa có lượt nộp bài nào
        </td>
        </tr>
                  )
}
</tbody>
  </table>
  </div>
  </div>
        )}

{/* ─── Question Analysis Tab ─────────────────────────────────── */ }
{
  activeTab === 'analysis' && (
    <div className="relative animate-fadeIn" >
      <div className="absolute inset-0 bg-slate-900 translate-x-2 translate-y-2" />
        <div className="relative bg-white border-2 border-slate-900 overflow-hidden" >
          <table className="w-full text-left" >
            <thead>
            <tr className="border-b-2 border-slate-900 bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-widest" >
              <th className="px-6 py-4" > Câu hỏi </th>
                < th className = "px-6 py-4" > Loại </th>
                  < th className = "px-6 py-4 text-center" > Tổng HS </th>
                    < th className = "px-6 py-4 text-center" > Đúng </th>
                      < th className = "px-6 py-4 text-right" > Tỷ lệ sai </th>
                        </tr>
                        </thead>
                        < tbody className = "divide-y-2 divide-slate-100" >
                        {
                          questionAnalysis.map((item) => (
                            <tr key= { item.questionId } className = "hover:bg-slate-50 transition-colors" >
                            <td className="px-6 py-4 max-w-md" >
                          <div className="text-xs font-black text-slate-900 uppercase truncate" > { item.content } </div>
                          </td>
                          < td className = "px-6 py-4" >
                          <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 uppercase" >
                          { item.type }
                          </span>
                          </td>
                          < td className = "px-6 py-4 text-center text-xs font-black" > { item.totalAnswers } </td>
                          < td className = "px-6 py-4 text-center text-xs font-black text-emerald-600" > { item.correctAnswers } </td>
                          < td className = "px-6 py-4 text-right" >
                          <span
                          className={`px-2 py-0.5 border-2 text-[10px] font-black uppercase ${item.failureRate > 50
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : item.failureRate > 25
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            }`}
                          >
                          { item.failureRate } %
                          </span>
                          </td>
                          </tr>
                  ))
}
{
  questionAnalysis.length === 0 && (
    <tr>
    <td colSpan={ 5 } className = "px-6 py-12 text-center text-slate-400 text-xs font-black uppercase tracking-widest" >
      Chưa có dữ liệu phân tích
        </td>
        </tr>
                  )
}
</tbody>
  </table>
  </div>
  </div>
        )}
</div>

  < style jsx global > {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 300ms ease-out forwards;
        }
      `}</style>
  </div>
  );
}
