'use client';

import { useState } from 'react';

interface Setting {
  key: string;
  value: unknown;
  type: string;
  isSecret?: boolean;
}

interface Props {
  setting: Setting;
  saving: boolean;
  onSave: (key: string, value: unknown, type?: string) => void;
}

const LABEL_MAP: Record<string, string> = {
  email_smtp_host: 'SMTP Host',
  email_smtp_port: 'SMTP Port',
  email_smtp_user: 'SMTP Username',
  email_smtp_pass: 'SMTP Password',
  email_smtp_secure: 'Use SSL/TLS (port 465)',
  email_from_name: 'From Name',
  email_from_email: 'From Email Address',
  resend_api_key: 'Resend API Key',
};

const PLACEHOLDER_MAP: Record<string, string> = {
  email_smtp_host: 'e.g. smtp.gmail.com',
  email_smtp_port: '587 (TLS) or 465 (SSL)',
  email_smtp_user: 'your@email.com',
  email_smtp_pass: 'Enter password',
  email_from_name: 'Tiny LMS',
  email_from_email: 'noreply@yourdomain.com',
  resend_api_key: 're_xxxxxxxxxxxx',
};

const isPasswordField = (key: string) =>
  key.includes('pass') || key.includes('key') || key.includes('secret');

const formatLabel = (key: string) =>
  LABEL_MAP[key] ??
  key
    .replace(/^(email_smtp_|email_from_|email_|resend_)/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

export function EmailSettingField({ setting, saving, onSave }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const strValue = String(setting.value || '');
  const inputKey = `${setting.key}-${strValue}`;
  const isConfigured = strValue === '***';

  // Boolean field (checkbox)
  if (setting.type === 'boolean') {
    const checked = setting.value === true || setting.value === 'true';
    return (
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {formatLabel(setting.key)}
        </label>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onSave(setting.key, e.target.checked, 'boolean')}
          disabled={saving}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
    );
  }

  // Password / secret field
  if (isPasswordField(setting.key)) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {formatLabel(setting.key)}
        </label>
        {isConfigured && !isEditing ? (
          <div
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
            onClick={() => setIsEditing(true)}
          >
            <span className="text-green-700 font-medium text-sm">Configured</span>
            <span className="text-gray-400 text-xs">— click to update</span>
          </div>
        ) : (
          <div className="relative">
            <input
              key={isEditing ? `${setting.key}-editing` : inputKey}
              type={showPassword ? 'text' : 'password'}
              defaultValue={isEditing ? '' : strValue}
              placeholder={PLACEHOLDER_MAP[setting.key]}
              onBlur={(e) => {
                const val = e.target.value;
                if (isEditing && val === '') {
                  setIsEditing(false);
                  return;
                }
                if (val !== strValue) {
                  onSave(setting.key, val);
                }
                if (isEditing) setIsEditing(false);
              }}
              autoFocus={isEditing}
              disabled={saving}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 pr-16 border"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Standard text/number field
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {formatLabel(setting.key)}
      </label>
      <input
        key={inputKey}
        type={setting.key.includes('port') ? 'number' : 'text'}
        defaultValue={strValue}
        placeholder={PLACEHOLDER_MAP[setting.key]}
        onBlur={(e) => {
          const val = setting.key.includes('port') ? Number(e.target.value) : e.target.value;
          if (val !== setting.value) {
            onSave(setting.key, val, setting.type);
          }
        }}
        disabled={saving}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
      />
    </div>
  );
}
