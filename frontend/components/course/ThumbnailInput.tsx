'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface ThumbnailInputProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
}

export function ThumbnailInput({ value, onChange, error }: ThumbnailInputProps) {
  const [isValid, setIsValid] = useState(true);

  const handleUrlChange = (url: string) => {
    onChange(url);
    if (url && !url.match(/^https?:\/\/.+/)) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  };

  const showPreview = value && isValid && (value.startsWith('http://') || value.startsWith('https://'));
  const showError = error || (!isValid && value);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Thumbnail URL
      </label>

      <input
        type="url"
        value={value}
        onChange={(e) => handleUrlChange(e.target.value)}
        className={cn(
          'w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all',
          showError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
        )}
        placeholder="https://example.com/image.jpg"
      />

      {showError && (
        <p className="text-sm text-red-500">{error || 'Please enter a valid URL'}</p>
      )}

      <div className="mt-3 border rounded-lg overflow-hidden bg-gray-100 h-40 flex items-center justify-center">
        {showPreview ? (
          <img
            src={value}
            alt="Thumbnail preview"
            className="w-full h-full object-cover"
            onError={() => setIsValid(false)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <ImageIcon className="w-12 h-12" />
            <span className="text-sm">Enter a valid image URL to preview</span>
          </div>
        )}
      </div>
    </div>
  );
}
