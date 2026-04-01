'use client';

import { cn } from '@/lib/utils';
import { BookOpen, TrendingUp, Award } from 'lucide-react';

type Level = 'beginner' | 'intermediate' | 'advanced';

interface LevelSelectorProps {
  value: Level;
  onChange: (level: Level) => void;
}

const levels: { value: Level; label: string; icon: typeof BookOpen; color: string; bgColor: string }[] = [
  {
    value: 'beginner',
    label: 'Beginner',
    icon: BookOpen,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    icon: TrendingUp,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    icon: Award,
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100',
  },
];

export function LevelSelector({ value, onChange }: LevelSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Level</label>
      <div className="grid grid-cols-3 gap-3">
        {levels.map((level) => {
          const Icon = level.icon;
          const isSelected = value === level.value;
          return (
            <button
              key={level.value}
              type="button"
              onClick={() => onChange(level.value)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200',
                'hover:shadow-md hover:-translate-y-0.5',
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <Icon className={cn('w-6 h-6', isSelected ? level.color : 'text-gray-400')} />
              <span className={cn('text-sm font-medium', isSelected ? 'text-gray-900' : 'text-gray-500')}>
                {level.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
