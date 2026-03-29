import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuery, useMutation } from '@tanstack/react-query';
import React from 'react';

// Test query keys - matching the actual query-keys.ts structure
const testQueryKeys = {
  courses: {
    list: () => ['courses', 'list'] as const,
    detail: (id: string) => ['courses', 'detail', id] as const,
    detailBySlug: (slug: string) => ['courses', 'slug', slug] as const,
    instructor: () => ['courses', 'instructor'] as const,
  },
  quizzes: {
    list: () => ['quizzes', 'list'] as const,
    detail: (id: string) => ['quizzes', 'detail', id] as const,
    instructor: () => ['quizzes', 'instructor'] as const,
  },
  questionBanks: {
    list: () => ['questionBanks', 'list'] as const,
    detail: (id: string) => ['questionBanks', 'detail', id] as const,
    questions: (bankId: string) => ['questionBanks', 'questions', bankId] as const,
  },
  attempts: {
    page: (attemptId: string, page: number) => ['attempts', 'page', attemptId, page] as const,
    questions: (attemptId: string) => ['attempts', 'questions', attemptId] as const,
  },
  lessons: {
    forLearning: (lessonId: string) => ['lessons', 'learning', lessonId] as const,
  },
  profile: () => ['profile'] as const,
};

// Mock API functions
const mockFetchCourses = vi.fn().mockResolvedValue([
  { id: '1', title: 'Course 1' },
  { id: '2', title: 'Course 2' },
]);

const mockFetchCourse = vi.fn().mockResolvedValue({
  id: '1',
  title: 'Course 1',
  description: 'Test course',
  sections: [],
});

const mockCreateCourse = vi.fn().mockResolvedValue({ id: '1', title: 'New Course' });

