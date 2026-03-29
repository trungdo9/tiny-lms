'use client';

import { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Course {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  level?: 'beginner' | 'intermediate' | 'advanced';
  thumbnailUrl?: string;
  isFree?: boolean;
  price?: number;
  category?: { id: string; name: string; slug: string };
  sectionCount?: number;
  enrollmentCount?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchInstructorCourses(search?: string, status?: string) {
  const { data: { session } } = await supabase.auth.getSession();
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  const qs = params.toString();
  const res = await fetch(`${API}/courses/instructor${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  if (!res.ok) throw new Error('Không tải được danh sách khóa học');
  return res.json();
}

// ─── Clone Course Modal ───────────────────────────────────────────────────────

function CloneCourseModal({
  course,
  onClose,
  onCloned,
}: {
  course: Course;
  onClose: () => void;
  onCloned: () => void;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: `${course.title} (Bản sao)`,
    importQuizMode: 'clone_all' as 'none' | 'clone_all' | 'import_from_quizzes',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleClone = async () => {
    setSaving(true);
    setError('');
    try {
      // Show warning for import_from_quizzes mode
      if (form.importQuizMode === 'import_from_quizzes') {
        setError('⚠️ Tính năng "Nhập câu hỏi từ bài kiểm tra khác" đang phát triển. Vui lòng chọn một tùy chọn khác hoặc quay lại sau.');
        setSaving(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API}/courses/${course.id}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ title: form.title, importQuizMode: form.importQuizMode }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Không clone được khóa học');
      }
      onCloned();
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className= "fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick = { onClose } >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
  onClick = {(e) => e.stopPropagation()
}
      >
  {/* Modal Header */ }
  < div className = "bg-slate-900 px-6 py-4" >
    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1" > Clone Khóa học </p>
      < h2 className = "text-white font-bold text-lg truncate" > { course.title } </h2>
        </div>

{/* Step indicator */ }
<div className="flex border-b border-gray-100" >
{
  [
  { n: 1, label: 'Thông tin' },
  { n: 2, label: 'Bài kiểm tra' },
          ].map(({ n, label }) => (
    <button
              key= { n }
              onClick = {() => n === 1 && setStep(1)}
className = {`flex-1 py-3 text-sm font-medium transition-colors ${step === n ? 'text-slate-900 border-b-2 border-amber-400' : 'text-gray-400 hover:text-gray-600'
  }`}
            >
  <span className={
    `inline-flex items-center justify-center w-5 h-5 rounded-full text-xs mr-2 ${step >= n ? 'bg-amber-400 text-slate-900' : 'bg-gray-100 text-gray-400'
    }`
}> { n } </span>
{ label }
</button>
          ))}
</div>

  < div className = "p-6" >
    { error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm" > { error } </div>}

{/* Step 1 */ }
{
  step === 1 && (
    <div className="space-y-4" >
      <div>
      <label className="block text-sm font-medium text-gray-700 mb-1" > Tên khóa học mới * </label>
        < input
  type = "text"
  value = { form.title }
  onChange = {(e) => setForm({ ...form, title: e.target.value })
}
className = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none"
placeholder = "Nhập tên mới cho khóa học..."
  />
  </div>
  < div className = "bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800" >
    <strong>Lưu ý: </strong> Khóa học clone sẽ bao gồm toàn bộ phần học và bài học.
                Bước tiếp theo bạn có thể chọn cách xử lý bài kiểm tra.
              </div>
  < button
onClick = {() => form.title.trim() && setStep(2)}
disabled = {!form.title.trim()}
className = "w-full py-2.5 bg-slate-900 hover:bg-slate-700 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-40"
  >
  Tiếp tục →
</button>
  </div>
          )}

{/* Step 2 */ }
{
  step === 2 && (
    <div className="space-y-3" >
      <p className="text-sm text-gray-600 mb-4" >
        Chọn cách xử lý < strong > bài kiểm tra </strong> trong khóa học clone:
          </p>
  {
    [
      { value: 'clone_all', icon: '⎘', label: 'Sao chép toàn bộ bài kiểm tra', desc: 'Clone đầy đủ tất cả quiz và câu hỏi từ khóa học gốc' },
      { value: 'none', icon: '✕', label: 'Không sao chép bài kiểm tra', desc: 'Chỉ clone cấu trúc phần học và bài học, bỏ qua quiz' },
      { value: 'import_from_quizzes', icon: '↓', label: 'Nhập câu hỏi từ bài kiểm tra khác', desc: 'Tạo quiz mới và nhập câu hỏi từ các bài kiểm tra được chọn' },
    ].map((opt) => (
      <label
                  key= { opt.value }
                  className = {`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.importQuizMode === opt.value ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
        }`}
                >
    <input
                    type="radio"
  name = "importQuizMode"
  value = { opt.value }
  checked = { form.importQuizMode === opt.value }
  onChange = {() => setForm({ ...form, importQuizMode: opt.value as any })
}
className = "mt-0.5 accent-amber-400"
  />
  <div>
  <div className="font-medium text-sm text-gray-900" >
    <span className="mr-1.5" > { opt.icon } </span>{opt.label}
      </div>
      < div className = "text-xs text-gray-500 mt-0.5" > { opt.desc } </div>
        </div>
        </label>
              ))}
<div className="flex gap-2 pt-2" >
  <button onClick={ () => setStep(1) } className = "px-4 py-2 border rounded-lg text-sm hover:bg-gray-50" >
                  ← Quay lại
  </button>
  < button
onClick = { handleClone }
disabled = { saving }
className = "flex-1 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold rounded-lg text-sm transition-colors disabled:opacity-50"
  >
  { saving? 'Đang clone...': '⎘ Tạo bản sao' }
  </button>
  </div>
  </div>
          )}
</div>
  </div>
  </div>
  );
}

// ─── Status filter constants ──────────────────────────────────────────────────

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'draft', label: 'Nháp' },
  { value: 'archived', label: 'Lưu trữ' },
];

const STATUS_CONFIG = {
  published: { label: 'Đã xuất bản', cls: 'bg-emerald-100 text-emerald-700' },
  draft: { label: 'Nháp', cls: 'bg-amber-100 text-amber-700' },
  archived: { label: 'Lưu trữ', cls: 'bg-gray-100 text-gray-500' },
} as Record<string, { label: string; cls: string }>;

// ─── Main Page Content ────────────────────────────────────────────────────────

function CoursesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [cloneTarget, setCloneTarget] = useState<Course | null>(null);
  const [error, setError] = useState('');

  // Read filter values from URL
  const search = searchParams.get('q') ?? '';
  const status = searchParams.get('status') ?? '';

  // Local state for controlled search input (debounced)
  const [searchInput, setSearchInput] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync URL → local input when navigating back/forward
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
    // Toggle: click same filter → clear it
    updateUrl(search, st === status ? '' : st);
  };

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: queryKeys.courses.instructor({ search, status }),
    queryFn: () => fetchInstructorCourses(search, status),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API}/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error('Không xóa được');
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<Course[]>(
        queryKeys.courses.instructor({ search, status }),
        (old) => old ? old.filter((c) => c.id !== deletedId) : []
      );
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleDelete = (id: string) => {
    if (!confirm('Bạn chắc chắn muốn xóa khóa học này?')) return;
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className= "flex items-center justify-center p-8" >
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
        </div>
    );
  }

  return (
    <div className= "p-8" >
    <div className="max-w-6xl mx-auto" >
      {/* Header */ }
      < div className = "flex justify-between items-center mb-6" >
        <div>
        <h1 className="text-2xl font-bold text-slate-900" > Khóa học của tôi </h1>
          < p className = "text-sm text-gray-500 mt-1" > { courses.length } khóa học </p>
            </div>
            < Link
  href = "/instructor/courses/create"
  className = "px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold rounded-lg text-sm transition-colors"
    >
    + Tạo khóa học
      </Link>
      </div>

  {/* ─── Filter Bar ─────────────────────────────────────────────── */ }
  <div className="flex flex-col sm:flex-row gap-3 mb-5" >
    {/* Search */ }
    < div className = "relative flex-1 max-w-sm" >
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" >🔍</span>
        < input
  id = "course-search"
  type = "text"
  value = { searchInput }
  onChange = { handleSearchChange }
  placeholder = "Tìm khóa học..."
  className = "w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none bg-white"
    />
    { searchInput && (
      <button
                onClick={ () => { setSearchInput(''); updateUrl('', status); } }
  className = "absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-lg leading-none"
    >
                ×
  </button>
            )
}
</div>

{/* Status filter pills */ }
<div className="flex gap-1.5" >
{
  STATUS_FILTERS.map((f) => (
    <button
                key= { f.value }
                id = {`status-filter-${f.value || 'all'}`}
onClick = {() => handleStatusChange(f.value)}
className = {`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${status === f.value
    ? 'bg-slate-900 text-white'
    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
  }`}
              >
  { f.label }
  </button>
            ))}
</div>
  </div>

{ error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm" > { error } </div> }

{
  courses.length === 0 ? (
    <div className= "bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center" >
    <p className="text-gray-400 mb-4 text-lg" >
      { search || status ? '🔍 Không tìm thấy khóa học nào khớp' : '📚 Chưa có khóa học nào'
}
</p>
{
  search || status ? (
    <button
                onClick= {() => { setSearchInput(''); updateUrl('', ''); }
}
className = "text-amber-600 hover:underline font-medium text-sm"
  >
  Xóa bộ lọc
    </button>
            ) : (
  <Link href= "/instructor/courses/create" className = "text-amber-600 hover:underline font-medium" >
    Tạo khóa học đầu tiên của bạn
      </Link>
            )}
</div>
        ) : (
  <div className= "bg-white rounded-xl border border-gray-200 overflow-hidden" >
  <table className="w-full" >
    <thead className="bg-gray-50 border-b border-gray-200" >
      <tr>
      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider" > Khóa học </th>
        < th className = "px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider" > Trạng thái </th>
          < th className = "px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider" > Phần học </th>
            < th className = "px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider" > Học viên </th>
              < th className = "px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider" > Thao tác </th>
                </tr>
                </thead>
                < tbody className = "divide-y divide-gray-100" >
                {
                  courses.map((course) => {
                    const st = STATUS_CONFIG[course.status] || { label: course.status, cls: 'bg-gray-100 text-gray-500' };
                    return (
                      <tr key= { course.id } className = "hover:bg-gray-50 transition-colors" >
                        <td className="px-6 py-4" >
                          <Link
                          href={ `/instructor/courses/${course.id}` }
                    className = "font-medium text-slate-900 hover:text-amber-600 transition-colors"
                      >
                      { course.title }
                      </Link>
                      < div className = "flex items-center gap-2 mt-0.5" >
                      {
                        course.description && (
                          <p className="text-xs text-gray-400 truncate max-w-xs"> { course.description } </p>
                          )
                }
{
  course.category && (
    <span className="text-xs text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded shrink-0" >
      { course.category.name }
      </span>
                          )
}
</div>
  </td>
  < td className = "px-4 py-4" >
    <span className={ `px-2.5 py-1 rounded-full text-xs font-medium ${st.cls}` }>
      { st.label }
      </span>
      </td>
      < td className = "px-4 py-4 text-sm text-gray-600" > { course.sectionCount ?? 0 } </td>
        < td className = "px-4 py-4 text-sm text-gray-600" > { course.enrollmentCount ?? 0 } </td>
          < td className = "px-4 py-4" >
            <div className="flex justify-end gap-2" >
              <Link
                            href={ `/instructor/courses/${course.id}` }
className = "px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
  >
  Chỉnh sửa
    </Link>
    < button
onClick = {() => setCloneTarget(course)}
className = "px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
  >
                            ⎘ Clone
  </button>
  < button
onClick = {() => handleDelete(course.id)}
className = "px-3 py-1.5 text-xs font-medium text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
  >
  Xóa
  </button>
  </div>
  </td>
  </tr>
                  );
                })}
</tbody>
  </table>
  </div>
        )}
</div>

{/* Clone Course Modal */ }
{
  cloneTarget && (
    <CloneCourseModal
          course={ cloneTarget }
  onClose = {() => setCloneTarget(null)
}
onCloned = {() => {
  setCloneTarget(null);
  queryClient.invalidateQueries({ queryKey: queryKeys.courses.instructor({ search, status }) });
}}
        />
      )}
</div>
  );
}

// ─── Default Export wrapped in Suspense ───────────────────────────────────────
// Required by Next.js App Router when using useSearchParams()

export default function CoursesPage() {
  return (
    <Suspense fallback= {
      < div className = "flex items-center justify-center p-8" >
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
      </div>
}>
  <CoursesPageContent />
  </Suspense>
  );
}
