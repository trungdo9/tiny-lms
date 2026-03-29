'use client';

import { useState, useEffect, useMemo } from 'react';
import { emailsApi } from '@/lib/api';

interface EmailTemplate {
  slug: string;
  name: string;
  subject: string;
  body: string;
  isActive: boolean;
}

interface Props {
  template: EmailTemplate;
  onClose: () => void;
  onSaved: () => void;
}

// Known variables per template slug
const TEMPLATE_VARIABLES: Record<string, { name: string; example: string }[]> = {
  welcome: [
    { name: 'user_name', example: 'John Doe' },
    { name: 'site_name', example: 'Tiny LMS' },
    { name: 'site_url', example: 'https://example.com' },
    { name: 'footer_text', example: '2026 Tiny LMS' },
  ],
  enrollment: [
    { name: 'user_name', example: 'John Doe' },
    { name: 'course_name', example: 'Introduction to Python' },
    { name: 'instructor_name', example: 'Jane Smith' },
    { name: 'course_duration', example: '8 hours' },
    { name: 'course_url', example: 'https://example.com/courses/python' },
    { name: 'site_name', example: 'Tiny LMS' },
    { name: 'footer_text', example: '2026 Tiny LMS' },
  ],
  certificate: [
    { name: 'user_name', example: 'John Doe' },
    { name: 'course_name', example: 'Introduction to Python' },
    { name: 'certificate_url', example: 'https://example.com/certificates/abc123' },
    { name: 'site_name', example: 'Tiny LMS' },
    { name: 'footer_text', example: '2026 Tiny LMS' },
  ],
  quiz_result: [
    { name: 'user_name', example: 'John Doe' },
    { name: 'quiz_name', example: 'Python Basics Quiz' },
    { name: 'score', example: '85' },
    { name: 'result', example: 'Passed' },
    { name: 'time_spent', example: '15 minutes' },
    { name: 'quiz_url', example: 'https://example.com/quizzes/abc123' },
    { name: 'site_name', example: 'Tiny LMS' },
    { name: 'footer_text', example: '2026 Tiny LMS' },
  ],
};

const DEFAULT_VARIABLES = [
  { name: 'user_name', example: 'John Doe' },
  { name: 'site_name', example: 'Tiny LMS' },
  { name: 'site_url', example: 'https://example.com' },
  { name: 'footer_text', example: '2026 Tiny LMS' },
];

// Extract {{variables}} from template text
function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))];
}

