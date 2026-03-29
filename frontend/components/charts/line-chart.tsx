'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { CHART_COLORS } from './chart-colors';

interface LineChartCardProps {
  title: string;
  description?: string;
  data: Record<string, unknown>[];
  xKey: string;
  lines: { key: string; color?: string; label?: string }[];
  height?: number;
}

export function LineChartCard({ title, description, data, xKey, lines, height = 300 }: LineChartCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip />
            {lines.map((line, i) => (
              <Line key={line.key} type="monotone" dataKey={line.key} stroke={line.color || CHART_COLORS.palette[i]} name={line.label || line.key} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
