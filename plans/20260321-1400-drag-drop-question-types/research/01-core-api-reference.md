# @dnd-kit/core API Reference

**Version:** @dnd-kit/core ^6.3.1

## DndContext Setup

```tsx
import { DndContext, DragOverlay, PointerSensor, useSensors } from '@dnd-kit/core';

const sensors = useSensors(
  useSensor(PointerSensor, { distance: 8 }), // Detect drag after 8px movement
  useSensor(KeyboardSensor),                  // Accessibility
);

<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragStart={handleStart}
  onDragEnd={handleEnd}
  onDragOver={handleOver}
>
  {/* Draggable & Droppable items */}
</DndContext>
```

**Key Props:**
- `sensors`: Detect drag activation (PointerSensor, TouchSensor, KeyboardSensor)
- `collisionDetection`: Algorithm for drop target detection
- `onDragStart/End/Over/Move/Cancel`: Lifecycle handlers
- `autoScroll`: Auto-scroll when dragging near edges

## useDraggable Hook

```tsx
const {
  attributes,          // ARIA attributes (role, aria-pressed, tabIndex)
  listeners,           // Event handlers (onMouseDown, onTouchStart, etc.)
  setNodeRef,          // Attach to draggable element
  isDragging,          // Boolean flag
  transform,           // {x, y} translation during drag
  active,              // Current active drag
  over,                // Element being dragged over
} = useDraggable({
  id: 'word-token-1',  // Unique identifier (string | number)
  data: { type: 'word', value: 'apple' }, // Custom metadata
  disabled: false,
});

// Render with transform
<div
  ref={setNodeRef}
  style={{ transform: CSS.Translate.toString(transform) }}
  {...listeners}
  {...attributes}
  className="cursor-grab active:cursor-grabbing"
>
  {children}
</div>
```

**Return Values:**
- `setNodeRef`: Must attach to DOM element for measurements
- `listeners`: Spread on element to activate drag
- `transform`: Use with CSS.Translate.toString() for animation
- `isDragging`: True only during active drag
- `over`: Contains dropped-on element ID/data
- `attributes`: ARIA accessibility attributes

## useDroppable Hook

```tsx
const {
  setNodeRef,    // Attach to drop target
  isOver,        // Boolean: drag item is over this zone
  active,        // Current dragging item (if any)
  over,          // This droppable's position info (if isOver)
} = useDroppable({
  id: 'slot-1',
  data: { type: 'blank-slot', index: 0 },
  disabled: false,
});

<div
  ref={setNodeRef}
  className={isOver ? 'highlight-drop-zone' : ''}
>
  {children}
</div>
```

**Key Behaviors:**
- `isOver` updates based on collision detection algorithm
- `active` always available if dragging (check active?.id)
- No transform returned (targets stay in place)

## Collision Detection Algorithms

| Algorithm | Use Case | Notes |
|-----------|----------|-------|
| `closestCenter` | General purpose | Matches center distance; **default** |
| `closestCorners` | Grids | Better for grid-based layouts |
| `pointerWithin` | Loose targets | Any overlap; best for large zones |
| `rectIntersection` | Precise areas | Exact rectangle overlap; strict |

**Recommendations:**
- Image zones: Use `pointerWithin` (forgiving overlap)
- Inline slots: Use `closestCenter` (text sensitivity)

## useDndMonitor Hook

```tsx
const { active, over, activators } = useDndMonitor();

// Monitor ALL drag events without being inside DndContext
useEffect(() => {
  if (active) console.log('Dragging:', active.id);
}, [active]);
```

Used for centralized overlay previews and global drag state.

## DragOverlay Component

```tsx
<DragOverlay dropAnimation={defaultDropAnimation}>
  {active && active.data.type === 'word' && (
    <div className="px-2 py-1 bg-blue-300 rounded shadow-lg cursor-grabbing">
      {active.data.word}
    </div>
  )}
</DragOverlay>
```

**Benefits:**
- Renders above all other content (portal)
- Follows pointer position automatically
- Smooth drop animation on release
- Essential for mobile clarity

## Touch & Pointer Events

@dnd-kit/core handles touch via sensors (no manual binding):

```tsx
const sensors = useSensors(
  useSensor(PointerSensor, {
    distance: 8,  // Activation distance (px) - prevents click-drag
  }),
  useSensor(TouchSensor, {
    distance: 8,  // Fallback for older browsers
  }),
  useSensor(KeyboardSensor),
);
```

**Key Points:**
- `PointerSensor` unifies mouse, touch, pen events (modern standard)
- `distance` prevents accidental drags on click
- Listeners automatically attach handlers
- Transform works seamlessly on mobile & desktop
- No need to manually handle touchstart/touchmove

## CSS Transform Utilities

```tsx
import { CSS } from '@dnd-kit/utilities';

// For draggables during drag
const { transform } = useDraggable({...});
style={{ transform: CSS.Translate.toString(transform) }}

// Alternative: Custom transform
style={{ transform: `translate(${transform.x}px, ${transform.y}px)` }}
```

Always use `CSS.Translate.toString()` for consistency with transforms.
