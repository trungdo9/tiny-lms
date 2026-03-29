'use client';

import { useState, useEffect } from 'react';
import { settingsApi } from '@/lib/api';

export default function AuthSettingsPage() {
  const [requireVerification, setRequireVerification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsApi.getByCategory('auth') as Array<{ key: string; value: unknown }>;
      const setting = data.find(s => s.key === 'auth.require_email_verification');
      setRequireVerification(setting?.value === true || setting?.value === 'true');
    } catch {
      // Setting not seeded yet — default false
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    setSaving(true);
    setMessage(null);
    const newValue = !requireVerification;
    try {
      await settingsApi.update('auth.require_email_verification', { value: newValue, type: 'boolean' });
      setRequireVerification(newValue);
      setMessage({ type: 'success', text: newValue ? 'Email verification enabled' : 'Email verification disabled' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update setting' });
    } finally {
      setSaving(false);
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
          <h2 className="text-lg font-medium text-gray-900">Authentication Settings</h2>
          <p className="mt-1 text-sm text-gray-500">Configure user registration and authentication behavior</p>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Require Email Verification</p>
              <p className="text-sm text-gray-500 mt-1">
                When enabled, new users must verify their email before accessing the system.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                requireVerification ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  requireVerification ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {requireVerification && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                Make sure your Supabase project has email sending configured. Users will receive a verification email from Supabase after registration.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
