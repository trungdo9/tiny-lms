'use client';

import { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, FileText, BarChart3 } from 'lucide-react';
import { queryKeys } from '@/lib/query-keys';
import { quizzesApi } from '@/lib/api';

interface QuizWithStats {
  id: string;
  title: string;
  description: string | null;
  course: { id: string; title: string };
  isPublished: boolean;
  _count: { questions: number; attempts: number };
}

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

  const updateUrl = useCallback(
    (q: string) => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [router, pathname],
  );

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
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-6 mb-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi lượt tham gia, điểm số và mức độ hoàn thành bài kiểm tra
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Tổng cộng: <span className="font-semibold text-gray-900">{quizList.length}</span> bài thi
        </div>
      </div>

      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Tìm bài kiểm tra..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                updateUrl('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {quizList.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
            <FileText className="w-6 h-6 text-gray-500" />
          </div>
          <p className="text-gray-900 font-medium mb-1">Không tìm thấy bài thi nào</p>
          <p className="text-sm text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc tạo thêm bài thi.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-500 uppercase bg-gray-50">
                  <th className="px-6 py-4">Tiêu đề bài thi</th>
                  <th className="px-6 py-4">Khóa học</th>
                  <th className="px-6 py-4 text-center">Câu hỏi</th>
                  <th className="px-6 py-4 text-center">Lượt làm bài</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {quizList.map((quiz) => (
                  <tr key={quiz.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                      {quiz.description && (
                        <p className="text-sm text-gray-500 truncate max-w-[320px] mt-1">{quiz.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700">
                        {quiz.course?.title || 'Chưa gán'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                      {quiz._count?.questions || 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center min-w-[2.5rem] px-2.5 py-1 rounded-md text-xs font-medium ${
                          quiz._count?.attempts > 0
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {quiz._count?.attempts || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/reports/quizzes/${quiz.id}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Xem báo cáo
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      }
    >
      <QuizReportsPageContent />
    </Suspense>
  );
}
