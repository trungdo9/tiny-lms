import { Page } from '@playwright/test';
import { API_URL } from '../fixtures';
import { getAuthToken } from './instructor-auth';

export async function deleteQuizByLessonId(page: Page, lessonId: string) {
  const token = await getAuthToken(page);
  if (!token) return;
  const res = await page.request.get(`${API_URL}/lessons/${lessonId}/quizzes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) return;
  const quiz = await res.json();
  if (!quiz?.id) return;
  await page.request.delete(`${API_URL}/quizzes/${quiz.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteCourseByTitle(page: Page, titleFragment: string) {
  const token = await getAuthToken(page);
  if (!token) return;
  const res = await page.request.get(`${API_URL}/instructor/courses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) return;
  const data = await res.json();
  const courses = Array.isArray(data) ? data : (data.data || []);
  const course = courses.find((c: any) => c.title?.includes(titleFragment));
  if (!course?.id) return;
  await page.request.delete(`${API_URL}/courses/${course.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
