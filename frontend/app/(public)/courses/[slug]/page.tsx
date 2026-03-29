'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  coursesApi,
  enrollmentsApi,
  progressApi,
  paymentsApi,
  courseInstructorsApi,
  scormApi,
  CourseInstructor,
} from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/retroui/Button';
import { CourseReviewSection } from '@/components/course-review-section';
import { getResumeLessonId } from '@/lib/course-progress';
import { BookOpen, Video, FileText, ClipboardList, Lock } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  duration_mins: number;
  is_preview: boolean;
  is_published: boolean;
  order_index: number;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  level: string;
  isFree?: boolean;
  is_free?: boolean;
  price: number;
  status: string;
  instructor: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  category: {
    id: string;
    name: string;
  };
  sections: Section[];
  instructors?: CourseInstructor[];
}

interface CourseListResponse {
  data: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const LESSON_ICONS: Record<string, React.ElementType> = {
  video: Video,
  text: FileText,
  pdf: FileText,
  quiz: ClipboardList,
};

function CourseDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#ffdb33] border-b-[4px] border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 animate-pulse">
              <div className="h-8 w-24 bg-black/10 rounded mb-6" />
              <div className="h-14 w-3/4 bg-black/10 rounded mb-6" />
              <div className="h-6 w-full max-w-2xl bg-black/10 rounded mb-4" />
              <div className="h-6 w-2/3 bg-black/10 rounded" />
            </div>
            <div className="lg:col-span-1 animate-pulse">
              <div className="bg-white border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000]">
                <div className="aspect-video bg-gray-200 mb-6 border-[3px] border-black" />
                <div className="h-12 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [buying, setBuying] = useState(false);
  const [progress, setProgress] = useState<any>(null);
  const [hasScormPackage, setHasScormPackage] = useState(false);

  const slug = params.slug as string;

  useEffect(() => {
    if (slug) loadCourse();
  }, [slug]);

  useEffect(() => {
    if (course && user) checkEnrollment();
  }, [course, user]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      setHasScormPackage(false);

      const fullCourse = (await coursesApi.get(slug)) as Course;

      try {
        const instructors = await courseInstructorsApi.list(fullCourse.id);
        setCourse({ ...fullCourse, instructors });
      } catch {
        setCourse(fullCourse);
      }

      scormApi
        .getPackageByCourse(fullCourse.id)
        .then(() => setHasScormPackage(true))
        .catch(() => {});
    } catch (error) {
      console.error('Failed to load course:', error);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!course || !user) return;
    try {
      const result = await enrollmentsApi.check(course.id);
      setEnrolled((result as any).isEnrolled);
      if ((result as any).isEnrolled) {
        const progressData = await progressApi.getCourseProgress(course.id);
        setProgress(progressData);
      }
    } catch (error) {
      console.error('Failed to check enrollment:', error);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      setEnrolling(true);
      await enrollmentsApi.enroll(course!.id);
      setEnrolled(true);
      const progressData = await progressApi.getCourseProgress(course!.id);
      setProgress(progressData);
    } catch (error: any) {
      alert(error.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      setBuying(true);
      const payment = (await paymentsApi.create(course!.id)) as { id: string };
      router.push(`/payment/${payment.id}`);
    } catch (error: any) {
      alert(error.message || 'Failed to create payment');
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <CourseDetailSkeleton />;

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Course not found</p>
      </div>
    );
  }

  const isFreeCourse = course.isFree ?? course.is_free ?? false;

  const firstPublishedLesson = course.sections
    ?.flatMap((s) => s.lessons || [])
    .find((l) => l.is_published);

  const resumeLessonId = useMemo(
    () => getResumeLessonId(course.sections, progress?.lessons),
    [course.sections, progress?.lessons]
  );

  const learningHref = resumeLessonId
    ? `/courses/${course.slug}/learn/${resumeLessonId}`
    : firstPublishedLesson
      ? `/courses/${course.slug}/learn/${firstPublishedLesson.id}`
      : null;

