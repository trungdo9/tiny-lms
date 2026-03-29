'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { CHART_COLORS } from './chart-colors';

interface PieChartCardProps {
  title: string;
  description?: string;
  data: { name: string; value: number; color?: string }[];
  height?: number;
}

export function PieChartCard({ title, description, data, height = 300 }: PieChartCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={entry.color || CHART_COLORS.palette[i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
