'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * Quiz không còn được tạo standalone.
 * Quiz phải được tạo từ bên trong một bài học (lesson) cụ thể trong khóa học.
 */
export default function CreateQuizRedirectPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">📝</div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Tạo Quiz từ Bài học</h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Quiz không còn được tạo độc lập. Mỗi quiz phải gắn với một <strong>bài học</strong>{' '}
          cụ thể trong khóa học.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-6">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">Cách tạo quiz</p>
          <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
            <li>Vào <strong>Khóa học của tôi</strong></li>
            <li>Chọn khóa học cần thêm quiz</li>
            <li>Hover vào bài học → Bấm <strong>+ Tạo Quiz</strong></li>
          </ol>
        </div>

        <div className="flex gap-3">
          <Link
            href="/instructor/courses"
            className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-700 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            → Tới Khóa học
          </Link>
          <button
            onClick={() => router.back()}
            className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-lg text-sm text-gray-600 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
