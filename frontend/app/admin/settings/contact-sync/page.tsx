'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { settingsApi, contactSyncApi } from '@/lib/api';
import { EmailSettingField } from '../email/email-setting-field';

interface Setting {
  key: string;
  value: unknown;
  type: string;
  isSecret?: boolean;
}

interface SyncStatus {
  enabled: boolean;
  provider: string;
  lastSync: string | null;
  stats: { total: number; success: number; failed: number; pending: number };
}

export default function ContactSyncSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsData, statusData] = await Promise.all([
        settingsApi.getByCategory('contact_sync') as Promise<Setting[]>,
        contactSyncApi.getStatus(),
      ]);
      setSettings(settingsData);
      setStatus(statusData);
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
      await loadData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save setting' });
    } finally {
      setSaving(null);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setMessage(null);
    try {
      const result = await contactSyncApi.verify();
      if (result.success) {
        setMessage({ type: 'success', text: 'Connection verified successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Connection failed' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  };

  const handleBulkSync = async () => {
    if (!confirm('Sync all users to the configured provider? This may take a while.')) return;
    setSyncing(true);
    setMessage(null);
    try {
      await contactSyncApi.bulkSync();
      setMessage({
        type: 'success',
        text: 'Bulk sync started. Check logs for progress.',
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Bulk sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  const getSetting = (key: string) => settings.find((s) => s.key === key);
  const currentProvider = (getSetting('contact_sync_provider')?.value as string) || 'none';
  const isEnabled = getSetting('contact_sync_enabled')?.value === 'true' || getSetting('contact_sync_enabled')?.value === true;

  const mailchimpFields = settings.filter((s) => s.key.startsWith('mailchimp_'));
  const brevoFields = settings.filter((s) => s.key.startsWith('brevo_'));

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

      {/* Status Card */}
      {status && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Sync Status</h2>
            <Link
              href="/admin/settings/contact-sync/logs"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View Logs
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Provider</p>
              <p className="font-medium capitalize">{status.provider}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className={`font-medium ${status.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                {status.enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Sync</p>
              <p className="font-medium text-sm">
                {status.lastSync ? new Date(status.lastSync).toLocaleString() : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total / Failed</p>
              <p className="font-medium">
                {status.stats.success} / <span className="text-red-600">{status.stats.failed}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Configuration */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Contact Sync Settings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Sync LMS contacts to an external email marketing platform
          </p>
        </div>

        {/* Enable Toggle */}
        {getSetting('contact_sync_enabled') && (
          <div className="px-6 py-4 border-b border-gray-200">
            <EmailSettingField
              setting={getSetting('contact_sync_enabled')!}
              saving={saving === 'contact_sync_enabled'}
              onSave={updateSetting}
            />
          </div>
        )}

        {/* Provider Selection */}
        <div className="px-6 py-6 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Provider</h3>
          <div className="flex gap-4">
            {['none', 'mailchimp', 'brevo'].map((provider) => (
              <button
                key={provider}
                onClick={() => updateSetting('contact_sync_provider', provider)}
                disabled={saving !== null}
                className={`px-4 py-2 rounded-lg border-2 font-medium ${
                  currentProvider === provider
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {provider === 'none' ? 'None' : provider.charAt(0).toUpperCase() + provider.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Mailchimp Config */}
        {currentProvider === 'mailchimp' && mailchimpFields.length > 0 && (
          <div className="px-6 py-6 border-b border-gray-200 space-y-6">
            <h3 className="text-sm font-medium text-gray-900">Mailchimp Configuration</h3>
            {mailchimpFields.map((s) => (
              <EmailSettingField
                key={s.key}
                setting={s}
                saving={saving === s.key}
                onSave={updateSetting}
              />
            ))}
            <div className="pt-2">
              <p className="text-xs text-gray-400 mb-2">
                Webhook URL: <code className="bg-gray-100 px-1 rounded">{typeof window !== 'undefined' ? `${window.location.origin}` : ''}/api/contact-sync/webhooks/mailchimp?secret=YOUR_SECRET</code>
              </p>
            </div>
          </div>
        )}

        {/* Brevo Config */}
        {currentProvider === 'brevo' && brevoFields.length > 0 && (
          <div className="px-6 py-6 border-b border-gray-200 space-y-6">
            <h3 className="text-sm font-medium text-gray-900">Brevo Configuration</h3>
            {brevoFields.map((s) => (
              <EmailSettingField
                key={s.key}
                setting={s}
                saving={saving === s.key}
                onSave={updateSetting}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-6 flex gap-3">
          <button
            onClick={handleVerify}
            disabled={verifying || currentProvider === 'none' || !isEnabled}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {verifying ? 'Verifying...' : 'Test Connection'}
          </button>
          <button
            onClick={handleBulkSync}
            disabled={syncing || currentProvider === 'none' || !isEnabled}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync All Users'}
          </button>
        </div>
      </div>
    </div>
  );
}
