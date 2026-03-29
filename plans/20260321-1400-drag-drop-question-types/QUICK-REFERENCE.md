# @dnd-kit/core Quick Reference Card

## Setup
```tsx
import { DndContext, DragOverlay, useDraggable, useDroppable, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const sensors = useSensors(useSensor(PointerSensor, { distance: 8 }));

<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  {/* Draggables & Droppables */}
  <DragOverlay>{/* Preview */}</DragOverlay>
</DndContext>
```

## Pattern 1: Word Bank → Blank Slot

### Draggable Token
```tsx
const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
  id: 'word-1',
  data: { type: 'word', word: 'apple' }
});

<div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform) }} {...listeners} {...attributes}>
  {word}
</div>
```

### Droppable Slot
```tsx
const { setNodeRef, isOver } = useDroppable({ id: 'slot-1', data: { type: 'slot' } });

<span ref={setNodeRef} className={isOver ? 'ring-2 ring-blue-500' : ''} style={{ display: 'inline-block', minWidth: '6rem' }}>
  {filledWord || '______'}
</span>
```

### Handler
```tsx
const handleDragEnd = ({ active, over }) => {
  if (!over || active.data.type !== 'word') return;
  setFilled(prev => ({ ...prev, [over.id]: active.data.word }));
};
```

**CSS:** `display: inline-block` on slot | **Collision:** `closestCenter`

---

## Pattern 2: Label → Image Zone

### Draggable Label
```tsx
const { attributes, listeners, setNodeRef, transform } = useDraggable({
  id: 'label-1',
  data: { type: 'label', label: 'Heart' }
});

<div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform) }} {...listeners} {...attributes}>
  {label}
</div>
```

### Droppable Zone
```tsx
const { setNodeRef, isOver } = useDroppable({ id: 'zone-1', data: { type: 'zone', x, y, radius } });

<div
  ref={setNodeRef}
  style={{
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${radius * 2}px`,
    height: `${radius * 2}px`,
    transform: 'translate(-50%, -50%)',
  }}
  className={isOver ? 'ring-2 ring-blue-500' : ''}
>
  {label}
</div>
```

### Handler
```tsx
const handleDragEnd = ({ active, over }) => {
  if (!over || active.data.type !== 'label') return;
  setPlaced(prev => ({ ...prev, [over.id]: active.data.label }));
};
```

**CSS:** `position: absolute` on zone parent | **Collision:** `pointerWithin`

---

## Visual Feedback

### Overlay Preview
```tsx
function DragPreview() {
  const { active } = useDndMonitor();
  return (
    <DragOverlay>
      {active && <div className="px-3 py-2 bg-blue-300 rounded shadow-lg">{active.data.word || active.data.label}</div>}
    </DragOverlay>
  );
}
```

### Hover Highlight
```tsx
<span className={isOver ? 'scale-110 ring-2 ring-blue-500' : ''} style={{ transition: 'all 150ms' }} />
```

---

## Critical Gotchas

| Gotcha | Solution |
|--------|----------|
| Drag doesn't work | Attach `setNodeRef` to DOM element |
| Text wrapping breaks | Use `display: inline-block` on slot, not `position: absolute` |
| Zone not detecting drop | Use `collisionDetection={pointerWithin}` |
| Mobile feedback unclear | Include `<DragOverlay>` with preview |
| Touch too sensitive | Add `distance: 8` to PointerSensor |

---

## Collision Detection Cheat Sheet

```tsx
// Text slots
collisionDetection={closestCenter}      // Default, works for text

// Image zones
collisionDetection={pointerWithin}      // Any overlap, best for touch

// Grid layouts (avoid for these patterns)
collisionDetection={closestCorners}
```

---

## Touch Support (Automatic)

No manual handling needed:
```tsx
const sensors = useSensors(
  useSensor(PointerSensor, { distance: 8 })  // Unifies mouse/touch/pen
);
// Library handles touchstart, touchmove, touchend automatically
```

---

## Testing Pattern

```tsx
// Test placement logic
const { active, over } = { active: { data: { word: 'apple' } }, over: { id: 'slot-1' } };
expect(filled['slot-1']).toBe('apple');

// E2E drag test (Cypress/Playwright)
await userEvent.dragAndDrop(screen.getByText('apple'), screen.getByRole('button'));
```

---

## File Structure

```
plans/20260321-1400-drag-drop-question-types/research/
├── README.md                                 (index & overview)
├── 01-core-api-reference.md                  (DndContext, hooks, sensors)
├── 02-word-bank-blank-slot-pattern.md        (Pattern 1 full implementation)
├── 03a-image-label-zones-basic.md            (Pattern 2 basic)
├── 03b-image-responsive-svg.md               (Pattern 2 advanced: SVG, scaling)
├── 04-overlay-preview-pattern.md             (Feedback & visual cues)
└── 05-tradeoffs-summary.md                   (Comparison, pitfalls, testing)
```

---

## One-Liner Recommendation

**Use @dnd-kit/core** (22KB gzipped, already in dependencies, excellent mobile UX via pointer events).
