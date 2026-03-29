'use client';

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg" />
        <div className="h-4 w-20 bg-gray-100 rounded" />
      </div>
      <div className="h-8 w-16 bg-gray-100 rounded" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-lg bg-gray-50 animate-pulse">
          <div className="h-4 w-3/4 bg-gray-100 rounded mb-2" />
          <div className="h-3 w-1/2 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  iconBg = 'bg-gray-100',
  iconColor = 'text-gray-600',
  valueColor = 'text-slate-900',
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconBg?: string;
  iconColor?: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
      </div>
      <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-lg">
      <p className="text-gray-400 font-medium">{message}</p>
    </div>
  );
}
