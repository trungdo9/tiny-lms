'use client';

import { useState, useEffect } from 'react';
import { emailsApi } from '@/lib/api';
import { EmailTemplateEditModal } from './email-template-edit-modal';

interface EmailTemplate {
  slug: string;
  name: string;
  subject: string;
  body: string;
  isActive: boolean;
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await emailsApi.getTemplates();
      setTemplates(data as EmailTemplate[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await emailsApi.seedTemplates();
      setMessage({ type: 'success', text: 'Templates seeded successfully' });
      fetchTemplates();
    } catch {
      setMessage({ type: 'error', text: 'Failed to seed templates' });
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (slug: string) => {
    try {
      await emailsApi.duplicateTemplate(slug);
      setMessage({ type: 'success', text: 'Template duplicated' });
      fetchTemplates();
    } catch {
      setMessage({ type: 'error', text: 'Failed to duplicate template' });
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(`Delete template "${slug}"? This cannot be undone.`)) return;
    try {
      await emailsApi.deleteTemplate(slug);
      setMessage({ type: 'success', text: 'Template deleted' });
      fetchTemplates();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete template' });
    }
  };

  const handleSaved = () => {
    setMessage({ type: 'success', text: 'Template saved successfully' });
    setEditingTemplate(null);
    fetchTemplates();
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

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Email Templates</h2>
        <button
          onClick={handleSeed}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          Seed Default Templates
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No templates found. Click &quot;Seed Default Templates&quot; to create default templates.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <div key={template.slug} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => setEditingTemplate(template)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDuplicate(template.slug)}
                    className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded"
                    title="Duplicate template"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleDelete(template.slug)}
                    className="px-3 py-1 text-sm text-red-500 hover:bg-red-50 rounded"
                    title="Delete template"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-600"><strong>Subject:</strong> {template.subject}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingTemplate && (
        <EmailTemplateEditModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
