'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';

interface CourseReport {
  course: { id: string; title: string };
  stats: {
    totalEnrollments: number;
    completionRate: number;
    totalLessons: number;
    totalQuizzes: number;
  };
  students: {
    id: string;
    name: string;
    progress: number;
    enrolledAt: string;
  }[];
  quizSummary: { id: string; title: string; attempts: number }[];
}

export default function CourseReportPage() {
  const params = useParams();
  const courseId = params.id as string;

  const { data, isLoading, error } = useQuery<CourseReport>({
    queryKey: queryKeys.instructorReports.course(courseId),
    queryFn: () => reportsApi.getCourseReport(courseId),
    enabled: !!courseId,
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
      <div className= "p-8" >
      <div className="max-w-6xl mx-auto" >
        <div className="bg-red-50 border-2 border-red-900 p-6" >
          <h2 className="text-red-900 font-black uppercase mb-2" > Đã có lỗi xảy ra </h2>
            < p className = "text-red-700 font-bold" > {(error as Error).message
  } </p>
    </div>
    </div>
    </div>
    );
}

if (!data) return null;

return (
  <div className= "p-8" >
  <div className="max-w-6xl mx-auto" >
    {/* Header */ }
    < div className = "mb-8 border-b-2 border-slate-900 pb-4" >
      <div className="flex items-center gap-2 mb-2 leading-none" >
        <span className="w-3 h-3 bg-amber-400 border-2 border-slate-900" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400" >
            Báo cáo chi tiết khóa học
              </span>
              </div>
              < h1 className = "text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none" >
                { data.course.title }
                </h1>
                </div>

{/* ─── Stats Grid ─────────────────────────────────────────────── */ }
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" >
{
  [
  { label: 'Tổng học viên', value: data.stats.totalEnrollments, icon: '👥' },
  { label: 'Tỷ lệ hoàn thành', value: `${data.stats.completionRate}%`, icon: '📈' },
  { label: 'Số bài học', value: data.stats.totalLessons, icon: '📚' },
  { label: 'Số bài kiểm tra', value: data.stats.totalQuizzes, icon: '📝' },
          ].map((stat, idx) => (
    <div key= { idx } className = "relative group" >
    <div className="absolute inset-0 bg-slate-900 translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform" />
  <div className="relative bg-white border-2 border-slate-900 p-5" >
  <div className="flex justify-between items-start mb-2" >
  <span className="text-xs font-black uppercase text-slate-400 tracking-tighter" >
  { stat.label }
  </span>
  < span className = "text-xl leading-none" > { stat.icon } </span>
  </div>
  < div className = "text-3xl font-black text-slate-900" > { stat.value } </div>
  </div>
  </div>
  ))
}
  </div>

  < div className = "grid grid-cols-1 lg:grid-cols-3 gap-8" >
    {/* ─── Students Table ───────────────────────────────────────── */ }
    < div className = "lg:col-span-2 relative" >
      <div className="absolute inset-0 bg-slate-900 translate-x-2 translate-y-2" />
        <div className="relative bg-white border-2 border-slate-900 overflow-hidden" >
          <div className="bg-slate-900 px-4 py-3 flex justify-between items-center" >
            <h2 className="text-white font-black uppercase tracking-widest text-sm" >
              Danh sách học viên({ data.students.length })
                </h2>
                < div className = "w-4 h-4 bg-amber-400" />
                  </div>

                  < div className = "overflow-x-auto" >
                    <table className="w-full text-left" >
                      <thead>
                      <tr className="border-b-2 border-slate-100 bg-slate-50" >
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500" > Học viên </th>
                          < th className = "px-6 py-4 text-[10px] font-black uppercase text-slate-500" > Tiến độ </th>
                            < th className = "px-6 py-4 text-[10px] font-black uppercase text-slate-500 text-right" > Ngày tham gia </th>
                              </tr>
                              </thead>
                              < tbody className = "divide-y-2 divide-slate-50" >
                                {
                                  data.students.map((student) => (
                                    <tr key= { student.id } className = "hover:bg-slate-50 transition-colors" >
                                    <td className="px-6 py-4" >
                                  <div className="font-black text-slate-900 uppercase text-xs" > { student.name } </div>
                                  < div className = "text-[9px] text-slate-400 font-bold uppercase tracking-tighter" > ID: { student.id.slice(0, 8) } </div>
                                  </td>
                                  < td className = "px-6 py-4" >
                                  <div className="flex items-center gap-3" >
                                  <div className="w-32 h-3 border-2 border-slate-900 bg-slate-100 flex items-center p-[1px]" >
                                  <div
                                className="h-full bg-slate-900"
                                style = {{ width: `${student.progress}%` }}
                                />
                                </div>
                                < span className = "text-xs font-black text-slate-900" > { student.progress } % </span>
                                  </div>
                                  </td>
                                  < td className = "px-6 py-4 text-right" >
                                    <span className="text-[10px] font-black text-slate-500 uppercase" >
                                      { new Date(student.enrolledAt).toLocaleDateString() }
                                      </span>
                                      </td>
                                      </tr>
                    ))}
</tbody>
  </table>
  </div>
  </div>
  </div>

{/* ─── Quiz Summary ─────────────────────────────────────────── */ }
<div className="relative" >
  <div className="absolute inset-0 bg-slate-900 translate-x-2 translate-y-2" />
    <div className="relative bg-white border-2 border-slate-900 overflow-hidden" >
      <div className="bg-slate-900 px-4 py-3 flex justify-between items-center" >
        <h2 className="text-white font-black uppercase tracking-widest text-sm" >
          Tổng hợp Quiz
            </h2>
            < div className = "w-4 h-4 bg-amber-400" />
              </div>

              < div className = "divide-y-2 divide-slate-100" >
              {
                data.quizSummary.map((quiz) => (
                  <div key= { quiz.id } className = "p-4 hover:bg-slate-50 transition-colors" >
                  <div className="flex justify-between items-start mb-2" >
                <h3 className="text-xs font-black text-slate-900 uppercase leading-snug" >
                { quiz.title }
                </h3>
                < Link 
                        href = {`/admin/reports/quizzes/${quiz.id}`}
className = "text-[9px] font-black uppercase text-amber-600 hover:text-amber-700 underline shrink-0 ml-2"
  >
  Chi tiết →
</Link>
  </div>
  < div className = "flex items-center gap-2" >
    <span className="text-[10px] font-black uppercase text-slate-400" > Số lượt làm bài: </span>
      < span className = "px-2 py-0.5 bg-slate-900 text-white text-[10px] font-black rounded-sm" >
        { quiz.attempts }
        </span>
        </div>
        </div>
                ))}
{
  data.quizSummary.length === 0 && (
    <div className="p-8 text-center text-slate-400 text-[10px] font-black uppercase italic" >
      Chưa có bài kiểm tra nào
        </div>
                )
}
</div>
  </div>
  </div>
  </div>
  </div>
  </div>
  );
}
