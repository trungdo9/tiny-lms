# Course Outline with Drag & Drop - Implementation Plan

## Overview
- **Goal**: Tách "Sections & Lessons" từ `[id]/page.tsx` sang `[id]/outline/page.tsx` và thêm drag & drop
- **Route**: `/instructor/courses/[id]/outline`
- **Dependencies**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (đã có trong project)

---

## Phase 1: Fix Build Error

### Task 1.1: Fix parse error in `[id]/page.tsx`
- Run: `python3 fix_page.py` from project root
- Verify build passes after fix

---

## Phase 2: Add Drag & Drop to Outline Page

### Task 2.1: Install/verify dnd-kit dependencies
```bash
npm list @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```
If not installed:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Task 2.2: Wrap sections with SortableContext
File: `frontend/app/instructor/courses/[id]/outline/page.tsx`

```tsx
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
```

### Task 2.3: Create SortableSection wrapper
```tsx
function SortableSection({ section, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <SectionCard 
        dragHandleProps={listeners}
        {...props} 
      />
    </div>
  );
}
```

### Task 2.4: Create SortableLesson wrapper for each section
```tsx
function SortableLesson({ lesson, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });
  
  // ... similar pattern
}
```

### Task 2.5: Implement drag end handler
```tsx
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  
  if (!over) return;
  
  if (active.id !== over.id) {
    // Determine if dragging sections or lessons
    const isDraggingSection = sections.some(s => s.id === active.id);
    
    if (isDraggingSection) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      
      const newSectionsections, oldIndex = arrayMove(s, newIndex);
      setSections(newSections);
      
      // Call API
      sectionsApi.reorder(courseId, newSections.map(s => s.id));
    } else {
      // Handle lesson reordering within/across sections
    }
  }
};
```

### Task 2.6: Add drag handles to UI
- Section: Add drag handle icon (⋮⋮) in section header
- Lesson: Add drag handle icon in lesson row

---

## Phase 3: Simplify [id]/page.tsx

### Task 3.1: Remove "Sections & Lessons" section
Keep only:
- Course Info card (title, description, level, status, isFree)
- Tab navigation (link to outline)

### Task 3.2: Update tab navigation
```tsx
<div className="flex gap-4 mt-3 border-b border-gray-200">
  <Link 
    href={`/instructor/courses/${courseId}`}
    className="text-sm text-gray-500 hover:text-gray-700 pb-2 border-b-2 border-transparent"
  >
    Thông tin
  </Link>
  <Link
    href={`/instructor/courses/${courseId}/outline`}
    className="text-sm font-semibold text-slate-900 pb-2 border-b-2 border-amber-400"
  >
    Course Outline
  </Link>
</div>
```

---

## Phase 4: Polish & Testing

### Task 4.1: Add visual feedback
- Highlight drop indicator when dragging
- Add subtle shadow to dragged item
- Disable drag on empty sections

### Task 4.2: Test scenarios
- [ ] Drag section to reorder
- [ ] Drag lesson within same section
- [ ] Drag lesson to different section
- [ ] API call succeeds after drop
- [ ] UI updates optimistically
- [ ] Error handling if API fails

---

## API Endpoints (Already Available)

| Endpoint | Method | Status |
|----------|--------|--------|
| `PUT /courses/:courseId/sections/reorder` | Body: `{ sectionIds: string[] }` | ✅ Available |
| `PUT /sections/:sectionId/lessons/reorder` | Body: `{ lessonIds: string[] }` | ✅ Available |

---

## Implementation Order

1. **Fix build** → `python3 fix_page.py`
2. **Add DnD to outline** → Wrap with DndContext, SortableContext
3. **Create sortable wrappers** → SortableSection, SortableLesson
4. **Implement handlers** → handleDragEnd for sections and lessons
5. **Simplify [id]/page.tsx** → Remove sections/lessons, keep link
6. **Test** → Manual browser testing

---

## File Changes Summary

| File | Change |
|------|--------|
| `frontend/app/instructor/courses/[id]/page.tsx` | Remove Sections & Lessons section, add link to outline |
| `frontend/app/instructor/courses/[id]/outline/page.tsx` | Add drag & drop with @dnd-kit |
| `frontend/lib/api.ts` | ✅ Already has `sectionsApi.reorder` and `lessonsApi.reorder` |

---

*Generated: 2026-03-03*
