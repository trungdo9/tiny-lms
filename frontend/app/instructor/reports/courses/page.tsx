'use client';

import { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { coursesApi } from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Course {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  level?: 'beginner' | 'intermediate' | 'advanced';
  thumbnailUrl?: string;
  category?: { id: string; name: string; slug: string };
  sectionCount?: number;
  enrollmentCount?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'draft', label: 'Nháp' },
  { value: 'archived', label: 'Lưu trữ' },
];

const STATUS_CONFIG = {
  published: { label: 'Đã xuất bản', borderCls: 'border-emerald-500', bgCls: 'bg-emerald-50', textCls: 'text-emerald-700' },
  draft: { label: 'Nháp', borderCls: 'border-amber-500', bgCls: 'bg-amber-50', textCls: 'text-amber-700' },
  archived: { label: 'Lưu trữ', borderCls: 'border-slate-400', bgCls: 'bg-slate-50', textCls: 'text-slate-500' },
} as Record<string, { label: string; borderCls: string; bgCls: string; textCls: string }>;

// ─── Main Page Content ────────────────────────────────────────────────────────

function CourseReportsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read filter values from URL
  const search = searchParams.get('q') ?? '';
  const status = searchParams.get('status') ?? '';

  // Local state for debounced search input
  const [searchInput, setSearchInput] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync URL → local input on navigation
  useEffect(() => {
    setSearchInput(searchParams.get('q') ?? '');
  }, [searchParams]);

  const updateUrl = useCallback((q: string, st: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (st) params.set('status', st);
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [router, pathname]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateUrl(val, status), 300);
  };

  const handleStatusChange = (st: string) => {
    updateUrl(search, st === status ? '' : st);
  };

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: queryKeys.courses.instructor({ search, status }),
    queryFn: () => coursesApi.getInstructorCourses({ search, status }),
  });

  const courseList = courses || [];

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
          Báo cáo khóa học
            </h1>
            < p className = "text-slate-500 font-medium mt-1" >
              Theo dõi tiến độ, tỷ lệ hoàn thành và kết quả của từng khóa học
                </p>
                </div>
                < div className = "text-[10px] font-black uppercase text-slate-400 tracking-widest pb-1" >
                  Tổng cộng: { courseList.length } khóa học
                    </div>
                    </div>

  {/* ─── Filter Bar ─────────────────────────────────────────────── */ }
  <div className="flex flex-col sm:flex-row gap-4 mb-8" >
    {/* Search */ }
    < div className = "relative flex-1 max-w-sm group" >
      <div className="absolute inset-0 bg-slate-900 translate-x-1 translate-y-1 group-focus-within:translate-x-0 group-focus-within:translate-y-0 transition-transform" />
        <div className="relative bg-white border-2 border-slate-900 p-2 flex items-center gap-2" >
          <span className="text-slate-400 font-bold ml-1" ># </span>
            < input
  type = "text"
  value = { searchInput }
  onChange = { handleSearchChange }
  placeholder = "Tìm khóa học để xem báo cáo..."
  className = "w-full text-sm font-bold focus:outline-none placeholder:text-slate-300"
    />
    { searchInput && (
      <button
                  onClick={ () => { setSearchInput(''); updateUrl('', status); } }
  className = "text-slate-300 hover:text-slate-900 text-lg leading-none transition-colors px-1"
    >
                  ×
  </button>
              )
}
</div>
  </div>

{/* Status filter pills */ }
<div className="flex flex-wrap gap-2" >
{
  STATUS_FILTERS.map((f) => (
    <button
                key= { f.value }
                onClick = {() => handleStatusChange(f.value)}
className = {`relative group px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${status === f.value ? 'scale-95' : 'hover:-translate-y-0.5'
  }`}
              >
  <div className={
    `absolute inset-0 border-2 border-slate-900 translate-x-0.5 translate-y-0.5 ${status === f.value ? 'bg-slate-900' : 'bg-white'
    }`
} />
  < div className = {`relative px-1 ${status === f.value ? 'text-white' : 'text-slate-900'
    }`}>
      { f.label }
      </div>
      </button>
            ))}
</div>
  </div>

