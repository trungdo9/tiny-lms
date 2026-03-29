'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { CHART_COLORS } from './chart-colors';

interface BarChartCardProps {
  title: string;
  description?: string;
  data: Record<string, unknown>[];
  xKey: string;
  bars: { key: string; color?: string; label?: string }[];
  height?: number;
}

export function BarChartCard({ title, description, data, xKey, bars, height = 300 }: BarChartCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip />
            {bars.map((bar, i) => (
              <Bar key={bar.key} dataKey={bar.key} fill={bar.color || CHART_COLORS.palette[i]} name={bar.label || bar.key} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
