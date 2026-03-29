'use client';

interface ActivityHeatmapProps {
  data: { date: string; count: number }[];
  months?: number;
}

const LEVELS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

function getLevel(count: number) {
  if (count === 0) return 0;
  if (count <= 1) return 1;
  if (count <= 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const countMap = new Map(data.map(d => [d.date, d.count]));

  const today = new Date();
  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];

  // Go back ~26 weeks (6 months)
  const start = new Date(today);
  start.setDate(start.getDate() - 182);
  // Align to Sunday
  start.setDate(start.getDate() - start.getDay());

  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push({ date: dateStr, count: countMap.get(dateStr) || 0 });
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const totalActivity = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Activity</h3>
        <span className="text-sm text-gray-500">{totalActivity} activities in the last 6 months</span>
      </div>
      <div className="flex gap-[3px] overflow-x-auto">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} activities`}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: LEVELS[getLevel(day.count)] }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
        <span>Less</span>
        {LEVELS.map((color, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
