'use client';

import { cn } from '@/lib/utils';

interface FreeCourseToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function FreeCourseToggle({ checked, onChange }: FreeCourseToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          checked ? 'bg-green-500' : 'bg-gray-300',
          'group-hover:shadow-md group-hover:scale-105 transition-all'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
      <span className="text-sm font-medium text-gray-700 select-none">
        Free Course
      </span>
    </label>
  );
}
