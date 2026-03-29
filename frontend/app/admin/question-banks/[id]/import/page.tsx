'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface PreviewQuestion {
  type: string;
  content: string;
  options: { content: string; isCorrect: boolean }[];
  explanation?: string;
  defaultScore: number;
  difficulty?: string;
  tags?: string[];
}

export default function ImportQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const bankId = params.id as string;

  const [importType, setImportType] = useState<'csv' | 'excel'>('csv');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState<PreviewQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePreview = async () => {
    if (!content.trim()) {
      setError('Please paste CSV or base64-encoded Excel content');
      return;
    }

    setPreviewing(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/question-banks/${bankId}/import/preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to parse content');
      }

      const data = await response.json();
      setPreview(data.questions || []);
    } catch (err: any) {
      setError(err.message);
      setPreview([]);
    } finally {
      setPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) {
      setError('No questions to import. Please preview first.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/question-banks/${bankId}/questions/bulk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ questions: preview }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to import questions');
      }

      setSuccess(`Successfully imported ${preview.length} questions!`);
      setPreview([]);
      setContent('');
      setTimeout(() => router.push(`/question-banks/${bankId}`), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/question-banks/${bankId}/import/template`,
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }
      );

      if (!response.ok) throw new Error('Failed to download template');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'questions_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold">Import Questions</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg">{success}</div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={importType === 'csv'}
                onChange={() => setImportType('csv')}
              />
              CSV
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={importType === 'excel'}
                onChange={() => setImportType('excel')}
              />
              Excel (.xlsx)
            </label>
            <button
              onClick={handleDownloadTemplate}
              className="ml-auto text-sm text-blue-600 hover:underline"
            >
              Download Template
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {importType === 'csv' ? 'CSV Content' : 'Excel Content (Base64)'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                importType === 'csv'
                  ? 'Paste CSV content here...\ntype,content,option_a,option_b,option_c,option_d,correct,score,difficulty'
                  : 'Paste base64-encoded Excel file content here'
              }
              className="w-full p-3 border rounded-lg font-mono text-sm"
              rows={10}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePreview}
              disabled={previewing || !content.trim()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
            >
              {previewing ? 'Parsing...' : 'Preview'}
            </button>
            <button
              onClick={handleImport}
              disabled={loading || preview.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Importing...' : `Import ${preview.length} Questions`}
            </button>
          </div>
        </div>

        {preview.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4">Preview ({preview.length} questions)</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {preview.map((q, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-medium">
                      {q.type}
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      Score: {q.defaultScore}
                    </span>
                    {q.difficulty && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {q.difficulty}
                      </span>
                    )}
                  </div>
                  <p className="font-medium mb-2">{q.content}</p>
                  {q.options.length > 0 && (
                    <ul className="text-sm text-gray-600 space-y-1">
                      {q.options.map((opt, i) => (
                        <li key={i} className={opt.isCorrect ? 'text-green-600 font-medium' : ''}>
                          {opt.isCorrect ? '✓' : '○'} {opt.content}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
