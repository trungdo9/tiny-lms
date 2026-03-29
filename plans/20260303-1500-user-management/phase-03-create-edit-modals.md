# Phase 03 — Create & Edit User Modals
**Date:** 2026-03-03 | **Priority:** High | **Status:** Pending (depends on Phase 2)

## Context Links
- [Plan overview](./plan.md)
- [Frontend patterns research](./research/researcher-02-frontend-patterns.md)
- [Phase 02](./phase-02-frontend-page.md)
- [frontend/app/admin/users/page.tsx](../../frontend/app/admin/users/page.tsx)
- [frontend/lib/api.ts](../../frontend/lib/api.ts)

## Overview
Add Create User modal and Edit User modal inside `page.tsx`. Both are triggered by URL params (`?modal=create`, `?modal=edit&editId=<id>`), use React Hook Form for validation, and invalidate the users list on success.

## Key Insights
- Modal visibility driven by URL params — consistent with Phase 2 architecture, no extra state
- Closing modal = `router.push('?')` (clears all modal params, preserves list filters via `back` or explicit param copy)
- React Hook Form (`useForm`) for local form state; validation client-side before API call
- Edit modal pre-fills from `queryKeys.adminUsers.detail(id)` cache or fresh fetch
- Create modal: password field required; edit modal: no password field (admins can't reset via this UI)
- On create success: invalidate both `adminUsers.all` and `adminUsers.stats` (total count changes)
- On edit success: invalidate `adminUsers.all` + `adminUsers.detail(id)`

## Requirements

### Functional — Create Modal
- Fields: Full Name (optional), Email (required), Password (required), Role (select: student/instructor/admin, default student)
- Submit calls `adminUsersApi.createUser()`
- Shows server error inline (e.g., "Email already in use")
- Closes and shows success toast on completion

### Functional — Edit Modal
- Fields: Full Name, Role (select), Active toggle (boolean), Bio (textarea), Phone
- Pre-filled from existing user data (fetched via `adminUsersApi.getById(id)`)
- Submit calls `adminUsersApi.updateUser(id, data)`
- Closes and shows success toast on completion

### Functional — Reset Password (inside Edit Modal)
- Separate collapsible section inside Edit modal (below main fields)
- Single field: New Password (no old password required — admin privilege)
- Same validation rules as Create: min 8 chars, uppercase + number + special char
- Submit calls `PUT /users/admin/:id/reset-password`
- Success/error toast inline; does NOT close the modal

### Non-functional
- Loading spinner on submit button while mutation in flight
- Form reset on modal close
- shadcn `Dialog` component for modal shell

## Architecture

### Modal trigger pattern (in `UsersPage`)
```typescript
const searchParams = useSearchParams();
const router = useRouter();

const isCreateOpen = searchParams.get('modal') === 'create';
const editUserId   = searchParams.get('editId');

const closeModal = () => {
  // Preserve list params, strip modal params
  const params = new URLSearchParams(searchParams.toString());
  params.delete('modal');
  params.delete('editId');
  router.push(`?${params.toString()}`);
};
```

### Create User Modal structure
```typescript
function CreateUserModal({ onClose }: { onClose: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateUserForm>();
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: adminUsersApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User created');
      onClose();
    },
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Create User</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit((data) => mutate(data))}>
          {/* Full Name, Email, Password, Role fields */}
          {error && <p className="text-red-600 text-sm">{error.message}</p>}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create User'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Edit User Modal structure
```typescript
function EditUserModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data: user, isLoading } = useQuery({
    queryKey: queryKeys.adminUsers.detail(userId),
    queryFn: () => adminUsersApi.getById(userId),
  });
  const { register, handleSubmit, reset, watch, setValue } = useForm<EditUserForm>();

  // Pre-fill form when data loads
  useEffect(() => { if (user) reset(user); }, [user, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: EditUserForm) => adminUsersApi.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User updated');
      onClose();
    },
  });

  if (isLoading) return <Dialog open><DialogContent><Spinner /></DialogContent></Dialog>;
  // ... render form with Full Name, Role, isActive toggle, Bio, Phone
}
```

### Form field specs

**Create form fields:**
| Field | Type | Validation |
|-------|------|-----------|
| fullName | text input | optional, max 100 |
| email | email input | required, valid email format |
| password | password input | required, min 8, uppercase + number + special char |
| role | select | required, options: student / instructor / admin |

**Edit form fields:**
| Field | Type | Validation |
|-------|------|-----------|
| fullName | text input | optional, max 100 |
| role | select | required |
| isActive | checkbox/toggle | boolean |
| bio | textarea | optional, max 500 |
| phone | text input | optional, max 20 |

**Reset Password section (collapsible, inside Edit modal):**
| Field | Type | Validation |
|-------|------|-----------|
| newPassword | password input | required, min 8, uppercase + number + special char |

## Related Code Files

| File | Action | Change |
|------|--------|--------|
| `frontend/app/admin/users/page.tsx` | MODIFY | Add `CreateUserModal`, `EditUserModal` sub-components; wire modal visibility to URL params |

## Implementation Steps

1. Add `isCreateOpen`, `editUserId`, `closeModal` (strips modal params, preserves filters) to `UsersPage`
2. Mount `{isCreateOpen && <CreateUserModal onClose={closeModal} />}` and `{editUserId && <EditUserModal userId={editUserId} onClose={closeModal} />}` at bottom of JSX
3. `CreateUserModal`: Dialog → form (fullName, email, password, role) → `useMutation(adminUsersApi.createUser)` → invalidate `['admin','users']` → close
4. `EditUserModal`: `useQuery(adminUsers.detail(userId))` → `useEffect reset()` → form (fullName, role, isActive, bio, phone) + collapsible Reset Password section → two separate mutations (updateUser / resetPassword)
5. Wire "Add User" → `?modal=create`; wire row Edit → `?modal=edit&editId=<id>`
6. Inline `formState.errors` per field; `mutationResult.error.message` below form

## Todo List
- [ ] URL param reads + `closeModal` helper
- [ ] Mount modals conditionally in JSX
- [ ] `CreateUserModal`: form + mutation + invalidate
- [ ] `EditUserModal`: fetch + pre-fill + form + update mutation
- [ ] `EditUserModal`: Reset Password collapsible section + mutation
- [ ] Wire buttons to URL params; inline validation + server errors

## Success Criteria
- Clicking "Add User" opens Create modal; valid submission creates user and closes modal
- Clicking "Edit" opens Edit modal pre-filled with user data; saving updates user and closes modal
- Invalid form shows inline errors without calling API
- Server errors (e.g., duplicate email) surface as readable messages inside modal
- After create/edit, user list and stats bar refresh with updated data

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Edit modal flicker on data load | Medium | Low | Show spinner inside dialog until `isLoading` false |
| URL param strip on `closeModal` clears list filters | Low | Medium | `closeModal` preserves all non-modal params via URLSearchParams copy |
| Password validation in form not matching backend rules | Low | Medium | Mirror same regex (`/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/`) in form validation |

## Security Considerations
- Password field: `type="password"`, never logged or stored in form state beyond submission
- Role select: values hardcoded to `['student', 'instructor', 'admin']` — no free text input
- Reset Password requires no old password — admin privilege; backend guards ensure only admins can call endpoint

## Next Steps
- Phase 4: add "Users" nav link in `DashboardHeader` for admin role
