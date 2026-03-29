'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseInstructorsApi, usersApi, CourseInstructor, UserSearchResult } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';

interface InstructorManagerProps {
  courseId: string;
}

export function InstructorManager({ courseId }: InstructorManagerProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchError, setSearchError] = useState('');

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Current user profile (for role + id)
  const { data: me } = useQuery({
    queryKey: queryKeys.profile(),
    queryFn: usersApi.getMe as () => Promise<{ id: string; role: string }>,
  });

  // Current instructors list
  const { data: instructors = [], isLoading } = useQuery({
    queryKey: queryKeys.courseInstructors.list(courseId),
    queryFn: () => courseInstructorsApi.list(courseId),
  });

  // Search users
  const { data: searchData, isFetching: searching } = useQuery({
    queryKey: queryKeys.users.search(debouncedQuery, 'instructor'),
    queryFn: () => usersApi.search(debouncedQuery, 'instructor'),
    enabled: debouncedQuery.length >= 2,
    staleTime: 0,
  });
  const searchResults: UserSearchResult[] = searchData?.users ?? [];

  const currentUserId = me?.id;
  const currentUserRole = me?.role ?? 'student';

  const isPrimaryOrAdmin =
    currentUserRole === 'admin' ||
    instructors.some(i => i.profile.id === currentUserId && i.role === 'primary');

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: (userId: string) =>
      courseInstructorsApi.assign(courseId, { userId, role: 'co_instructor' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courseInstructors.list(courseId) });
      setSearchQuery('');
      setDebouncedQuery('');
    },
    onError: (err: Error) => setSearchError(err.message),
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: (userId: string) => courseInstructorsApi.remove(courseId, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.courseInstructors.list(courseId) }),
    onError: (err: Error) => alert(err.message),
  });

  if (!isPrimaryOrAdmin) return null;

  if (isLoading) return <p className="text-sm text-gray-500">Loading instructors...</p>;

  const assignedIds = new Set(instructors.map(i => i.profile.id));
  const filteredResults = searchResults.filter(u => !assignedIds.has(u.id));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Instructors</h3>

      {/* Current instructors list */}
      <ul className="space-y-2">
        {instructors.map((instructor: CourseInstructor) => (
          <li key={instructor.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              {instructor.profile.avatarUrl && (
                <img src={instructor.profile.avatarUrl} className="w-7 h-7 rounded-full" alt="" />
              )}
              <span className="font-medium text-sm">
                {instructor.profile.fullName ?? instructor.profile.email}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${
                instructor.role === 'primary'
                  ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
                  : 'bg-gray-100 border-gray-300 text-gray-600'
              }`}>
                {instructor.role === 'primary' ? 'Primary' : 'Co-instructor'}
              </span>
            </div>
            {instructor.role !== 'primary' && (
              <button
                onClick={() => removeMutation.mutate(instructor.profile.id)}
                disabled={removeMutation.isPending}
                className="text-red-500 text-sm hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Search + assign */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search instructor by name or email..."
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setSearchError(''); }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
        />
        {searching && (
          <span className="absolute right-3 top-2.5 text-xs text-gray-400">Searching...</span>
        )}
        {debouncedQuery.length >= 2 && filteredResults.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border rounded-lg shadow-md mt-1 max-h-48 overflow-auto">
            {filteredResults.map(user => (
              <li
                key={user.id}
                onClick={() => assignMutation.mutate(user.id)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center gap-2"
              >
                {user.avatarUrl && <img src={user.avatarUrl} className="w-6 h-6 rounded-full" alt="" />}
                <span>{user.fullName ?? user.email}</span>
                <span className="text-gray-400 text-xs">{user.email}</span>
              </li>
            ))}
          </ul>
        )}
        {debouncedQuery.length >= 2 && !searching && filteredResults.length === 0 && (
          <p className="absolute w-full bg-white border rounded-lg shadow-md mt-1 px-3 py-2 text-sm text-gray-500">
            No instructors found
          </p>
        )}
      </div>
      {searchError && <p className="text-red-600 text-sm">{searchError}</p>}
    </div>
  );
}
