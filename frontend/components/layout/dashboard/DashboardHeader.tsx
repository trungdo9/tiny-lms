'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { NotificationBell } from './NotificationBell';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';

interface Profile {
  id: string;
  fullName?: string;
  role: string;
}

const studentLinks = [
  { href: '/courses', label: 'Explore Courses' },
  { href: '/learning-paths', label: 'Learning Paths' },
  { href: '/quizzes', label: 'Quizzes' },
  { href: '/certificates', label: 'Certificates' },
];

const instructorLinks = [
  { href: '/instructor/courses', label: 'Courses' },
  { href: '/instructor/learning-paths', label: 'Learning Paths' },
  { href: '/instructor/quizzes', label: 'Quizzes' },
  { href: '/instructor/quizzes/grading', label: 'Grading' },
  { href: '/instructor/question-banks', label: 'Banks' },
  { href: '/instructor/flash-cards', label: 'Flash Cards' },
  { href: '/instructor/reports/quizzes', label: 'Reports' },
];

const adminLinks = [
  { href: '/admin/dashboard', label: 'Admin Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/learning-paths', label: 'Learning Paths' },
  { href: '/admin/settings', label: 'Settings' },
];

const adminCourseLinks = [
  { href: '/admin/courses', label: 'Courses' },
  { href: '/admin/quizzes', label: 'Quizzes' },
  { href: '/admin/quizzes/grading', label: 'Grading' },
  { href: '/admin/question-banks', label: 'Banks' },
  { href: '/admin/flash-cards', label: 'Flash Cards' },
  { href: '/admin/reports/quizzes', label: 'Reports' },
];

export function DashboardHeader() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminCoursesOpen, setAdminCoursesOpen] = useState(false);
  const [mobileAdminCoursesOpen, setMobileAdminCoursesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const adminCoursesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (adminCoursesRef.current && !adminCoursesRef.current.contains(event.target as Node)) {
        setAdminCoursesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: profile, isLoading: loading } = useQuery<Profile>({
    queryKey: queryKeys.profile(),
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/me`,
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isInstructor = profile?.role === 'instructor' || profile?.role === 'admin';
  const isAdmin = profile?.role === 'admin';
  const homeHref = isAdmin ? '/admin/dashboard' : '/dashboard';
  const roleBadge = isAdmin ? 'Admin' : profile?.role === 'instructor' ? 'Instructor' : 'Learning';
  const navLinks = isAdmin
    ? adminLinks
    : isInstructor
      ? instructorLinks
      : studentLinks;

  const navLinkClass =
    'text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md transition-colors';
  const mobileNavLinkClass =
    'block text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2.5 rounded-md transition-colors';

  return (
    <header className="bg-slate-900 shadow-sm border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link
              href={homeHref}
              className="text-xl font-bold text-white tracking-tight hover:text-amber-400 transition-colors"
            >
              TinyLMS
              <span className="text-amber-400 font-medium text-sm ml-1 px-2 py-0.5 bg-slate-800 rounded-md">
                {roleBadge}
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 overflow-visible whitespace-nowrap ml-8 relative z-10">
            {loading ? (
              <div className="flex gap-4">
                <div className="w-24 h-8 bg-slate-800 rounded animate-pulse" />
                <div className="w-24 h-8 bg-slate-800 rounded animate-pulse" />
              </div>
            ) : (
              <>
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className={navLinkClass}>
                    {link.label}
                  </Link>
                ))}

                {isAdmin && (
                  <div className="relative" ref={adminCoursesRef}>
                    <button
                      onClick={() => setAdminCoursesOpen((prev) => !prev)}
                      className={`${navLinkClass} inline-flex items-center gap-1`}
                    >
                      Course Management
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${adminCoursesOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {adminCoursesOpen && (
                      <div className="absolute left-0 mt-2 w-56 rounded-lg border border-slate-700 bg-slate-900 shadow-xl py-2 z-[60]">
                        {adminCourseLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                            onClick={() => setAdminCoursesOpen(false)}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-slate-400 hover:text-white transition-colors">
              <NotificationBell />
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-full transition-colors outline-none"
              >
                <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center overflow-hidden">
                  <span className="text-xs font-bold text-slate-900">
                    {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-200">
                  {profile?.fullName || 'User'}
                </span>
                <span className="text-xs text-slate-400 ml-1">&#x25BC;</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-[60]">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                  <div className="h-px bg-gray-100 my-1" />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={mobileNavLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {isAdmin && (
            <div className="pt-1">
              <button
                onClick={() => setMobileAdminCoursesOpen((prev) => !prev)}
                className="w-full flex items-center justify-between text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2.5 rounded-md transition-colors"
              >
                <span>Course Management</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${mobileAdminCoursesOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {mobileAdminCoursesOpen && (
                <div className="mt-1 ml-3 border-l border-slate-700 pl-2 space-y-1">
                  {adminCourseLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={mobileNavLinkClass}
                      onClick={() => {
                        setMobileAdminCoursesOpen(false);
                        setMobileMenuOpen(false);
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