  const instructorProfiles =
    course.instructors && course.instructors.length > 0
      ? course.instructors.map((i) => ({
          id: i.profile.id,
          full_name: i.profile.fullName,
          avatar_url: i.profile.avatarUrl,
        }))
      : course.instructor
        ? [
            {
              id: course.instructor.id,
              full_name: course.instructor.full_name,
              avatar_url: course.instructor.avatar_url,
            },
          ]
        : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-[#ffdb33] border-b-[4px] border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 flex flex-col justify-center">
              <nav
                className="text-sm text-black font-bold mb-6"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                <Link
                  href="/courses"
                  className="hover:underline flex-inline items-center bg-white border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_#000]"
                >
                  Courses
                </Link>
                {course.category && (
                  <>
                    <span className="mx-3 text-lg font-black">/</span>
                    <span className="bg-white border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_#000]">
                      {course.category.name}
                    </span>
                  </>
                )}
              </nav>

              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-black text-black mb-6 leading-tight tracking-tight"
                style={{ fontFamily: 'var(--font-archivo-black)' }}
              >
                {course.title}
              </h1>

              {course.description && (
                <p
                  className="text-xl text-gray-900 mb-8 font-medium max-w-2xl"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {course.description}
                </p>
              )}

              <div
                className="flex items-center gap-4 text-sm font-bold text-black"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                <span className="capitalize px-3 py-1 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  {course.level}
                </span>
                {instructorProfiles.length > 0 && (
                  <>
                    <span className="text-xl">&bull;</span>
                    {instructorProfiles.map((profile) => (
                      <span key={profile.id} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full border-2 border-black overflow-hidden bg-white">
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              {(profile.full_name ?? '?')[0]}
                            </div>
                          )}
                        </div>
                        <span className="text-lg bg-white border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_#000]">
                          {profile.full_name}
                        </span>
                      </span>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Sidebar Card */}
            <div className="lg:col-span-1">
              <div className="bg-white border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000]">
                <div className="aspect-video bg-gray-200 mb-6 border-[3px] border-black overflow-hidden relative">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {enrolled ? (
                  <div>
                    {progress && (
                      <div className="mb-6">
                        <div
                          className="flex justify-between text-sm mb-2 font-bold"
                          style={{ fontFamily: 'var(--font-space-grotesk)' }}
                        >
                          <span className="text-black">Progress</span>
                          <span className="text-black">{progress.completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-white border-[3px] border-black h-4 shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                          <div
                            className="bg-green-400 h-full border-r-[3px] border-black"
                            style={{ width: `${progress.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {hasScormPackage ? (
                      <Button
                        asChild
                        size="lg"
                        className="w-full bg-[#ffdb33] text-black border-[3px] border-black hover:bg-[#ffd000] shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all font-black text-lg"
                      >
                        <Link href={`/courses/${course.slug}/scorm`}>Launch SCORM Course</Link>
                      </Button>
                    ) : learningHref ? (
                      <Button
                        asChild
                        size="lg"
                        className="w-full bg-[#ffdb33] text-black border-[3px] border-black hover:bg-[#ffd000] shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all font-black text-lg"
                      >
                        <Link href={learningHref}>
                          Continue Learning
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        disabled
                        size="lg"
                        className="w-full bg-gray-200 text-gray-500 border-[3px] border-gray-400 font-black text-lg cursor-not-allowed"
                      >
                        No lessons available
                      </Button>
                    )}
                  </div>
                ) : (
                  <div>
                    {isFreeCourse ? (
                      <Button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        size="lg"
                        className="w-full bg-[#ffdb33] text-black border-[3px] border-black hover:bg-[#ffd000] shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all font-black text-lg disabled:opacity-50"
                      >
                        {enrolling ? 'Enrolling...' : 'Enroll for Free'}
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="text-center pt-2">
                          <span
                            className="text-4xl font-black text-black"
                            style={{ fontFamily: 'var(--font-archivo-black)' }}
                          >
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(course.price)}
                          </span>
                        </div>
                        <Button
                          onClick={handleBuyNow}
                          disabled={buying}
                          size="lg"
                          className="w-full bg-black text-white border-[3px] border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all font-black text-lg disabled:opacity-50 disabled:translate-y-0 disabled:translate-x-0 disabled:shadow-none"
                        >
                          {buying ? 'Processing...' : 'Buy Now'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2
          className="text-3xl md:text-4xl font-black text-black mb-10"
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          Curriculum
        </h2>
        {course.sections && course.sections.length > 0 ? (
          <div className="space-y-8">
            {course.sections
              .sort((a, b) => a.order_index - b.order_index)
              .map((section, index) => (
                <div
                  key={section.id}
                  className="bg-white border-[4px] border-black shadow-[6px_6px_0px_0px_#000]"
                >
                  <div className="px-6 py-5 bg-[#ffdb33] border-b-[4px] border-black flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span
                        className="font-black text-2xl"
                        style={{ fontFamily: 'var(--font-archivo-black)' }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3
                        className="font-black text-xl text-black"
                        style={{ fontFamily: 'var(--font-space-grotesk)' }}
                      >
                        {section.title}
                      </h3>
                    </div>
                    <span
                      className="text-sm font-bold bg-white border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_#000]"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}
                    >
                      {section.lessons?.length || 0} lessons
                    </span>
                  </div>
                  <div className="divide-y-[3px] divide-black">
                    {(section.lessons || [])
                      .sort((a, b) => a.order_index - b.order_index)
                      .map((lesson) => {
                        const LessonIcon = LESSON_ICONS[lesson.type] || BookOpen;
                        return (
                          <div
                            key={lesson.id}
                            className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center shadow-[2px_2px_0px_0px_#000] flex-shrink-0">
                                <LessonIcon className="w-5 h-5 text-black" />
                              </div>
                              <div className="flex flex-col">
                                <span
                                  className="text-black font-bold text-lg leading-tight mb-1"
                                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                                >
                                  {lesson.title}
                                </span>
                                {lesson.is_preview && (
                                  <span className="inline-block text-xs font-black bg-green-400 text-black px-2 py-0.5 border-2 border-black max-w-max">
                                    PREVIEW
                                  </span>
                                )}
                              </div>
                            </div>
                            <div
                              className="flex items-center gap-4 text-sm font-bold text-black"
                              style={{ fontFamily: 'var(--font-space-grotesk)' }}
                            >
                              {lesson.duration_mins && (
                                <span className="px-3 py-1 bg-gray-100 border-2 border-black">
                                  {lesson.duration_mins} min
                                </span>
                              )}
                              {lesson.is_published && (enrolled || lesson.is_preview) ? (
                                <Link
                                  href={`/courses/${course.slug}/learn/${lesson.id}`}
                                  className="bg-black text-white px-4 py-2 border-[2px] border-black hover:bg-gray-800 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#ffdb33] transition-all"
                                >
                                  Start
                                </Link>
                              ) : lesson.is_published ? (
                                <Lock className="w-5 h-5 text-gray-400" />
                              ) : (
                                <span className="px-4 py-2 bg-gray-100 text-gray-500 border-[2px] border-gray-300 font-bold cursor-not-allowed">
                                  Coming soon
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">No curriculum available yet</div>
        )}
      </div>

      {/* Reviews */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <CourseReviewSection
          courseId={course.id}
          enrolled={enrolled}
          currentUserId={user?.id}
        />
      </div>
    </div>
  );
}
