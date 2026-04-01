'use client';

import { CreateCourseForm } from '@/components/course/CreateCourseForm';

export default function CreateCoursePage() {
  return <CreateCourseForm redirectTo="/instructor/courses/${course.id}" />;
}
