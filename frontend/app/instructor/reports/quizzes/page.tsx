'use client';

import { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { quizzesApi } from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuizWithStats {
  id: string;
  title: string;
  description: string | null;
  course: { id: string; title: string };
  isPublished: boolean;
  _count: { questions: number; attempts: number };
}

// ─── Main Page Content ────────────────────────────────────────────────────────

function QuizReportsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get('q') ?? '';

  const [searchInput, setSearchInput] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchInput(searchParams.get('q') ?? '');
  }, [searchParams]);

  const updateUrl = useCallback((q: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [router, pathname]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateUrl(val), 300);
  };

  const { data: quizzes, isLoading } = useQuery<QuizWithStats[]>({
    queryKey: queryKeys.quizzes.list({ search }),
    queryFn: () => quizzesApi.list({ search }),
  });

  const quizList = quizzes || [];

  if (isLoading) {
    return (
      <div className= "flex items-center justify-center p-12" >
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
        </div>
    );
  }

  return (
    <div className= "p-8" >
    <div className="max-w-6xl mx-auto" >
      {/* Header */ }
      < div className = "mb-8 border-b-2 border-slate-900 pb-4 flex justify-between items-end" >
        <div>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight" >
          Báo cáo bài kiểm tra
            </h1>
            < p className = "text-slate-500 font-medium mt-1" >
              Theo dõi lượt tham gia, điểm số và mức độ hoàn thành bài kiểm tra
                </p>
                </div>
                < div className = "text-[10px] font-black uppercase text-slate-400 tracking-widest pb-1" >
                  Tổng cộng: { quizList.length } bài thi
                    </div>
                    </div>

  {/* Filter Bar */ }
  <div className="mb-8" >
    <div className="relative max-w-sm group" >
      <div className="absolute inset-0 bg-slate-900 translate-x-1 translate-y-1 group-focus-within:translate-x-0 group-focus-within:translate-y-0 transition-transform" />
        <div className="relative bg-white border-2 border-slate-900 p-2 flex items-center gap-2" >
          <span className="text-slate-400 font-bold ml-1" ># </span>
            < input
  type = "text"
  value = { searchInput }
  onChange = { handleSearchChange }
  placeholder = "Tìm bài kiểm tra..."
  className = "w-full text-sm font-bold focus:outline-none placeholder:text-slate-300"
    />
    { searchInput && (
      <button
                  onClick={ () => { setSearchInput(''); updateUrl(''); } }
  className = "text-slate-300 hover:text-slate-900 text-lg leading-none transition-colors px-1"
    >
                  ×
  </button>
              )
}
</div>
  </div>
  </div>

{/* List */ }
{
  quizList.length === 0 ? (
    <div className= "relative group" >
    <div className="absolute inset-0 border-2 border-dashed border-slate-300 translate-x-2 translate-y-2" />
      <div className="relative bg-white border-2 border-dashed border-slate-300 p-16 text-center" >
        <p className="text-slate-400 text-xl font-bold uppercase tracking-widest mb-4" >
          Không tìm thấy bài thi nào
            </p>
            </div>
            </div>
        ) : (
    <div className= "relative group overflow-hidden" >
    <div className="absolute inset-0 bg-slate-900 translate-x-2 translate-y-2" />
      <div className="relative bg-white border-2 border-slate-900" >
        <div className="overflow-x-auto" >
          <table className="w-full text-left" >
            <thead>
            <tr className="border-b-2 border-slate-900 bg-slate-50" >
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest" > Tiêu đề bài thi </th>
                < th className = "px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest" > Khóa học </th>
                  < th className = "px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center" > Câu hỏi </th>
                    < th className = "px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center" > Lượt làm bài </th>
                      < th className = "px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right" > Thao tác </th>
                        </tr>
                        </thead>
                        < tbody className = "divide-y-2 divide-slate-100" >
                        {
                          quizList.map((quiz, idx) => (
                            <tr 
                         key= { quiz.id } 
                         className = "hover:bg-slate-50 transition-colors group/row"
                         style = {{ animationDelay: `${idx * 40}ms`, animation: 'staggerIn 400ms ease-out forwards' }}
                          >
                          <td className="px-6 py-4" >
                            <div className="font-black text-slate-900 uppercase text-xs group-hover/row:text-amber-600 transition-colors" > { quiz.title } </div>
  {
    quiz.description && (
      <p className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[240px] mt-0.5" > { quiz.description } </p>
                           )
  }
  </td>
    < td className = "px-6 py-4" >
      <span className="px-2 py-1 bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 uppercase" >
        { quiz.course?.title || 'Chưa gán' }
        </span>
        </td>
        < td className = "px-6 py-4 text-center" >
          <span className="text-xs font-black text-slate-900" > { quiz._count?.questions || 0 } </span>
            </td>
            < td className = "px-6 py-4 text-center" >
              <div className={
                `inline-flex items-center justify-center px-3 py-1 rounded-sm text-[10px] font-black ${quiz._count?.attempts > 0
                  ? 'bg-emerald-900 text-white'
                  : 'bg-slate-100 text-slate-400'
                }`
  }>
    { quiz._count?.attempts || 0 }
    </div>
    </td>
    < td className = "px-6 py-4 text-right" >
      <Link
                             href={ `/instructor/reports/quizzes/${quiz.id}` }
  className = "inline-flex items-center gap-1 text-[10px] font-black uppercase text-slate-900 hover:text-amber-500 tracking-widest transition-colors"
    >
    Xem báo cáo < span className = "text-sm" >→</span>
      </Link>
      </td>
      </tr>
                     ))
}
</tbody>
  </table>
  </div>
  </div>
  </div>
        )}
</div>

  < style jsx global > {`
        @keyframes staggerIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
  </div>
  );
}

export default function QuizReportsPage() {
  return (
    <Suspense fallback= {
      < div className = "flex items-center justify-center p-12" >
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
      </div>
}>
  <QuizReportsPageContent />
  </Suspense>
  );
}
