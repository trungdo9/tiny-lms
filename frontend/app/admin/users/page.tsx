'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUsersApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';

function useDebouncedValue(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function AdminUsersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const params = {
    page: parseInt(searchParams.get('page') || '1'),
    q: searchParams.get('q') || '',
    role: searchParams.get('role') || '',
    isActive: searchParams.get('isActive') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  };

  const [searchInput, setSearchInput] = useState(params.q);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [resetPwUser, setResetPwUser] = useState<any>(null);

  useEffect(() => {
    if (debouncedSearch !== params.q) {
      updateParams({ q: debouncedSearch });
    }
  }, [debouncedSearch]);

  function updateParams(updates: Record<string, string>) {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k));
    if (!updates.page) p.set('page', '1');
    router.push(`?${p.toString()}`);
  }

  const { data: stats } = useQuery({
    queryKey: queryKeys.adminUsers.stats(),
    queryFn: () => adminUsersApi.getStats(),
  });

  const listParams = { page: params.page, limit: 20, q: params.q, role: params.role, isActive: params.isActive, sortBy: params.sortBy, sortOrder: params.sortOrder };
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.adminUsers.all(listParams),
    queryFn: () => adminUsersApi.getAll(listParams),
  });

  const createMutation = useMutation({
    mutationFn: (d: { email: string; password: string; fullName?: string; role?: string }) => adminUsersApi.createUser(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setCreateOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminUsersApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setEditUser(null);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? adminUsersApi.reactivateUser(id) : adminUsersApi.deactivateUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const resetPwMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      adminUsersApi.resetPassword(id, { newPassword }),
    onSuccess: () => setResetPwUser(null),
  });

  const users = (data as any)?.users || [];
  const pagination = (data as any)?.pagination || { page: 1, totalPages: 1, total: 0 };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      student: 'bg-blue-100 text-blue-700',
      instructor: 'bg-amber-100 text-amber-700',
      admin: 'bg-red-100 text-red-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button onClick={() => setCreateOpen(true)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-700">
          Add User
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-900' },
            { label: 'Students', value: stats.students, color: 'text-blue-600' },
            { label: 'Instructors', value: stats.instructors, color: 'text-amber-600' },
            { label: 'Admins', value: stats.admins, color: 'text-red-600' },
            { label: 'Inactive', value: stats.inactive, color: 'text-gray-500' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <select value={params.role} onChange={(e) => updateParams({ role: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>
        <select value={params.isActive} onChange={(e) => updateParams({ isActive: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select value={`${params.sortBy}-${params.sortOrder}`} onChange={(e) => { const [sb, so] = e.target.value.split('-'); updateParams({ sortBy: sb, sortOrder: so }); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="fullName-asc">Name A-Z</option>
          <option value="fullName-desc">Name Z-A</option>
          <option value="email-asc">Email A-Z</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td colSpan={6} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">No users found</td></tr>
            ) : (
              users.map((user: any) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 overflow-hidden">
                        {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : (user.fullName?.[0] || user.email?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.fullName || 'Unnamed'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleBadge(user.role)}`}>{user.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setEditUser(user)} className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded">Edit</button>
                      <button onClick={() => setResetPwUser(user)} className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded">Reset PW</button>
                      <button
                        onClick={() => { if (confirm(`${user.isActive ? 'Deactivate' : 'Reactivate'} ${user.fullName || user.email}?`)) toggleStatusMutation.mutate({ id: user.id, active: !user.isActive }); }}
                        className={`px-2 py-1 text-xs rounded ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                      >
                        {user.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)</p>
          <div className="flex gap-2">
            <button disabled={pagination.page <= 1} onClick={() => updateParams({ page: String(pagination.page - 1) })} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">Previous</button>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => updateParams({ page: String(pagination.page + 1) })} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}

      {/* Create User Dialog */}
      {createOpen && <CreateUserDialog onClose={() => setCreateOpen(false)} onSave={(d) => createMutation.mutate(d)} saving={createMutation.isPending} error={createMutation.error?.message} />}

      {/* Edit User Dialog */}
      {editUser && <EditUserDialog user={editUser} onClose={() => setEditUser(null)} onSave={(d) => updateMutation.mutate({ id: editUser.id, data: d })} saving={updateMutation.isPending} />}

      {/* Reset Password Dialog */}
      {resetPwUser && <ResetPasswordDialog user={resetPwUser} onClose={() => setResetPwUser(null)} onSave={(pw) => resetPwMutation.mutate({ id: resetPwUser.id, newPassword: pw })} saving={resetPwMutation.isPending} error={resetPwMutation.error?.message} />}
    </div>
  );
}

function CreateUserDialog({ onClose, onSave, saving, error }: { onClose: () => void; onSave: (d: { email: string; password: string; fullName?: string; role?: string }) => void; saving: boolean; error?: string }) {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', role: 'student' });

  return (
    <DialogOverlay onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">Create User</h2>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      <div className="space-y-3">
        <input placeholder="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
        <input placeholder="Password *" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
        <p className="text-xs text-gray-500">Min 8 chars, uppercase, number, special char</p>
        <input placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
        <button onClick={() => onSave(form)} disabled={saving || !form.email || !form.password} className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50">
          {saving ? 'Creating...' : 'Create'}
        </button>
      </div>
    </DialogOverlay>
  );
}

function EditUserDialog({ user, onClose, onSave, saving }: { user: any; onClose: () => void; onSave: (d: any) => void; saving: boolean }) {
  const [form, setForm] = useState({ fullName: user.fullName || '', role: user.role, isActive: user.isActive });

  return (
    <DialogOverlay onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">Edit User</h2>
      <p className="text-sm text-gray-500 mb-4">{user.email}</p>
      <div className="space-y-3">
        <input placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
          Active
        </label>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
        <button onClick={() => onSave(form)} disabled={saving} className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </DialogOverlay>
  );
}

function ResetPasswordDialog({ user, onClose, onSave, saving, error }: { user: any; onClose: () => void; onSave: (pw: string) => void; saving: boolean; error?: string }) {
  const [password, setPassword] = useState('');

  return (
    <DialogOverlay onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">Reset Password</h2>
      <p className="text-sm text-gray-500 mb-4">{user.fullName || user.email}</p>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      <input placeholder="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
      <p className="text-xs text-gray-500 mt-1">Min 8 chars, uppercase, number, special char</p>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
        <button onClick={() => onSave(password)} disabled={saving || password.length < 8} className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50">
          {saving ? 'Resetting...' : 'Reset Password'}
        </button>
      </div>
    </DialogOverlay>
  );
}

function DialogOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">{children}</div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <AdminUsersContent />
    </Suspense>
  );
}
