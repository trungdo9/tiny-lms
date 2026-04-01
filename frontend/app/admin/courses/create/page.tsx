'use client';

import { CreateCourseForm } from '@/components/course/CreateCourseForm';

export default function CreateCoursePage() {
  return <CreateCourseForm redirectTo="/admin/courses/${course.id}" />;
}
