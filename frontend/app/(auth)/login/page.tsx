'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { usersApi } from '@/lib/api';
import { Button } from '@/components/retroui/Button';

function getRedirectPath(role: string): string {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'instructor') return '/dashboard';
  return '/profile';
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    try {
      const profile = await usersApi.getMe() as { role: string };
      router.push(getRedirectPath(profile.role || 'student'));
    } catch {
      router.push('/profile');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#ffdb33]">
      {/* Dot pattern background */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, black 2px, transparent 2px),
                            radial-gradient(circle at 75% 75%, black 2px, transparent 2px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-md w-full mx-4">
        {/* Brand badge */}
        <div className="inline-block bg-black text-white px-4 py-1 mb-4 font-mono text-sm">
          Tiny LMS • Sign In
        </div>

        {/* Card */}
        <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_#000] p-8">
          <h1
            className="text-3xl font-black mb-6 text-black"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Welcome Back
          </h1>

          {/* Error box */}
          {error && (
            <div
              role="alert"
              className="mb-4 p-3 bg-red-400 text-black border-[2px] border-black shadow-[2px_2px_0px_0px_#000] text-sm font-medium"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-black mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border-[2px] border-black focus:outline-none focus:ring-[3px] focus:ring-black bg-white text-black placeholder:text-gray-400"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-black mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border-[2px] border-black focus:outline-none focus:ring-[3px] focus:ring-black bg-white text-black"
                placeholder="••••••••"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              size="lg"
              variant="ghost"
              className="w-full bg-[#ffdb33] text-black border-[3px] border-black
                         shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000]
                         hover:bg-[#ffd000] hover:translate-x-[-2px] hover:translate-y-[-2px]
                         transition-all font-bold justify-center
                         disabled:opacity-50 disabled:cursor-not-allowed
                         disabled:hover:translate-x-0 disabled:hover:translate-y-0
                         disabled:hover:shadow-[4px_4px_0px_0px_#000]"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Sign-up link */}
          <p className="mt-6 text-center text-sm text-gray-700">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-black underline hover:no-underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
