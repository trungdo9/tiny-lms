export function LessonPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
      {/* Sidebar Skeleton */}
      <div className="w-80 border-r-[4px] border-black bg-white flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8 pb-4 border-b-[3px] border-black">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mb-6">
              <div className="h-5 w-40 bg-gray-200 rounded mb-3 animate-pulse" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-11 w-full bg-gray-100 border-[2px] border-black animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="bg-[#ffdb33] border-b-[4px] border-black p-4 px-8">
          <div className="h-8 w-64 bg-yellow-300 rounded animate-pulse" />
        </div>
        <div className="flex-1 p-10">
          <div className="max-w-5xl mx-auto">
            <div className="aspect-video bg-gray-200 border-[4px] border-black animate-pulse mb-10" />
            <div className="h-6 w-3/4 bg-gray-200 rounded mb-4 animate-pulse" />
            <div className="h-4 w-full bg-gray-100 rounded mb-2 animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
