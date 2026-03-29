export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#ffdb33] p-8" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="h-12 w-48 bg-yellow-300 rounded mb-2 animate-pulse" />
        <div className="h-5 w-64 bg-yellow-300 rounded mb-8 animate-pulse" />

        {/* Profile Info Skeleton */}
        <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-200 border-[3px] border-black rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-7 w-40 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-5 w-56 bg-gray-100 rounded mb-2 animate-pulse" />
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Quick Links Skeleton */}
        <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-10">
          <div className="h-7 w-32 bg-gray-200 rounded mb-6 animate-pulse" />
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 w-32 bg-gray-200 border-[3px] border-black animate-pulse" />
            ))}
          </div>
        </div>

        {/* Edit Form Skeleton */}
        <div className="bg-[#ff90e8] border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="h-7 w-32 bg-pink-300 rounded mb-6 animate-pulse" />
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="h-5 w-24 bg-pink-300 rounded mb-2 animate-pulse" />
                <div className="h-14 w-full bg-white border-[3px] border-black animate-pulse" />
              </div>
            ))}
            <div className="h-14 w-full bg-gray-800 border-[3px] border-black animate-pulse mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
