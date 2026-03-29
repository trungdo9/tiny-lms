'use client';

import { useState, useEffect } from 'react';
import { contactSyncApi } from '@/lib/api';

interface SyncLog {
  id: string;
  email: string;
  provider: string;
  operation: string;
  trigger: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  userId: string | null;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ContactSyncLogsPage() {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', provider: '', trigger: '' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const result = await contactSyncApi.getLogs({ page, limit: 20, ...filters });
      setLogs(result.data);
      setMeta(result.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResync = async (userId: string) => {
    try {
      await contactSyncApi.syncUser(userId);
      await fetchLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Contact Sync Logs</h2>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          value={filters.status}
          onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); setPage(1); }}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>
        <select
          value={filters.provider}
          onChange={(e) => { setFilters((f) => ({ ...f, provider: e.target.value })); setPage(1); }}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Providers</option>
          <option value="mailchimp">Mailchimp</option>
          <option value="brevo">Brevo</option>
        </select>
        <select
          value={filters.trigger}
          onChange={(e) => { setFilters((f) => ({ ...f, trigger: e.target.value })); setPage(1); }}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Triggers</option>
          <option value="register">Register</option>
          <option value="enroll">Enroll</option>
          <option value="profile_update">Profile Update</option>
          <option value="completion">Completion</option>
          <option value="bulk_sync">Bulk Sync</option>
          <option value="webhook">Webhook</option>
          <option value="manual">Manual</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operation</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trigger</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No sync logs found</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{log.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 capitalize">{log.provider}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{log.operation}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{log.trigger}</td>
                  <td className="px-4 py-3">{statusBadge(log.status)}</td>
                  <td className="px-4 py-3">
                    {log.userId && (
                      <button
                        onClick={() => handleResync(log.userId!)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Re-sync
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {meta.page} of {meta.totalPages} ({meta.total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
