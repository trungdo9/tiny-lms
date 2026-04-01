# Phase 01: Shared UI Components

## Context
- Admin and instructor create course pages are nearly identical
- Current form has UX issues: cluttered clone options, no thumbnail preview, plain level dropdown
- Shared component avoids code duplication

## Overview
- **Date**: 2026-03-31
- **Priority**: High
- **Status**: Pending

## Requirements
- Create reusable form components in `frontend/components/course/`
- Use CVA (class-variance-authority) for consistent styling
- Use existing `lib/utils.ts` cn() helper
- Components must work with both admin and instructor redirect URLs

## Key Components to Build

### 1. CourseTypeSelector.tsx
Tabbed interface using Radix Tabs to choose between:
- **Blank Course**: Create empty course (default selected)
- **Clone from Existing**: Reveals clone fields when selected

```tsx
interface CourseTypeSelectorProps {
  value: 'blank' | 'clone';
  onChange: (type: 'blank' | 'clone') => void;
  cloneFields?: React.ReactNode; // Rendered inside Tabs.Content for 'clone'
}
```

Clone fields to render when 'clone' selected:
- Source Course ID input
- Quiz import mode select
- Quiz IDs textarea (conditional on import_from_quizzes mode)

These can be passed as `cloneFields` prop or rendered directly in `CreateCourseForm` using conditional rendering.

### 2. LevelSelector.tsx
Visual card-based level picker replacing plain dropdown. Cards with icons:
- Beginner: green, book icon
- Intermediate: amber, trending up icon
- Advanced: red, award icon

```tsx
interface LevelSelectorProps {
  value: 'beginner' | 'intermediate' | 'advanced';
  onChange: (level: 'beginner' | 'intermediate' | 'advanced') => void;
}
```

### 3. ThumbnailInput.tsx
URL input with live image preview. Shows placeholder when URL empty/invalid.

```tsx
interface ThumbnailInputProps {
  value: string;
  onChange: (url: string) => void;
  error?: string; // Inline validation error
}
```

### 4. FreeCourseToggle.tsx
Switch/toggle replacing checkbox for better visibility.

```tsx
interface FreeCourseToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}
```

Uses a styled toggle switch (not checkbox) for better visibility. Label clearly states "Free Course".

### 5. CreateCourseForm.tsx
Main form component composes all pieces.

```tsx
interface CreateCourseFormProps {
  redirectTo: string; // '/instructor/courses/${id}' or '/admin/courses/${id}'
  cloneEndpoint?: string; // Optional base clone URL
}
```

## Related Code Files

### Files to CREATE:
- `frontend/components/course/CourseTypeSelector.tsx`
- `frontend/components/course/LevelSelector.tsx`
- `frontend/components/course/ThumbnailInput.tsx`
- `frontend/components/course/FreeCourseToggle.tsx`
- `frontend/components/course/CreateCourseForm.tsx`

### Files to REFERENCE:
- `frontend/components/retroui/Button.tsx` — for button variants
- `frontend/lib/utils.ts` — for cn() helper
- `frontend/app/instructor/courses/create/page.tsx` — current form logic to extract

## Implementation Steps

1. Create `frontend/components/course/` directory
2. Build `LevelSelector.tsx` with 3 clickable cards, icon + label
3. Build `ThumbnailInput.tsx` with img preview, fallback placeholder
4. Build `CourseTypeSelector.tsx` with two tabs, second tab reveals clone options via Radix Collapsible
5. Build `CreateCourseForm.tsx` composing all above + title/description/isFree inputs
6. Extract redirect URL logic to props

## Todo List
- [ ] Create `frontend/components/course/` directory
- [ ] Build LevelSelector component with 3 cards
- [ ] Build ThumbnailInput component with preview
- [ ] Build FreeCourseToggle component (switch UI)
- [ ] Build CourseTypeSelector with Radix Tabs (not Collapsible)
- [ ] Build CreateCourseForm composing all pieces
- [ ] Verify clone fields render when Clone tab is selected
- [ ] Test components render correctly in isolation

## Success Criteria
- All 5 components created and exported
- Components use Tailwind + CVA consistently
- LevelSelector shows 3 visual cards, one selected state
- ThumbnailInput shows preview when valid URL, placeholder when empty/invalid
- Clone options hidden by default, revealed on tab switch (Radix Tabs)
- FreeCourseToggle shows switch UI, not small checkbox
- Form submission logic extracted to CreateCourseForm

## Security Considerations
- No new attack surface
- URL input still sanitized by browser (type="url")
- No client-side auth changes

## Next Steps
- Phase 02: Replace existing form pages with shared component
- Phase 03: Update e2e tests
