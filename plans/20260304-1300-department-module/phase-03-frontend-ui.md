# Phase 03 -- Frontend UI

**Ref:** [plan.md](./plan.md)
**Blocked by:** [phase-02-backend-api.md](./phase-02-backend-api.md)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-04 |
| Description | Admin settings page with tree view for department management |
| Priority | High |
| Status | Pending |

---

## Key Insights

- Page lives at `frontend/app/admin/settings/departments/page.tsx` -- under existing admin settings layout
- Add "Departments" tab to settings layout (`frontend/app/admin/settings/layout.tsx`)
- Use TanStack Query for data fetching (matches all other pages)
- Add `departmentsApi` to `frontend/lib/api.ts` and query keys to `frontend/lib/query-keys.ts`
- Tree rendering: recursive component, collapsible nodes with indent
- Add/edit via inline form or modal dialog (shadcn Dialog)
- Delete with confirmation dialog
- No drag-and-drop for ordering (KISS); use up/down arrows or orderIndex input

---

## Context Links

- `frontend/app/admin/settings/layout.tsx` -- settings tabs (add "Departments" tab)
- `frontend/app/admin/settings/page.tsx` -- existing settings page pattern
- `frontend/lib/api.ts` -- fetchApi pattern
- `frontend/lib/query-keys.ts` -- query key structure

---

## Requirements

- Admin settings page at `/admin/settings/departments`
- Tree view displaying department hierarchy
- Add root department
- Add sub-department (child of selected node)
- Edit department (name, description, status)
- Delete department (with confirmation, blocked if has children)
- Visual indent for hierarchy levels

---

## Architecture

### API Client -- add to `frontend/lib/api.ts`

```typescript
export interface Department {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  status: string;
  orderIndex: number;
  children?: Department[];
}

export const departmentsApi = {
  list: () => fetchApi<Department[]>('/departments'),
  get: (id: string) => fetchApi<Department>(`/departments/${id}`),
  create: (data: { name: string; description?: string; parentId?: string; status?: string; orderIndex?: number }) =>
    fetchApi('/departments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<{ name: string; description: string; parentId: string; status: string; orderIndex: number }>) =>
    fetchApi(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchApi(`/departments/${id}`, { method: 'DELETE' }),
};
```

### Query Keys -- add to `frontend/lib/query-keys.ts`

```typescript
departments: {
  list: () => ['departments', 'list'] as const,
  detail: (id: string) => ['departments', 'detail', id] as const,
},
```

### Settings Layout -- update tabs

```typescript
// Add to tabs array in frontend/app/admin/settings/layout.tsx:
{ name: 'Departments', href: '/admin/settings/departments' },
```

### Page Structure

```
frontend/app/admin/settings/departments/
  page.tsx          -- main page with tree + CRUD
```

### `page.tsx` -- component outline

```tsx
'use client';

// Uses useQuery to fetch tree, useMutation for CUD
// DepartmentTree recursive component renders nodes
// Dialog for add/edit form
// Confirmation dialog for delete

function DepartmentNode({ dept, level, onEdit, onAddChild, onDelete }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{ paddingLeft: `${level * 24}px` }}>
      <div className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded">
        {dept.children?.length > 0 && (
          <button onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown /> : <ChevronRight />}
          </button>
        )}
        <span className="font-medium">{dept.name}</span>
        <Badge variant={dept.status === 'active' ? 'default' : 'secondary'}>
          {dept.status}
        </Badge>
        <div className="ml-auto flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => onAddChild(dept.id)}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(dept)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(dept)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {expanded && dept.children?.map(child => (
        <DepartmentNode key={child.id} dept={child} level={level + 1} ... />
      ))}
    </div>
  );
}
```

### UI Components Used

- `Button`, `Dialog`, `Input`, `Label`, `Textarea`, `Badge` from shadcn/ui
- `ChevronDown`, `ChevronRight`, `Plus`, `Pencil`, `Trash2` from lucide-react
- Standard Tailwind utility classes

---

## Related Code Files

| File | Change |
|------|--------|
| `frontend/app/admin/settings/departments/page.tsx` | New -- main departments page |
| `frontend/app/admin/settings/layout.tsx` | Add "Departments" tab |
| `frontend/lib/api.ts` | Add `departmentsApi` |
| `frontend/lib/query-keys.ts` | Add `departments` keys |

---

## Implementation Steps

1. Add `departmentsApi` to `frontend/lib/api.ts`
2. Add `departments` query keys to `frontend/lib/query-keys.ts`
3. Add "Departments" tab to `frontend/app/admin/settings/layout.tsx`
4. Create `frontend/app/admin/settings/departments/page.tsx`:
   - useQuery for fetching tree
   - DepartmentNode recursive component
   - Add/Edit dialog with form (name, description, status, parentId)
   - Delete confirmation dialog
   - useMutation for create, update, delete with queryClient.invalidateQueries
5. Test full CRUD flow in browser

---

## Todo List

- [ ] Add departmentsApi to api.ts
- [ ] Add departments query keys
- [ ] Add Departments tab to settings layout
- [ ] Create departments page with tree view
- [ ] Implement add department (root + child)
- [ ] Implement edit department dialog
- [ ] Implement delete with confirmation
- [ ] Handle loading/error states
- [ ] Test tree rendering with nested departments

---

## Success Criteria

- `/admin/settings/departments` renders department tree
- Can create root departments and sub-departments
- Can edit department name/description/status
- Can delete leaf departments (blocked if has children, show error)
- Tree expands/collapses correctly
- UI matches existing admin settings style (white card, clean layout)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| shadcn Dialog not installed | Low | Low | Run `npx shadcn@latest add dialog` if needed |
| Deep nesting renders poorly | Low | Low | Most orgs have 3-4 levels max |
| No departments tab visible | Low | Low | Verify layout.tsx tab array is updated |

---

## Security Considerations

- Page protected by AdminGuard in `frontend/app/admin/layout.tsx`
- API calls require auth token (SupabaseAuthGuard on backend)
- No sensitive data displayed

---

## Next Steps

- Optional future: assign users to departments in admin user edit page
- Optional future: filter courses/reports by department
