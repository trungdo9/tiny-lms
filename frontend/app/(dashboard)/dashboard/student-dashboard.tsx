'use client';

import Link from 'next/link';
import { getResumeLessonId } from '@/lib/course-progress';
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  BarChart3,
  ArrowRight,
  FileQuestion,
} from 'lucide-react';
import { StatCard, StatCardSkeleton, ListSkeleton, EmptyState } from './dashboard-ui';

interface StudentData {
  stats: { totalCourses: number; completedCourses: number; totalQuizzes: number };
  enrolledCourses: {
    courseId: string;
    courseSlug: string;
    courseTitle: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
    sections?: {
      order_index?: number;
      lessons?: {
        id: string;
        is_published?: boolean;
        order_index?: number;
      }[];
    }[];
    lessonProgress?: {
      lessonId?: string;
      isCompleted?: boolean;
      lastPosition?: number;
      updatedAt?: string;
    }[];
  }[];
  recentActivity: {
    id: string;
    quizTitle: string;
    score: number;
    isPassed: boolean;
    submittedAt: string;
  }[];
}

export function StudentDashboard({
  data,
  isLoading,
}: {
  data: StudentData | undefined;
  isLoading: boolean;
}) {
  const featuredCourse = data?.enrolledCourses[0];
  const featuredResumeLessonId = featuredCourse
    ? getResumeLessonId(featuredCourse.sections, featuredCourse.lessonProgress)
    : null;
  const featuredResumeHref = featuredCourse && featuredResumeLessonId
    ? `/courses/${featuredCourse.courseSlug}/learn/${featuredResumeLessonId}`
    : '/courses';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-900">My Dashboard</h1>
        <Link
          href="/dashboard/progress"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <BarChart3 className="w-4 h-4" />
          View Progress
        </Link>
      </div>

      {/* Continue Learning Banner */}
      {data?.enrolledCourses.length !== undefined &&
        data.enrolledCourses.length > 0 &&
        data.enrolledCourses[0].progress < 100 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <span className="inline-block bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-full text-xs mb-4">
                CONTINUE LEARNING
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">
                {data.enrolledCourses[0].courseTitle}
              </h2>
              <p className="text-gray-500 font-medium mb-4">
                {data.enrolledCourses[0].completedLessons} of{' '}
                {data.enrolledCourses[0].totalLessons} lessons completed
              </p>
              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${data.enrolledCourses[0].progress}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {data.enrolledCourses[0].progress}% complete
              </span>
            </div>
            <div className="md:w-auto">
              <Link
                href={featuredResumeHref}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
              >
                Resume Learning
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            icon={BookOpen}
            label="Enrolled Courses"
            value={data.stats.totalCourses}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed Courses"
            value={data.stats.completedCourses}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            valueColor="text-emerald-600"
          />
          <StatCard
            icon={ClipboardList}
            label="Quizzes Taken"
            value={data.stats.totalQuizzes}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enrolled Courses List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-gray-100 pb-4">
            My Courses
          </h2>
          {isLoading ? (
            <ListSkeleton />
          ) : data?.enrolledCourses.length === 0 ? (
            <EmptyState message="No courses enrolled" />
          ) : (
            <div className="space-y-4">
              {data?.enrolledCourses.map((course) => (
                <Link
                  key={course.courseId}
                  href={(() => {
                    const lessonId = getResumeLessonId(course.sections, course.lessonProgress);
                    return lessonId
                      ? `/courses/${course.courseSlug}/learn/${lessonId}`
                      : `/courses`;
                  })()}
                  className="block p-4 rounded-lg bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <p className="font-semibold text-slate-900">{course.courseTitle}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {course.completedLessons}/{course.totalLessons} lessons ({course.progress}%)
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">Recent Quiz Activity</h2>
            <Link
              href="/profile/history"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              View All
            </Link>
          </div>
          {isLoading ? (
            <ListSkeleton />
          ) : data?.recentActivity.length === 0 ? (
            <EmptyState message="No quizzes taken yet" />
          ) : (
            <div className="space-y-3">
              {data?.recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <FileQuestion className="w-4 h-4 text-gray-400" />
                    <p className="font-semibold text-slate-900">{activity.quizTitle}</p>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                    <p className="text-xs font-medium text-gray-500">
                      {new Date(activity.submittedAt).toLocaleDateString()}
                    </p>
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold ${
                        activity.isPassed
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      Score: {activity.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
