'use client';

import { useState, useEffect } from 'react';
import { settingsApi } from '@/lib/api';

interface Setting {
  key: string;
  value: unknown;
  type: string;
  isSecret?: boolean;
}

export default function AnalyticsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [gaCode, setGaCode] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await settingsApi.getByCategory('analytics') as Setting[];
      const gaSetting = data.find(s => s.key === 'analytics_ga_code');
      if (gaSetting) {
        setGaCode((gaSetting.value as string) || '');
      }
    } catch (err) {
      console.error('Failed to load analytics settings:', err);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await settingsApi.update('analytics_ga_code', { value: gaCode, type: 'string' });
      setMessage({ type: 'success', text: 'Analytics settings saved successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save analytics settings' });
    } finally {
      setSaving(false);
    }
  };

  const isValidGACode = (code: string) => {
    if (!code) return true;
    return /^G-[A-Z0-9]{10}$/.test(code);
  };

  const validationError = !isValidGACode(gaCode) ? 'Invalid format: expected G-XXXXXXXXXX' : null;

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
          <h2 className="text-lg font-medium text-gray-900">Analytics Settings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure Google Analytics for tracking user interactions
          </p>
        </div>

        <div className="px-6 py-6">
          <div>
            <label htmlFor="ga-code" className="block text-sm font-medium text-gray-700 mb-2">
              Google Analytics ID
            </label>
            <input
              id="ga-code"
              type="text"
              value={gaCode}
              onChange={(e) => setGaCode(e.target.value.toUpperCase())}
              placeholder="e.g., G-XXXXXXXXXX"
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border ${
                validationError ? 'border-red-500' : ''
              }`}
              disabled={saving}
            />
            <p className="mt-2 text-xs text-gray-500">
              Your GA4 Measurement ID. Found in Google Analytics: Admin → Property Settings → Measurement ID
            </p>
            {validationError && (
              <p className="mt-1 text-xs text-red-600">{validationError}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Leave empty to use the <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_GA_ID</code> environment variable.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || validationError !== null}
            className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