export function EmailTemplateEditModal({ template, onClose, onSaved }: Props) {
  const [draft, setDraft] = useState<EmailTemplate>(template);
  const [tab, setTab] = useState<'edit' | 'preview' | 'test'>('edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewSubject, setPreviewSubject] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const knownVars = TEMPLATE_VARIABLES[template.slug] || DEFAULT_VARIABLES;

  const detectedVars = useMemo(() => {
    const allText = `${draft.subject} ${draft.body}`;
    const found = extractVariables(allText);
    return found.filter((v) => !knownVars.some((kv) => kv.name === v));
  }, [draft.subject, draft.body, knownVars]);

  const [varValues, setVarValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const v of knownVars) {
      initial[v.name] = v.example;
    }
    return initial;
  });

  useEffect(() => {
    if (tab === 'preview') loadPreview();
  }, [tab]);

  const loadPreview = () => {
    setPreviewLoading(true);
    let subject = draft.subject;
    let body = draft.body;
    for (const [key, value] of Object.entries(varValues)) {
      const placeholder = `{{${key}}}`;
      subject = subject.replaceAll(placeholder, value);
      body = body.replaceAll(placeholder, value);
    }
    setPreviewSubject(subject);
    setPreviewHtml(body);
    setPreviewLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await emailsApi.updateTemplate(draft.slug, {
        name: draft.name,
        subject: draft.subject,
        body: draft.body,
        isActive: draft.isActive,
      });
      onSaved();
    } catch {
      setError('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) return;
    setTestSending(true);
    setTestResult(null);
    try {
      await emailsApi.sendTestWithTemplate(draft.slug, testEmail, varValues);
      setTestResult({ type: 'success', text: `Test email sent to ${testEmail}` });
    } catch (err: any) {
      setTestResult({ type: 'error', text: err.message || 'Failed to send test email' });
    } finally {
      setTestSending(false);
    }
  };

  const insertVariable = (varName: string) => {
    setDraft({ ...draft, body: draft.body + `{{${varName}}}` });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Edit Template: {draft.slug}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{draft.name}</p>
          </div>
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            Active
          </label>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6 flex-shrink-0">
          {(['edit', 'preview', 'test'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px capitalize ${
                tab === t
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'test' ? 'Send Test' : t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 text-red-800 text-sm">{error}</div>
          )}

          {tab === 'edit' && (
            <div className="flex h-full">
              {/* Editor */}
              <div className="flex-1 p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={draft.subject}
                    onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body (HTML)</label>
                  <textarea
                    value={draft.body}
                    onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                    rows={16}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border font-mono text-xs leading-relaxed"
                  />
                </div>
              </div>

              {/* Variable Sidebar */}
              <div className="w-60 border-l border-gray-200 p-4 bg-gray-50 flex-shrink-0 overflow-y-auto">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Available Variables
                </h4>
                <div className="space-y-1">
                  {knownVars.map((v) => (
                    <button
                      key={v.name}
                      onClick={() => insertVariable(v.name)}
                      className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                      title={`Insert {{${v.name}}}`}
                    >
                      <code className="text-blue-600 group-hover:text-blue-800">{`{{${v.name}}}`}</code>
                      <span className="block text-gray-400 text-[10px] mt-0.5 truncate">{v.example}</span>
                    </button>
                  ))}
                  {detectedVars.map((v) => (
                    <button
                      key={v}
                      onClick={() => insertVariable(v)}
                      className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-yellow-50 transition-colors"
                      title={`Custom: {{${v}}}`}
                    >
                      <code className="text-yellow-600">{`{{${v}}}`}</code>
                      <span className="block text-gray-400 text-[10px] mt-0.5">custom</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-4">
                  Click to insert at end of body.
                </p>
              </div>
            </div>
          )}

          {tab === 'preview' && (
            <div className="p-6">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Preview Variables
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {knownVars.map((v) => (
                    <div key={v.name} className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 w-28 flex-shrink-0 truncate font-mono">
                        {v.name}
                      </label>
                      <input
                        type="text"
                        value={varValues[v.name] || ''}
                        onChange={(e) => setVarValues({ ...varValues, [v.name]: e.target.value })}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        placeholder={v.example}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={loadPreview}
                  className="mt-3 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Refresh Preview
                </button>
              </div>

              <div className="mb-3 px-3 py-2 bg-white border border-gray-200 rounded">
                <span className="text-xs text-gray-500">Subject: </span>
                <span className="text-sm font-medium">{previewSubject || draft.subject}</span>
              </div>

              {previewLoading ? (
                <div className="text-center py-8 text-gray-500 text-sm">Loading preview...</div>
              ) : (
                <iframe
                  srcDoc={previewHtml || draft.body}
                  className="w-full border border-gray-300 rounded-md bg-white"
                  style={{ height: '500px' }}
                  title="Email HTML preview"
                  sandbox="allow-same-origin"
                />
              )}
            </div>
          )}

          {tab === 'test' && (
            <div className="p-6">
              <div className="max-w-lg">
                <h4 className="font-medium text-gray-900 mb-1">Send Test Email</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Send this template with the variables below to a test address.
                </p>

                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Template Variables
                  </h4>
                  <div className="space-y-2">
                    {knownVars.map((v) => (
                      <div key={v.name} className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 w-28 flex-shrink-0 truncate font-mono">
                          {v.name}
                        </label>
                        <input
                          type="text"
                          value={varValues[v.name] || ''}
                          onChange={(e) => setVarValues({ ...varValues, [v.name]: e.target.value })}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                          placeholder={v.example}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="recipient@example.com"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendTest}
                    disabled={testSending || !testEmail}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {testSending ? 'Sending...' : 'Send Test'}
                  </button>
                </div>

                {testResult && (
                  <div className={`mt-3 p-3 rounded-lg text-sm ${
                    testResult.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    {testResult.text}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
