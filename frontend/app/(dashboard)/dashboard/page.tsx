'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { reportsApi } from '@/lib/api';
import { StatCardSkeleton, ListSkeleton } from './dashboard-ui';
import { StudentDashboard } from './student-dashboard';
import { InstructorDashboard } from './instructor-dashboard';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UserProfile {
  id: string;
  role: string;
}

async function fetchWithAuth(path: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

export default function DashboardPage() {
  const [months, setMonths] = useState(6);

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: queryKeys.profile(),
    queryFn: () => fetchWithAuth('/users/me'),
  });

  const { data: studentData, isLoading: studentLoading } = useQuery({
    queryKey: ['dashboard', 'student'],
    queryFn: () => fetchWithAuth('/users/me/dashboard'),
    enabled: profile?.role === 'student',
  });

  const { data: instructorData, isLoading: instructorLoading } = useQuery({
    queryKey: ['dashboard', 'instructor'],
    queryFn: () => fetchWithAuth('/reports/dashboard'),
    enabled: profile?.role === 'instructor' || profile?.role === 'admin',
  });

  const { data: instructorTrends } = useQuery({
    queryKey: queryKeys.instructorReports.trends(months),
    queryFn: () => reportsApi.instructorTrends(months),
    enabled: profile?.role === 'instructor' || profile?.role === 'admin',
  });

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="h-6 w-32 bg-gray-100 rounded mb-6" />
              <ListSkeleton />
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="h-6 w-40 bg-gray-100 rounded mb-6" />
              <ListSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userRole = profile?.role || 'student';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {userRole === 'instructor' || userRole === 'admin' ? (
        <InstructorDashboard
          data={instructorData}
          isLoading={instructorLoading && !instructorData}
          trends={instructorTrends}
          months={months}
          onMonthsChange={setMonths}
        />
      ) : (
        <StudentDashboard
          data={studentData}
          isLoading={studentLoading && !studentData}
        />
      )}
    </div>
  );
}
