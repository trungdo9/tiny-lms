'use client';

import { AuthProvider } from '@/lib/auth-context';
import { DashboardHeader, DashboardFooter } from '@/components/layout/dashboard';
import { ProtectedRoute } from '@/components/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
    <ProtectedRoute>
    <div className= "min-h-screen bg-gray-50 flex flex-col" >
    <DashboardHeader />
    < main className = "flex-1" > { children } </main>
      < DashboardFooter />
      </div>
      </ProtectedRoute>
      </AuthProvider>
  );
}
