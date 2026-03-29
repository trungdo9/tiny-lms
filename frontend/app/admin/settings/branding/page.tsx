'use client';

import { useState, useEffect } from 'react';
import { settingsApi } from '@/lib/api';

interface Setting {
  key: string;
  value: unknown;
  type: string;
  category: string;
}

export default function BrandingSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewColors, setPreviewColors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsApi.getByCategory('branding');
      setSettings(data as Setting[]);

      // Set initial preview colors
      const brandingData = data as Setting[];
      const colors: Record<string, string> = {};
      brandingData.forEach((s) => {
        if (s.key.startsWith('brand_') && s.key.includes('color') && !s.key.includes('_bg')) {
          colors[s.key] = String(s.value || '#3b82f6');
        }
      });
      setPreviewColors(colors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: unknown, type = 'string') => {
    setSaving(key);
    setMessage(null);
    try {
      await settingsApi.update(key, { value, type });
      setMessage({ type: 'success', text: 'Setting saved successfully' });

      // Update preview colors
      if (key.startsWith('brand_') && key.includes('color')) {
        setPreviewColors((prev) => ({ ...prev, [key]: String(value) }));
      }

      fetchSettings();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save setting' });
    } finally {
      setSaving(null);
    }
  };

  const colorFields = settings.filter(
    (s) => s.key.startsWith('brand_') && s.key.includes('color') && !s.key.includes('image') && !s.key.includes('logo') && !s.key.includes('favicon') && !s.key.includes('og_image')
  );

  const textFields = settings.filter(
    (s) =>
      (s.key.startsWith('brand_') && !s.key.includes('color') && !s.key.includes('image') && !s.key.includes('logo') && !s.key.includes('favicon') && !s.key.includes('og_image') && s.key !== 'brand_custom_css') ||
      s.key === 'brand_dark_mode'
  );

  const imageFields = settings.filter(
    (s) => s.key.includes('logo') || s.key.includes('favicon') || s.key.includes('image') || s.key.includes('og_image')
  );

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Brand Colors */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Brand Colors</h2>
            <p className="mt-1 text-sm text-gray-500">Customize your brand color palette</p>
          </div>
          <div className="px-6 py-6 space-y-6">
            {colorFields.map((setting) => (
              <div key={setting.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {setting.key
                    .replace('brand_', '')
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={String(setting.value || '#000000')}
                    onChange={(e) => updateSetting(setting.key, e.target.value)}
                    disabled={saving === setting.key}
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={String(setting.value || '')}
                    onBlur={(e) => {
                      if (e.target.value !== String(setting.value)) {
                        updateSetting(setting.key, e.target.value);
                      }
                    }}
                    disabled={saving === setting.key}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Text */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Brand Information</h2>
            <p className="mt-1 text-sm text-gray-500">Basic brand details</p>
          </div>
          <div className="px-6 py-6 space-y-6">
            {textFields.map((setting) => (
              <div key={setting.key}>
                {setting.key === 'brand_dark_mode' ? (
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Dark Mode
                    </label>
                    <button
                      onClick={() => updateSetting(setting.key, !setting.value)}
                      disabled={saving === setting.key}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        setting.value ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          setting.value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {setting.key
                        .replace('brand_', '')
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </label>
                    <input
                      type="text"
                      defaultValue={String(setting.value || '')}
                      onBlur={(e) => {
                        if (e.target.value !== String(setting.value)) {
                          updateSetting(setting.key, e.target.value);
                        }
                      }}
                      disabled={saving === setting.key}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white shadow rounded-lg lg:col-span-2">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Brand Assets</h2>
            <p className="mt-1 text-sm text-gray-500">Upload logos and images</p>
          </div>
          <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {imageFields.map((setting) => (
              <div key={setting.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {setting.key
                    .replace('brand_', '')
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                  <span className="text-gray-400 font-normal ml-2">(URL)</span>
                </label>
                <input
                  type="text"
                  defaultValue={String(setting.value || '')}
                  onBlur={(e) => {
                    if (e.target.value !== String(setting.value)) {
                      updateSetting(setting.key, e.target.value);
                    }
                  }}
                  disabled={saving === setting.key}
                  placeholder="https://example.com/image.png"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
                {Boolean(setting.value) && String(setting.value) && (
                  <div className="mt-2">
                    <img
                      src={String(setting.value)}
                      alt={setting.key}
                      className="h-16 w-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Custom CSS */}
        <div className="bg-white shadow rounded-lg lg:col-span-2">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Custom CSS</h2>
            <p className="mt-1 text-sm text-gray-500">Add custom styles to your site</p>
          </div>
          <div className="px-6 py-6">
            {settings
              .filter((s) => s.key === 'brand_custom_css')
              .map((setting) => (
                <textarea
                  key={setting.key}
                  defaultValue={String(setting.value || '')}
                  onBlur={(e) => {
                    if (e.target.value !== String(setting.value)) {
                      updateSetting(setting.key, e.target.value);
                    }
                  }}
                  disabled={saving === setting.key}
                  rows={6}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border font-mono"
                  placeholder=".my-class { color: red; }"
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
