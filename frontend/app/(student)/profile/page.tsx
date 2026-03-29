'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { BookOpen, BarChart3, ClipboardList, User } from 'lucide-react';
import { ProfileSkeleton } from './profile-skeleton';
import { ProfileEditForm } from './profile-edit-form';

interface Profile {
  id: string;
  email: string;
  fullName?: string;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
}

async function fetchProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/me`,
    { headers: { Authorization: `Bearer ${session?.access_token}` } }
  );
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
}

const QUICK_LINKS = [
  { href: '/dashboard', label: 'My Courses', bg: 'bg-blue-300', Icon: BookOpen },
  { href: '/dashboard', label: 'My Progress', bg: 'bg-green-400', Icon: BarChart3 },
  { href: '/profile/history', label: 'Quiz History', bg: 'bg-purple-400', Icon: ClipboardList },
];

export default function ProfilePage() {
  const { data: profile, isLoading, error } = useQuery<Profile>({
    queryKey: queryKeys.profile(),
    queryFn: fetchProfile,
  });

  if (isLoading) return <ProfileSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#ffdb33] p-8 font-medium" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 p-6 bg-red-400 border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black font-bold text-xl">
            {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ffdb33] p-8 font-medium" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black mb-2 text-black border-b-[4px] border-black pb-4" style={{ fontFamily: 'var(--font-archivo-black)' }}>
          My Profile
        </h1>
        <p className="text-black mb-8 font-bold">Manage your profile information</p>

        {/* Profile Info */}
        <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-10 transition-transform hover:-translate-y-1">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-[#ffdb33] border-[3px] border-black rounded-full flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {profile?.fullName ? (
                <span className="text-4xl font-black text-black" style={{ fontFamily: 'var(--font-archivo-black)' }}>
                  {profile.fullName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-10 h-10 text-black" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-black mb-1" style={{ fontFamily: 'var(--font-archivo-black)' }}>
                {profile?.fullName || 'No name set'}
              </h2>
              <p className="text-black font-bold text-lg mb-2">{profile?.email}</p>
              <span className="inline-block px-3 py-1 bg-black text-[#ffdb33] font-bold text-sm uppercase translate-y-1">
                {profile?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-10 transition-transform hover:-translate-y-1">
          <h2 className="text-2xl font-black text-black mb-6" style={{ fontFamily: 'var(--font-archivo-black)' }}>
            Quick Links
          </h2>
          <div className="flex flex-wrap gap-4">
            {QUICK_LINKS.map(({ href, label, bg, Icon }) => (
              <Link
                key={label}
                href={href}
                className={`${bg} px-6 py-3 border-[3px] border-black text-black font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2`}
                style={{ fontFamily: 'var(--font-archivo-black)' }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Edit Form */}
        <ProfileEditForm
          initialData={{
            fullName: profile?.fullName || '',
            bio: profile?.bio || '',
            phone: profile?.phone || '',
          }}
        />
      </div>
    </div>
  );
}
