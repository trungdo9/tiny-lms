'use client';

import { useState, useEffect } from 'react';
import { organizationApi, Organization } from '@/lib/api';

type FormData = Partial<Omit<Organization, 'id' | 'slug'>>;

export default function OrganizationSettingsPage() {
  const [form, setForm] = useState<FormData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [notSeeded, setNotSeeded] = useState(false);

  useEffect(() => {
    fetchOrg();
  }, []);

  const fetchOrg = async () => {
    try {
      const data = await organizationApi.get();
      if (!data) {
        setNotSeeded(true);
      } else {
        setForm(data);
        setNotSeeded(false);
      }
    } catch {
      setNotSeeded(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSaving(true);
    try {
      const data = await organizationApi.seed();
      setForm(data);
      setNotSeeded(false);
      setMessage({ type: 'success', text: 'Organization initialized' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to initialize organization' });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { id, slug, ...updateData } = form as Organization;
      await organizationApi.update(updateData);
      setMessage({ type: 'success', text: 'Organization updated' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof FormData, value: string | number | null) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (notSeeded) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <p className="text-gray-500 mb-4">Organization profile has not been initialized yet.</p>
        <button
          onClick={handleSeed}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Initializing...' : 'Initialize Organization'}
        </button>
      </div>
    );
  }

  return (
    <div>
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        {/* Basic Info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
        </div>
        <div className="px-6 py-6 space-y-4 border-b border-gray-200">
          <Field label="Organization Name *" value={form.name} onChange={v => updateField('name', v)} />
          <Field label="Short Name" value={form.shortName} onChange={v => updateField('shortName', v)} placeholder="e.g. TLMS" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description || ''}
              onChange={e => updateField('description', e.target.value)}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              placeholder="Brief description of the organization"
            />
          </div>
          <Field label="Logo URL" value={form.logoUrl} onChange={v => updateField('logoUrl', v)} placeholder="https://..." />
          <Field label="Favicon URL" value={form.faviconUrl} onChange={v => updateField('faviconUrl', v)} placeholder="https://..." />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
            <input
              type="number"
              value={form.foundedYear || ''}
              onChange={e => updateField('foundedYear', e.target.value ? Number(e.target.value) : null)}
              min={1900}
              max={2100}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              placeholder="2024"
            />
          </div>
          <Field label="Tax / Business Code" value={form.taxCode} onChange={v => updateField('taxCode', v)} />
        </div>

        {/* Contact Information */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
        </div>
        <div className="px-6 py-6 space-y-4 border-b border-gray-200">
          <Field label="Contact Email" value={form.email} onChange={v => updateField('email', v)} type="email" placeholder="contact@example.com" />
          <Field label="Phone" value={form.phone} onChange={v => updateField('phone', v)} type="tel" placeholder="+84 xxx xxx xxx" />
          <Field label="Address" value={form.address} onChange={v => updateField('address', v)} placeholder="Street address" />
          <Field label="City / Province" value={form.city} onChange={v => updateField('city', v)} />
          <Field label="Country" value={form.country} onChange={v => updateField('country', v)} placeholder="Vietnam" />
        </div>

        {/* Social Links */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Social Links</h2>
        </div>
        <div className="px-6 py-6 space-y-4 border-b border-gray-200">
          <Field label="Website" value={form.website} onChange={v => updateField('website', v)} type="url" placeholder="https://example.com" />
          <Field label="Facebook" value={form.facebookUrl} onChange={v => updateField('facebookUrl', v)} type="url" placeholder="https://facebook.com/..." />
          <Field label="LinkedIn" value={form.linkedinUrl} onChange={v => updateField('linkedinUrl', v)} type="url" placeholder="https://linkedin.com/company/..." />
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', placeholder,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
        placeholder={placeholder}
      />
    </div>
  );
}
