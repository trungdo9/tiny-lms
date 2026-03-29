'use client';

import { useState, useEffect, useCallback } from 'react';
import { categoriesApi, Category } from '@/lib/api';

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function CategoriesSettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoriesApi.list();
      setCategories(data);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load categories' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreate = async (data: { name: string; slug?: string; parentId?: string }) => {
    try {
      await categoriesApi.create(data);
      showMessage('success', 'Category created');
      setShowAddForm(false);
      fetchCategories();
    } catch (e: any) {
      showMessage('error', e.message || 'Failed to create category');
    }
  };

  const handleUpdate = async (id: string, data: { name?: string; slug?: string; parentId?: string }) => {
    try {
      await categoriesApi.update(id, data);
      showMessage('success', 'Category updated');
      setEditingId(null);
      fetchCategories();
    } catch (e: any) {
      showMessage('error', e.message || 'Failed to update category');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    try {
      await categoriesApi.delete(id);
      showMessage('success', 'Category deleted');
      fetchCategories();
    } catch (e: any) {
      showMessage('error', e.message || 'Failed to delete category');
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

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Course Categories</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            {showAddForm ? 'Cancel' : '+ Add Category'}
          </button>
        </div>

        <div className="px-6 py-4">
          {showAddForm && (
            <CategoryForm
              categories={categories}
              onSave={handleCreate}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {categories.length === 0 && !showAddForm ? (
            <p className="text-gray-500 text-center py-8">No categories yet. Click &quot;Add Category&quot; to create one.</p>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Slug</th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Parent</th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Courses</th>
                  <th className="px-3 py-2 text-right text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    {editingId === cat.id ? (
                      <CategoryEditRow
                        category={cat}
                        categories={categories}
                        onUpdate={handleUpdate}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <>
                        <td className="px-3 py-2 text-sm text-gray-900">{cat.name}</td>
                        <td className="px-3 py-2 text-sm text-gray-600 font-mono text-xs">{cat.slug}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{cat.parent?.name || '—'}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{cat._count?.courses || 0}</td>
                        <td className="px-3 py-2 text-right space-x-2">
                          <button
                            onClick={() => setEditingId(cat.id)}
                            className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryForm({
  categories,
  initialName = '',
  initialSlug = '',
  initialParentId = '',
  excludeId,
  onSave,
  onCancel,
}: {
  categories: Category[];
  initialName?: string;
  initialSlug?: string;
  initialParentId?: string;
  excludeId?: string;
  onSave: (data: { name: string; slug?: string; parentId?: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  const [parentId, setParentId] = useState(initialParentId);
  const [slugTouched, setSlugTouched] = useState(!!initialSlug);
  const isEdit = !!initialName;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!slugTouched) {
      setSlug(toSlug(newName));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const data: { name: string; slug?: string; parentId?: string } = { name: name.trim() };
    if (slug.trim()) data.slug = slug.trim();
    if (parentId) data.parentId = parentId;
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
      <input
        autoFocus
        value={name}
        onChange={handleNameChange}
        placeholder="Category name"
        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
        required
      />
      <input
        value={slug}
        onChange={(e) => {
          setSlug(e.target.value);
          setSlugTouched(true);
        }}
        placeholder="Slug (auto-generated)"
        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border font-mono text-xs"
      />
      <select
        value={parentId}
        onChange={(e) => setParentId(e.target.value)}
        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
      >
        <option value="">No parent</option>
        {categories
          .filter((cat) => cat.id !== excludeId)
          .map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
      </select>
      <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
        {isEdit ? 'Save' : 'Add'}
      </button>
      <button type="button" onClick={onCancel} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md text-sm">
        Cancel
      </button>
    </form>
  );
}

function CategoryEditRow({
  category,
  categories,
  onUpdate,
  onCancel,
}: {
  category: Category;
  categories: Category[];
  onUpdate: (id: string, data: { name?: string; slug?: string; parentId?: string }) => void;
  onCancel: () => void;
}) {
  return (
    <td colSpan={5} className="px-3 py-2">
      <CategoryForm
        categories={categories}
        initialName={category.name}
        initialSlug={category.slug}
        initialParentId={category.parentId || ''}
        excludeId={category.id}
        onSave={(data) => onUpdate(category.id, data)}
        onCancel={onCancel}
      />
    </td>
  );
}
