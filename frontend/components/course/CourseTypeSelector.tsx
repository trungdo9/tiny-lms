'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';
import { PlusCircle, Copy } from 'lucide-react';

type CourseType = 'blank' | 'clone';

interface CourseTypeSelectorProps {
  value: CourseType;
  onChange: (type: CourseType) => void;
  cloneFields?: React.ReactNode;
}

export function CourseTypeSelector({ value, onChange, cloneFields }: CourseTypeSelectorProps) {
  const types: { value: CourseType; label: string; icon: typeof PlusCircle }[] = [
    { value: 'blank', label: 'Blank Course', icon: PlusCircle },
    { value: 'clone', label: 'Clone from Existing', icon: Copy },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Course Type</label>
      <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
        {types.map((type) => {
          const Icon = type.icon;
          const isSelected = value === type.value;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange(type.value)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200',
                isSelected
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Icon className="w-4 h-4" />
              {type.label}
            </button>
          );
        })}
      </div>

      {value === 'clone' && cloneFields && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-4 animate-in fade-in duration-200">
          {cloneFields}
        </div>
      )}
    </div>
  );
}
