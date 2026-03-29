# Phase 02 — Frontend Admin: Create Analytics Settings Page

**Date:** 2026-03-19
**Status:** Pending (depends on Phase 1)
**Priority:** High (unblocks Phase 3)

---

## Context Links

- Settings Layout: `frontend/app/admin/settings/layout.tsx`
- Settings API: `frontend/lib/api.ts:217–232`
- Pattern Example: `frontend/app/admin/settings/contact-sync/page.tsx` (reference)
- Helper Component: `frontend/app/admin/settings/email/email-setting-field.tsx` (reusable UI)

---

## Overview

Create a new admin settings page at `/admin/settings/analytics` with an input field for GA code. Follow the existing contact-sync settings page pattern: load settings on mount, display fields, allow editing, save via API. Add "Analytics" tab to the settings layout navigation.

---

## Key Insights

- Settings are loaded via `settingsApi.getByCategory('category_name')` which returns array of Setting objects
- Each Setting has `{key, value, type, isSecret}` structure
- `EmailSettingField` component handles individual field rendering (can be reused)
- Save via `settingsApi.update(key, {value, type})` which sends PUT request
- Toast-style messages for success/error feedback
- Pattern: load in useEffect, manage local state, save on button click

---

## Requirements

**Functional:**
- Page at `/admin/settings/analytics` (admin only, protected by layout)
- Load settings from `settingsApi.getByCategory('analytics')`
- Display `analytics_ga_code` in text input field
- Label: "Google Analytics ID"
- Placeholder: "e.g., G-XXXXXXXXXX"
- Help text: "Your GA4 Measurement ID. Leave empty to use environment variable."
- Save button triggers `settingsApi.update('analytics_ga_code', {value, type: 'string'})`
- Loading state while fetching
- Success/error toast messages
- Validation feedback (optional)

**Non-Functional:**
- Consistent styling with existing settings pages
- Responsive design
- Keyboard accessible
- Follow Contact Sync page pattern exactly

---

## Architecture

```
/admin/settings/analytics page
├─ useEffect: loadData()
│  └─ settingsApi.getByCategory('analytics')
│     └─ Returns: [{key: 'analytics_ga_code', value: '', type: 'string', ...}]
├─ State: settings[], loading, saving, message
├─ UI: 
│  ├─ Title + Description
│  ├─ Loading indicator
│  ├─ GA Code field
│  │  └─ Type: text input
│  │  └─ Label: "Google Analytics ID"
│  │  └─ Help text + regex validation
│  ├─ Message toast (success/error)
│  └─ Save button (disabled while saving)
└─ handleSave() → settingsApi.update()
```

---

## Related Code Files

| File | Action | Change |
|------|--------|--------|
| `frontend/app/admin/settings/layout.tsx` | Modify | Add `{ name: 'Analytics', href: '/admin/settings/analytics' }` to tabs array |
| `frontend/app/admin/settings/analytics/page.tsx` | Create | New settings page component |
| `frontend/lib/api.ts` | No change | Existing settingsApi.getByCategory() + update() already handle this |

---

## Implementation Steps

### Step 1 — Update Layout Navigation

**File:** `frontend/app/admin/settings/layout.tsx`

**Modify the tabs array:**

```typescript
const tabs = [
  { name: 'General', href: '/admin/settings' },
  { name: 'Email', href: '/admin/settings/email' },
  { name: 'Templates', href: '/admin/settings/email/templates' },
  { name: 'Logs', href: '/admin/settings/email/logs' },
  { name: 'Branding', href: '/admin/settings/branding' },
  { name: 'Auth', href: '/admin/settings/auth' },
  { name: 'Organization', href: '/admin/settings/organization' },
  { name: 'Departments', href: '/admin/settings/departments' },
  { name: 'Categories', href: '/admin/settings/categories' },
  { name: 'Contact Sync', href: '/admin/settings/contact-sync' },
  { name: 'Analytics', href: '/admin/settings/analytics' },  // Add this line
];
```

### Step 2 — Create Analytics Settings Page

**File:** `frontend/app/admin/settings/analytics/page.tsx`

