'use client';

import { AuthProvider } from '@/lib/auth-context';
import { PublicHeader, PublicFooter } from '@/components/layout/public';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
    <div className= "min-h-screen bg-white flex flex-col" >
    <PublicHeader />
    < main className = "flex-1" > { children } </main>
      < PublicFooter />
      </div>
      </AuthProvider>
  );
}
