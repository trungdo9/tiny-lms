'use client';

import { useState, useEffect, useCallback } from 'react';
import { departmentsApi, Department } from '@/lib/api';

interface DepartmentNode extends Department {
  children?: DepartmentNode[];
}

export default function DepartmentsSettingsPage() {
  const [departments, setDepartments] = useState<DepartmentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingParentId, setAddingParentId] = useState<string | null | undefined>(undefined); // undefined = not adding, null = adding root

  const fetchDepartments = useCallback(async () => {
    try {
      const data = await departmentsApi.list();
      setDepartments(data);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load departments' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreate = async (data: { name: string; description?: string; parentId?: string }) => {
    try {
      await departmentsApi.create(data);
      showMessage('success', 'Department created');
      setAddingParentId(undefined);
      fetchDepartments();
    } catch {
      showMessage('error', 'Failed to create department');
    }
  };

  const handleUpdate = async (id: string, data: { name?: string; description?: string; status?: string }) => {
    try {
      await departmentsApi.update(id, data);
      showMessage('success', 'Department updated');
      setEditingId(null);
      fetchDepartments();
    } catch {
      showMessage('error', 'Failed to update department');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete department "${name}"? This cannot be undone.`)) return;
    try {
      await departmentsApi.delete(id);
      showMessage('success', 'Department deleted');
      fetchDepartments();
    } catch (e: any) {
      showMessage('error', e.message || 'Failed to delete department');
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
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Departments</h2>
          <button
            onClick={() => setAddingParentId(null)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Add Department
          </button>
        </div>

        <div className="px-6 py-4">
          {addingParentId === null && (
            <DepartmentForm
              onSave={(data) => handleCreate(data)}
              onCancel={() => setAddingParentId(undefined)}
            />
          )}

          {departments.length === 0 && addingParentId === undefined ? (
            <p className="text-gray-500 text-center py-8">No departments yet. Click &quot;Add Department&quot; to create one.</p>
          ) : (
            <div className="space-y-1">
              {departments.map((dept) => (
                <DepartmentNodeView
                  key={dept.id}
                  department={dept}
                  depth={0}
                  editingId={editingId}
                  addingParentId={addingParentId}
                  onEdit={setEditingId}
                  onAdd={setAddingParentId}
                  onUpdate={handleUpdate}
                  onCreate={handleCreate}
                  onDelete={handleDelete}
                  onCancelEdit={() => setEditingId(null)}
                  onCancelAdd={() => setAddingParentId(undefined)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DepartmentNodeView({
  department,
  depth,
  editingId,
  addingParentId,
  onEdit,
  onAdd,
  onUpdate,
  onCreate,
  onDelete,
  onCancelEdit,
  onCancelAdd,
}: {
  department: DepartmentNode;
  depth: number;
  editingId: string | null;
  addingParentId: string | null | undefined;
  onEdit: (id: string) => void;
  onAdd: (parentId: string) => void;
  onUpdate: (id: string, data: { name?: string; description?: string; status?: string }) => void;
  onCreate: (data: { name: string; description?: string; parentId?: string }) => void;
  onDelete: (id: string, name: string) => void;
  onCancelEdit: () => void;
  onCancelAdd: () => void;
}) {
  const isEditing = editingId === department.id;
  const isAddingChild = addingParentId === department.id;

  return (
    <div>
      <div
        className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-gray-50 group"
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        {department.children && department.children.length > 0 && (
          <span className="text-gray-400 text-xs">▼</span>
        )}
        {(!department.children || department.children.length === 0) && (
          <span className="text-gray-300 text-xs">●</span>
        )}

        {isEditing ? (
          <DepartmentForm
            initialName={department.name}
            initialDescription={department.description || ''}
            initialStatus={department.status}
            onSave={(data) => onUpdate(department.id, data)}
            onCancel={onCancelEdit}
          />
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-900">{department.name}</span>
              {department.description && (
                <span className="ml-2 text-xs text-gray-500">{department.description}</span>
              )}
              {department.status !== 'active' && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                  {department.status}
                </span>
              )}
            </div>
            <div className="hidden group-hover:flex items-center gap-1">
              <button
                onClick={() => onAdd(department.id)}
                className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                title="Add sub-department"
              >
                + Sub
              </button>
              <button
                onClick={() => onEdit(department.id)}
                className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(department.id, department.name)}
                className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      {isAddingChild && (
        <div style={{ paddingLeft: `${(depth + 1) * 24 + 12}px` }} className="py-2">
          <DepartmentForm
            onSave={(data) => onCreate({ ...data, parentId: department.id })}
            onCancel={onCancelAdd}
          />
        </div>
      )}

      {department.children?.map((child) => (
        <DepartmentNodeView
          key={child.id}
          department={child}
          depth={depth + 1}
          editingId={editingId}
          addingParentId={addingParentId}
          onEdit={onEdit}
          onAdd={onAdd}
          onUpdate={onUpdate}
          onCreate={onCreate}
          onDelete={onDelete}
          onCancelEdit={onCancelEdit}
          onCancelAdd={onCancelAdd}
        />
      ))}
    </div>
  );
}

function DepartmentForm({
  initialName = '',
  initialDescription = '',
  initialStatus,
  onSave,
  onCancel,
}: {
  initialName?: string;
  initialDescription?: string;
  initialStatus?: string;
  onSave: (data: { name: string; description?: string; status?: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [status, setStatus] = useState(initialStatus || 'active');
  const isEdit = !!initialName;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const data: { name: string; description?: string; status?: string } = { name: name.trim() };
    if (description.trim()) data.description = description.trim();
    if (isEdit) data.status = status;
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Department name"
        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-1.5 border"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-1.5 border"
      />
      {isEdit && (
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-1.5 border"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      )}
      <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
        {isEdit ? 'Save' : 'Add'}
      </button>
      <button type="button" onClick={onCancel} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md text-sm">
        Cancel
      </button>
    </form>
  );
}
