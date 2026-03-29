'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider } from '@/lib/auth-context';
import { authApi } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/retroui/Button';
import { Mail } from 'lucide-react';

const DOT_PATTERN = {
  backgroundImage: `radial-gradient(circle at 25% 25%, black 2px, transparent 2px),
                    radial-gradient(circle at 75% 75%, black 2px, transparent 2px)`,
  backgroundSize: '40px 40px',
};

function PageShell({ badge, children }: { badge: string; children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#ffdb33]">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={DOT_PATTERN} />
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="inline-block bg-black text-white px-4 py-1 mb-4 font-mono text-sm">
          {badge}
        </div>
        {children}
      </div>
    </div>
  );
}

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authApi.register({ email, password, fullName });

      if (result.requiresVerification) {
        setRequiresVerification(true);
        return;
      }

      if (result.session?.access_token) {
        await supabase.auth.signInWithPassword({ email, password });
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (requiresVerification) {
    return (
      <PageShell badge="Tiny LMS">
        <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_#000] p-8 text-center">
          <div className="w-16 h-16 bg-[#ffdb33] border-2 border-black flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-black" />
          </div>
          <h1
            className="text-3xl font-black mb-4 text-black"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Verify your email
          </h1>
          <p className="text-black font-medium mb-2 leading-relaxed">
            We sent a verification link to <strong>{email}</strong>.
          </p>
          <p className="text-gray-600 text-sm mb-6">
            Please check your inbox and click the link to activate your account.
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#ffdb33] text-black border-[3px] border-black px-6 py-2 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:bg-[#ffd000] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all font-bold"
          >
            Back to Sign In
          </Link>
        </div>
      </PageShell>
    );
  }

  if (success) {
    return (
      <PageShell badge="Tiny LMS &bull; Success">
        <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_#000] p-8 text-center">
          <div className="w-16 h-16 bg-[#ffdb33] border-2 border-black flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-black" />
          </div>
          <h1
            className="text-3xl font-black mb-4 text-black"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Check your email
          </h1>
          <p className="text-black font-medium mb-6 leading-relaxed">
            We sent a confirmation link to your email address. Please check your inbox and click the
            link to activate your account.
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#ffdb33] text-black border-[3px] border-black px-6 py-2 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:bg-[#ffd000] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all font-bold"
          >
            Back to Sign In
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell badge="Tiny LMS &bull; Sign Up">
      <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_#000] p-8">
        <h1
          className="text-3xl font-black mb-6 text-black"
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          Create Account
        </h1>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-400 text-black border-[2px] border-black shadow-[2px_2px_0px_0px_#000] text-sm font-medium"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-bold text-black mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-3 py-2 border-[2px] border-black focus:outline-none focus:ring-[3px] focus:ring-black bg-white text-black placeholder:text-gray-400"
              placeholder="John Doe"
            />
          </div>

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
              minLength={6}
              className="w-full px-3 py-2 border-[2px] border-black focus:outline-none focus:ring-[3px] focus:ring-black bg-white text-black"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            variant="ghost"
            className="w-full mt-2 bg-[#ffdb33] text-black border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:bg-[#ffd000] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all font-bold justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_#000]"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-700">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-black underline hover:no-underline">
            Sign in
          </Link>
        </p>
      </div>
    </PageShell>
  );
}

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  );
}