{/* ─── Grid ─────────────────────────────────────────────────── */ }
{
  courseList.length === 0 ? (
    <div className= "relative group" >
    <div className="absolute inset-0 border-2 border-dashed border-slate-300 translate-x-2 translate-y-2" />
      <div className="relative bg-white border-2 border-dashed border-slate-300 p-16 text-center" >
        <p className="text-slate-400 text-xl font-bold uppercase tracking-widest mb-4" >
          Không tìm thấy dữ liệu
            </p>
            < button
  onClick = {() => { setSearchInput(''); updateUrl('', ''); }
}
className = "text-amber-500 font-black uppercase text-sm hover:underline"
  >
  Xóa tất cả bộ lọc
    </button>
    </div>
    </div>
        ) : (
  <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" >
  {
    courseList.map((course: Course, idx: number) => {
      const st = STATUS_CONFIG[course.status] || STATUS_CONFIG.draft;
      return (
        <div 
                  key= { course.id }
      className = "relative group h-full"
      style = {{ animationDelay: `${idx * 50}ms`, animation: 'staggerIn 400ms ease-out forwards' }
    }
                >
      {/* Card Shadow */ }
      < div className = "absolute inset-0 bg-slate-900 translate-x-2 translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />

      {/* Main Card Content */ }
      < Link 
                    href = {`/instructor/reports/courses/${course.id}`}
className = "relative block h-full bg-white border-2 border-slate-900 p-5 flex flex-col"
  >
  {/* Header */ }
  < div className = "flex justify-between items-start gap-3 mb-4" >
    <div className="flex-1" >
      <div className="flex items-center gap-2 mb-1.5 leading-none" >
        <span className={ `w-2 h-2 rounded-full bg-slate-900 shadow-[0_0_0_1px_rgba(255,255,255,1),0_0_0_2px_rgba(15,23,42,1)]` } />
          < span className = "text-[10px] font-black uppercase tracking-tighter text-slate-400" >
            ID: { course.id.slice(0, 8) }
</span>
  </div>
  < h3 className = "text-lg font-black text-slate-900 leading-tight uppercase group-hover:text-amber-500 transition-colors" >
    { course.title }
    </h3>
    </div>
    < div className = {`px-2 py-0.5 border-2 ${st.borderCls} ${st.bgCls} ${st.textCls} text-[10px] font-black uppercase leading-tight shrink-0`}>
      { st.label }
      </div>
      </div>

{/* Meta tags */ }
<div className="flex flex-wrap gap-1.5 mb-auto" >
{
  course.category && (
    <span className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-200 text-[10px] font-bold text-indigo-600 uppercase">
      { course.category.name }
      </span>
                      )
}
  < span className = "px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 uppercase" >
    { course.level }
    </span>
    </div>

{/* Stats */ }
<div className="mt-6 pt-4 border-t-2 border-slate-100 flex justify-between items-center bg-slate-50 -mx-5 -mb-5 p-5" >
  <div className="flex flex-col items-center" >
    <span className="text-2xl font-black text-slate-900 leading-none" >
      { course.enrollmentCount || 0 }
      </span>
      < span className = "text-[9px] font-black uppercase text-slate-400 tracking-tighter mt-1" >
        Học viên
          </span>
          </div>
          < div className = "w-px h-6 bg-slate-200 mx-2" />
            <div className="flex flex-col items-center" >
              <span className="text-2xl font-black text-slate-900 leading-none" >
                { course.sectionCount || 0 }
                </span>
                < span className = "text-[9px] font-black uppercase text-slate-400 tracking-tighter mt-1" >
                  Phần học
                    </span>
                    </div>
                    < div className = "ml-auto" >
                      <div className="w-10 h-10 bg-slate-900 flex items-center justify-center text-white group-hover:bg-amber-400 group-hover:text-slate-900 transition-colors" >
                        <span className="text-lg" >→</span>
                          </div>
                          </div>
                          </div>
                          </Link>
                          </div>
              );
            })}
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

// ─── Default Export wrapped in Suspense ───────────────────────────────────────

export default function CourseReportsPage() {
  return (
    <Suspense fallback= {
      < div className = "flex items-center justify-center p-12" >
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
      </div>
}>
  <CourseReportsPageContent />
  </Suspense>
  );
}
