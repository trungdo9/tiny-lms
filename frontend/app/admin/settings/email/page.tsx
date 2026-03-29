'use client';

import { useState, useEffect } from 'react';
import { settingsApi, emailsApi } from '@/lib/api';
import { EmailSettingField } from './email-setting-field';

interface Setting {
  key: string;
  value: unknown;
  type: string;
  isSecret?: boolean;
}

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsApi.getByCategory('email');
      setSettings(data as Setting[]);
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
      setMessage({ type: 'success', text: 'Setting saved' });
      await fetchSettings();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save setting' });
    } finally {
      setSaving(null);
    }
  };

  const handleSeedSettings = async () => {
    setSeeding(true);
    setMessage(null);
    try {
      await settingsApi.seed();
      setMessage({ type: 'success', text: 'Email settings initialized' });
      await fetchSettings();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to initialize settings' });
    } finally {
      setSeeding(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    setTesting(true);
    setMessage(null);
    try {
      await emailsApi.sendTestEmail(testEmail);
      setMessage({ type: 'success', text: `Test email sent to ${testEmail}` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to send test email' });
    } finally {
      setTesting(false);
    }
  };

  const currentProvider = settings.find(s => s.key === 'email_provider')?.value as string | undefined;
  const smtpFields = settings.filter(s => s.key.startsWith('email_smtp_'));
  const fromFields = settings.filter(s => s.key.startsWith('email_from_'));
  const resendFields = settings.filter(s => s.key === 'resend_api_key');
  const isEmpty = settings.length === 0;

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

      {/* Empty state — settings not seeded */}
      {isEmpty && (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">Email settings have not been initialized yet.</p>
          <button
            onClick={handleSeedSettings}
            disabled={seeding}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {seeding ? 'Initializing...' : 'Initialize Email Settings'}
          </button>
        </div>
      )}

      {!isEmpty && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Email Settings</h2>
            <p className="mt-1 text-sm text-gray-500">Configure email provider and SMTP settings</p>
          </div>

          {/* Provider Selection */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Email Provider</h3>
            <div className="flex gap-4">
              {['smtp', 'resend'].map((provider) => {
                const isSelected = (currentProvider ?? 'smtp') === provider;
                return (
                  <button
                    key={provider}
                    onClick={() => updateSetting('email_provider', provider)}
                    disabled={saving !== null}
                    className={`px-4 py-2 rounded-lg border-2 font-medium ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {provider.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SMTP Configuration — only for smtp provider */}
          {(currentProvider === 'smtp' || !currentProvider) && smtpFields.length > 0 && (
            <div className="px-6 py-6 border-b border-gray-200 space-y-6">
              <h3 className="text-sm font-medium text-gray-900">SMTP Configuration</h3>
              {smtpFields.map((s) => (
                <EmailSettingField
                  key={s.key}
                  setting={s}
                  saving={saving === s.key}
                  onSave={updateSetting}
                />
              ))}
            </div>
          )}

          {/* Resend Configuration — only for resend provider */}
          {currentProvider === 'resend' && (
            <div className="px-6 py-6 border-b border-gray-200 space-y-6">
              <h3 className="text-sm font-medium text-gray-900">Resend Configuration</h3>
              {resendFields.length > 0 ? (
                resendFields.map((s) => (
                  <EmailSettingField
                    key={s.key}
                    setting={s}
                    saving={saving === s.key}
                    onSave={updateSetting}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-400">resend_api_key not found. Re-initialize settings.</p>
              )}
            </div>
          )}

          {/* From Address — shared by all providers */}
          {fromFields.length > 0 && (
            <div className="px-6 py-6 border-b border-gray-200 space-y-6">
              <h3 className="text-sm font-medium text-gray-900">From Address</h3>
              {fromFields.map((s) => (
                <EmailSettingField
                  key={s.key}
                  setting={s}
                  saving={saving === s.key}
                  onSave={updateSetting}
                />
              ))}
            </div>
          )}

          {/* Send Test Email */}
          <div className="px-6 py-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Test Configuration</h3>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Send test email to..."
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                onClick={handleTestEmail}
                disabled={testing || !testEmail || saving !== null}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {testing ? 'Sending...' : 'Send Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
