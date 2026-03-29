interface VerifyPageProps {
  params: Promise<{ certificateNumber: string }>;
}

interface CertVerification {
  certificateNumber: string;
  issuedAt: string;
  holderName: string;
  course: { title: string; slug: string };
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { certificateNumber } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  let cert: CertVerification | null = null;
  let notFound = false;

  try {
    const res = await fetch(`${apiUrl}/certificates/verify/${certificateNumber}`, {
      cache: 'no-store',
    });
    if (res.status === 404) {
      notFound = true;
    } else if (res.ok) {
      cert = await res.json();
    }
  } catch {
    notFound = true;
  }

  if (notFound || !cert) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-10 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Certificate Not Found</h1>
          <p className="text-gray-500 text-sm">
            No certificate found for <span className="font-mono">{certificateNumber}</span>.
            It may be invalid or revoked.
          </p>
        </div>
      </div>
    );
  }

  const issuedDate = new Date(cert.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full overflow-hidden">
        <div className="bg-blue-700 px-8 py-6 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Valid Certificate</h1>
          <p className="text-blue-200 text-sm mt-1">This certificate has been verified</p>
        </div>

        <div className="p-8 text-center">
          <p className="text-sm text-gray-500 mb-1">Awarded to</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{cert.holderName}</h2>
          <p className="text-gray-500 mb-1">for completing</p>
          <h3 className="text-lg font-semibold text-gray-800 mb-6">{cert.course.title}</h3>
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">Issued on <span className="font-medium text-gray-700">{issuedDate}</span></p>
            <p className="text-xs font-mono text-gray-400 mt-2">{cert.certificateNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
