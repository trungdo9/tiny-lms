'use client';

import { useState, useEffect } from 'react';
import { settingsApi } from '@/lib/api';

interface Setting {
  key: string;
  value: unknown;
  type: string;
  category: string;
}

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsApi.getByCategory('general');
      setSettings(data as Setting[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    setSaving(key);
    setMessage(null);
    try {
      await settingsApi.update(key, { value, type: 'string' });
      setMessage({ type: 'success', text: 'Setting saved successfully' });
      fetchSettings();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save setting' });
    } finally {
      setSaving(null);
    }
  };

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

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">General Settings</h2>
          <p className="mt-1 text-sm text-gray-500">Configure basic site information</p>
        </div>
        <div className="px-6 py-6 space-y-6">
          {settings.map((setting) => (
            <div key={setting.key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {setting.key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
