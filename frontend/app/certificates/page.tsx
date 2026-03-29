'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

interface Certificate {
  id: string;
  issuedAt: string;
  certificateNumber?: string;
  course?: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string;
    instructor: { id: string; fullName: string; avatarUrl: string };
  } | null;
  learningPath?: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string;
  } | null;
}

async function fetchCertificates() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/certificates/my`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (!response.ok) throw new Error('Failed to fetch certificates');
  return response.json();
}

export default function CertificatesPage() {
  const { data: certificates, isLoading } = useQuery<Certificate[]>({
    queryKey: queryKeys.certificates.list(),
    queryFn: fetchCertificates,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Certificates</h1>

        {!certificates || certificates.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">No certificates yet</h2>
            <p className="text-gray-600 mb-6">Complete a course to earn your first certificate!</p>
            <Link
              href="/courses"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {(certificates || []).map((cert) => (
              <div key={cert.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="md:flex">
                  {(cert.course?.thumbnailUrl || cert.learningPath?.thumbnailUrl) && (
                    <div className="md:w-48 h-32 md:h-auto relative">
                      <img
                        src={cert.course?.thumbnailUrl ?? cert.learningPath?.thumbnailUrl ?? ''}
                        alt={cert.course?.title ?? cert.learningPath?.title ?? ''}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl font-semibold">{cert.course?.title ?? cert.learningPath?.title ?? 'Certificate'}</h2>
                          {cert.learningPath && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Learning Path</span>
                          )}
                        </div>
                        {cert.course && (
                        <p className="text-sm text-gray-600 mb-2">
                          Instructor: {cert.course.instructor?.fullName || 'Unknown'}
                        </p>
                        )}
                        <p className="text-sm text-gray-500">
                          Issued on {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        {cert.certificateNumber && (
                          <p className="text-xs font-mono text-gray-400 mt-1">{cert.certificateNumber}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/certificates/${cert.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
