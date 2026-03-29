'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

interface QuestionBank {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  course?: { title: string };
  _count?: { questions: number };
}

interface Course {
  id: string;
  title: string;
}

async function fetchQuestionBanks() {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/question-banks`,
    {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    }
  );
  if (!response.ok) throw new Error('Failed to fetch question banks');
  return response.json();
}

async function fetchCourses(): Promise<Course[]> {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/courses/instructor`,
    {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    }
  );
  if (!response.ok) throw new Error('Failed to fetch courses');
  return response.json();
}

export default function QuestionBanksPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newBank, setNewBank] = useState({ title: '', description: '', courseId: '' });
  const [error, setError] = useState('');

  const { data: banks = [], isLoading } = useQuery<QuestionBank[]>({
    queryKey: queryKeys.questionBanks.list(),
    queryFn: fetchQuestionBanks,
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: queryKeys.courses.instructor(),
    queryFn: fetchCourses,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; courseId: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/question-banks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error('Failed to create question bank');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questionBanks.list() });
      setShowCreate(false);
      setNewBank({ title: '', description: '', courseId: '' });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newBank);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Question Banks</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Question Bank
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
        )}

        {showCreate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Create Question Bank</h2>
              <form onSubmit={handleCreate}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={newBank.title}
                    onChange={(e) => setNewBank({ ...newBank, title: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={newBank.description}
                    onChange={(e) => setNewBank({ ...newBank, description: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Course</label>
                  <select
                    value={newBank.courseId}
                    onChange={(e) => setNewBank({ ...newBank, courseId: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banks.map((bank) => (
            <div key={bank.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-2">{bank.title}</h3>
              {bank.description && (
                <p className="text-gray-600 text-sm mb-3">{bank.description}</p>
              )}
              <p className="text-sm text-gray-500 mb-4">
                Course: {bank.course?.title || 'N/A'}
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/admin/question-banks/${bank.id}`}
                  className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
                >
                  View Questions
                </Link>
                <Link
                  href={`/admin/question-banks/${bank.id}/import`}
                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
                >
                  Import
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