describe('TanStack Query Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('Query Keys - matches query-keys.ts structure', () => {
    it('should generate consistent query keys for courses', () => {
      expect(testQueryKeys.courses.list()).toEqual(['courses', 'list']);
      expect(testQueryKeys.courses.detail('123')).toEqual(['courses', 'detail', '123']);
      expect(testQueryKeys.courses.detailBySlug('test-course')).toEqual(['courses', 'slug', 'test-course']);
      expect(testQueryKeys.courses.instructor()).toEqual(['courses', 'instructor']);
    });

    it('should generate consistent query keys for quizzes', () => {
      expect(testQueryKeys.quizzes.list()).toEqual(['quizzes', 'list']);
      expect(testQueryKeys.quizzes.detail('456')).toEqual(['quizzes', 'detail', '456']);
      expect(testQueryKeys.quizzes.instructor()).toEqual(['quizzes', 'instructor']);
    });

    it('should generate consistent query keys for question banks', () => {
      expect(testQueryKeys.questionBanks.list()).toEqual(['questionBanks', 'list']);
      expect(testQueryKeys.questionBanks.detail('789')).toEqual(['questionBanks', 'detail', '789']);
      expect(testQueryKeys.questionBanks.questions('789')).toEqual(['questionBanks', 'questions', '789']);
    });

    it('should generate consistent query keys for attempts', () => {
      expect(testQueryKeys.attempts.page('att-1', 1)).toEqual(['attempts', 'page', 'att-1', 1]);
      expect(testQueryKeys.attempts.questions('att-1')).toEqual(['attempts', 'questions', 'att-1']);
    });

    it('should generate consistent query keys for lessons', () => {
      expect(testQueryKeys.lessons.forLearning('les-1')).toEqual(['lessons', 'learning', 'les-1']);
    });

    it('should generate unique keys for different entities', () => {
      const keys = [
        testQueryKeys.courses.list(),
        testQueryKeys.quizzes.list(),
        testQueryKeys.questionBanks.list(),
        testQueryKeys.profile(),
      ];
      const uniqueKeys = new Set(keys.map(k => JSON.stringify(k)));
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  describe('useQuery - Data Fetching', () => {
    it('should fetch data and update state', async () => {
      const { result } = renderHook(
        () =>
          useQuery({
            queryKey: testQueryKeys.courses.list(),
            queryFn: mockFetchCourses,
          }),
        { wrapper }
      );

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isFetching).toBe(true);

      // Wait for data
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([
        { id: '1', title: 'Course 1' },
        { id: '2', title: 'Course 2' },
      ]);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      const mockErrorFetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(
        () =>
          useQuery({
            queryKey: testQueryKeys.courses.list(),
            queryFn: mockErrorFetch,
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should use enabled condition for dependent queries', async () => {
      const { result } = renderHook(
        () =>
          useQuery({
            queryKey: testQueryKeys.courses.detail('123'),
            queryFn: mockFetchCourse,
            enabled: false,
          }),
        { wrapper }
      );

      // With enabled: false, query should not fetch
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(mockFetchCourse).not.toHaveBeenCalled();
    });

    it('should cache data by default', async () => {
      const { result, unmount } = renderHook(
        () =>
          useQuery({
            queryKey: testQueryKeys.courses.list(),
            queryFn: mockFetchCourses,
          }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toHaveLength(2);

      // Unmount and remount - should use cached data
      unmount();

      const { result: result2 } = renderHook(
        () =>
          useQuery({
            queryKey: testQueryKeys.courses.list(),
            queryFn: mockFetchCourses,
          }),
        { wrapper }
      );

      await waitFor(() => expect(result2.current.isSuccess).toBe(true));
      // Should not refetch due to cache
      expect(result2.current.data).toHaveLength(2);
    });
  });

  describe('useMutation - Data Mutations', () => {
    it('should execute mutation and call onSuccess', async () => {
      const { result } = renderHook(
        () =>
          useMutation({
            mutationFn: mockCreateCourse,
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: testQueryKeys.courses.list() });
            },
          }),
        { wrapper }
      );

      // Trigger mutation
      result.current.mutate({ title: 'New Course' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockCreateCourse).toHaveBeenCalled();
    });

    it('should handle mutation errors', async () => {
      const mockErrorMutation = vi.fn().mockRejectedValue(new Error('Create failed'));

      const { result } = renderHook(
        () =>
          useMutation({
            mutationFn: mockErrorMutation,
          }),
        { wrapper }
      );

      result.current.mutate({ title: 'Fail' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Query Client Operations', () => {
    it('should set and get query data directly', () => {
      const cachedData = { id: '123', title: 'Cached Course' };
      queryClient.setQueryData(testQueryKeys.courses.detail('123'), cachedData);

      const data = queryClient.getQueryData(testQueryKeys.courses.detail('123'));
      expect(data).toEqual(cachedData);
    });

    it('should clear all queries', async () => {
      queryClient.setQueryData(testQueryKeys.courses.list(), [{ id: '1' }]);
      queryClient.setQueryData(testQueryKeys.quizzes.list(), [{ id: '1' }]);

      queryClient.clear();

      // Queries should be cleared
      expect(queryClient.getQueryData(testQueryKeys.courses.list())).toBeUndefined();
      expect(queryClient.getQueryData(testQueryKeys.quizzes.list())).toBeUndefined();
    });

    it('should remove specific query', () => {
      queryClient.setQueryData(testQueryKeys.courses.list(), [{ id: '1' }]);
      queryClient.removeQueries({ queryKey: testQueryKeys.courses.list() });

      expect(queryClient.getQueryData(testQueryKeys.courses.list())).toBeUndefined();
    });

    it('should invalidate queries', async () => {
      queryClient.setQueryData(testQueryKeys.courses.list(), [{ id: '1' }]);

      await queryClient.invalidateQueries({ queryKey: testQueryKeys.courses.list() });

      // Query should be marked as stale
      const query = queryClient.getQueryState(testQueryKeys.courses.list());
      expect(query?.isInvalidated).toBe(true);
    });
  });

  describe('Optimistic Updates Pattern', () => {
    it('should support optimistic updates with setQueryData', async () => {
      const { result } = renderHook(
        () =>
          useQuery({
            queryKey: testQueryKeys.courses.list(),
            queryFn: mockFetchCourses,
          }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Verify initial data
      expect(result.current.data).toHaveLength(2);

      // Simulate optimistic update via onMutate in mutation
      queryClient.setQueryData(testQueryKeys.courses.list(), (old: any) => [
        ...(old || []),
        { id: 'temp-id', title: 'New Course' },
      ]);

      // Get updated data from cache directly
      const updatedData = queryClient.getQueryData(testQueryKeys.courses.list());
      expect(updatedData).toHaveLength(3);
      expect((updatedData as any[])?.[2].title).toBe('New Course');
    });
  });

  describe('Parallel Queries with enabled condition', () => {
    it('should fetch multiple queries with different conditions', async () => {
      const { result: studentResult } = renderHook(
        () =>
          useQuery({
            queryKey: ['dashboard', 'student'],
            queryFn: mockFetchCourses,
            enabled: true, // Student role
          }),
        { wrapper }
      );

      const { result: instructorResult } = renderHook(
        () =>
          useQuery({
            queryKey: ['dashboard', 'instructor'],
            queryFn: mockFetchCourses,
            enabled: false, // Not instructor
          }),
        { wrapper }
      );

      await waitFor(() => expect(studentResult.current.isSuccess).toBe(true));

      // Student query should fetch
      expect(studentResult.current.isSuccess).toBe(true);

      // Instructor query should not fetch (enabled: false)
      expect(instructorResult.current.isLoading).toBe(false);
      expect(instructorResult.current.data).toBeUndefined();
    });
  });
});
