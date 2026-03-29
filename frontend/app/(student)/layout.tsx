'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/lib/auth-context';
import { PublicHeader, PublicFooter } from '@/components/layout/public';
import { ProtectedRoute } from '@/components/auth';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Hide the header and footer inside the immersive Learning UI
  const isLearningView = pathname?.includes('/learn/');

  return (
    <AuthProvider>
    <ProtectedRoute>
    <div className= "min-h-screen bg-white flex flex-col" >
    {!isLearningView && <PublicHeader />
}
<main className="flex-1" > { children } </main>
{ !isLearningView && <PublicFooter /> }
</div>
  </ProtectedRoute>
  </AuthProvider>
  );
}
