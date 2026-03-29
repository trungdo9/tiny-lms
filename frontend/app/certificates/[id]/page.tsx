'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Certificate {
  id: string;
  issuedAt: string;
  certificateNumber?: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string;
    instructor: {
      id: string;
      fullName: string;
      avatarUrl: string;
    };
  };
  user: {
    id: string;
    fullName: string;
    avatarUrl: string;
  };
}

async function fetchCertificate(certificateId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/certificates/${certificateId}`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Certificate not found');
    }
    throw new Error('Failed to fetch certificate');
  }
  return response.json();
}

export default function CertificateViewPage() {
  const params = useParams();
  const router = useRouter();
  const certificateId = params.id as string;
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: certificate, isLoading, error } = useQuery<Certificate>({
    queryKey: ['certificates', certificateId],
    queryFn: () => fetchCertificate(certificateId),
    enabled: !!certificateId,
  });

  const downloadPdf = async () => {
    try {
      setDownloading(true);
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/certificates/${certificateId}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to download PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${params.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error?.message || 'Certificate not found'}</p>
          <button onClick={() => router.push('/certificates')} className="text-blue-600 hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const shareVerifyLink = () => {
    if (!certificate.certificateNumber) return;
    const url = `${window.location.origin}/verify/${certificate.certificateNumber}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Certificate Preview */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-8 border-b border-amber-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-amber-800 mb-2">CERTIFICATE OF COMPLETION</h1>
              <p className="text-amber-700">This is to certify that</p>
            </div>
          </div>

          <div className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">{certificate.user.fullName || 'Student'}</h2>
            <p className="text-gray-600 mb-2">has successfully completed the course</p>
            <h3 className="text-xl font-semibold mb-4">{certificate.course.title}</h3>
            <p className="text-gray-500 text-sm">Issued on {issuedDate}</p>
            {certificate.certificateNumber && (
              <p className="text-xs font-mono text-gray-400 mt-1">{certificate.certificateNumber}</p>
            )}
          </div>

          <div className="bg-gray-50 px-8 py-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Course Instructor</p>
              <p className="font-medium">{certificate.course.instructor?.fullName || 'Instructor'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Certificate ID</p>
              <p className="text-xs font-mono text-gray-400">{certificate.id}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={downloadPdf}
            disabled={downloading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Downloading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </>
            )}
          </button>
          {certificate.certificateNumber && (
            <button
              onClick={shareVerifyLink}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {copied ? 'Copied!' : 'Share'}
            </button>
          )}
          <a
            href={`/courses/${certificate.course.slug}`}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            View Course
          </a>
        </div>
      </div>
    </div>
  );
}
