'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/lib/auth-context';
import { DashboardHeader, DashboardFooter } from '@/components/layout/dashboard';
import { ProtectedRoute } from '@/components/auth';
import { useAuth } from '@/lib/auth-context';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { supabase } from '@/lib/supabase';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery({
    queryKey: queryKeys.profile(),
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/me`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
    enabled: !!user && !authLoading,
    retry: false,
  });

  useEffect(() => {
    if (authLoading || profileLoading) return;

    if (profileError || !profile) {
      router.replace('/login');
      return;
    }

    if (profile.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [profile, authLoading, profileLoading, profileError, router]);

  if (authLoading || profileLoading || profileError || !profile || profile.role !== 'admin') {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
    <ProtectedRoute>
    <div className= "min-h-screen bg-gray-50 flex flex-col" >
    <DashboardHeader />
    < AdminGuard >
    <main className="flex-1" > { children } </main>
      </AdminGuard>
      < DashboardFooter />
      </div>
      </ProtectedRoute>
      </AuthProvider>
  );
}
