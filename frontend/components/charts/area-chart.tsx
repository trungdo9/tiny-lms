'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { CHART_COLORS } from './chart-colors';

interface AreaChartCardProps {
  title: string;
  description?: string;
  data: Record<string, unknown>[];
  xKey: string;
  areas: { key: string; color?: string; label?: string }[];
  height?: number;
}

export function AreaChartCard({ title, description, data, xKey, areas, height = 300 }: AreaChartCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip />
            {areas.map((area, i) => (
              <Area key={area.key} type="monotone" dataKey={area.key} stroke={area.color || CHART_COLORS.palette[i]} fill={area.color || CHART_COLORS.palette[i]} fillOpacity={0.1} name={area.label || area.key} strokeWidth={2} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