**Full implementation:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { settingsApi } from '@/lib/api';

interface Setting {
  key: string;
  value: unknown;
  type: string;
  isSecret?: boolean;
}

export default function AnalyticsSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [gaCode, setGaCode] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await settingsApi.getByCategory('analytics') as Setting[];
      setSettings(data);
      const gaSetting = data.find(s => s.key === 'analytics_ga_code');
      if (gaSetting) {
        setGaCode(gaSetting.value as string || '');
      }
    } catch (err) {
      console.error('Failed to load analytics settings:', err);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await settingsApi.update('analytics_ga_code', { value: gaCode, type: 'string' });
      setMessage({ type: 'success', text: 'Analytics settings saved successfully' });
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.message || 'Failed to save analytics settings' 
      });
    } finally {
      setSaving(false);
    }
  };

  const isValidGACode = (code: string) => {
    if (!code) return true; // Empty is OK
    return /^G-[A-Z0-9]{10}$/.test(code);
  };

  const validationError = !isValidGACode(gaCode) ? 'Invalid format: expected G-XXXXXXXXXX' : null;

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
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Analytics Settings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure Google Analytics for tracking user interactions
          </p>
        </div>

        <div className="px-6 py-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Analytics ID
            </label>
            <input
              type="text"
              value={gaCode}
              onChange={(e) => setGaCode(e.target.value.toUpperCase())}
              placeholder="e.g., G-XXXXXXXXXX"
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border ${
                validationError ? 'border-red-500' : ''
              }`}
              disabled={saving}
            />
            <p className="mt-2 text-xs text-gray-500">
              Your GA4 Measurement ID. Found in Google Analytics: Admin → Property Settings → Measurement ID
            </p>
            {validationError && (
              <p className="mt-1 text-xs text-red-600">{validationError}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Leave empty to use the <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_GA_ID</code> environment variable.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || validationError !== null}
            className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Step 3 — Directory Structure

Ensure directory exists:
```bash
mkdir -p frontend/app/admin/settings/analytics
```

---

## Todo List

- [ ] Modify `frontend/app/admin/settings/layout.tsx` — add Analytics tab
- [ ] Create `frontend/app/admin/settings/analytics/page.tsx` — full implementation
- [ ] Test: Navigate to `/admin/settings/analytics`
- [ ] Test: Page loads and displays GA code input
- [ ] Test: Entering GA code and saving works
- [ ] Test: Error message shown if API fails
- [ ] Test: Validation feedback shown for invalid format
- [ ] Test: Tab is highlighted when on analytics page

---

## Success Criteria

- [ ] `/admin/settings/analytics` page exists and renders
- [ ] "Analytics" tab visible in settings layout
- [ ] Load from DB shows current GA code value (or empty)
- [ ] User can edit GA code in input field
- [ ] Save button triggers API call
- [ ] Success toast shown on save
- [ ] Error toast shown if save fails
- [ ] Validation error shown for invalid GA ID format
- [ ] Empty string is accepted (fallback to env var)
- [ ] Page matches styling of contact-sync settings page

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Validation too strict, blocks valid GA IDs | Low | Test with real GA IDs; allow empty string |
| API call fails silently | Very Low | Wrapped in try/catch, error message shown |
| Loading state not cleared on error | Low | Finally block always sets loading=false |
| Typos in GA code not caught | Low | Validation feedback shown, admin can fix |

---

## UI/UX Considerations

- Placeholder shows example: `G-XXXXXXXXXX`
- Help text explains what GA ID is and where to find it
- Validation provides clear error message
- Success/error messages appear above form
- Save button disabled while saving
- Input field uppercased automatically (GA IDs are uppercase)
- Fallback info: "Leave empty to use env var"

---

## Accessibility

- Form label associated with input
- Error messages color-coded (red for error, green for success)
- Disabled state applied to input when saving
- Help text uses semantic `<p>` tags

---

## Next Steps

- After Phase 1 completes: backend GA code seeded, this phase can start
- After Phase 2 completes: Phase 3 can fetch and use the GA code in layout
- Phase 3 will initialize GA script with value from this page
