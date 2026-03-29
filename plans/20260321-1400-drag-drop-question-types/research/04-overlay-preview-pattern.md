# Pattern: DragOverlay Preview & Visual Feedback

Rendering drag previews above all content and providing visual feedback during drag.

## DragOverlay Component

```tsx
import { DragOverlay, defaultDropAnimation } from '@dnd-kit/core';

function DragPreview() {
  const { active } = useDndMonitor();

  return (
    <DragOverlay dropAnimation={defaultDropAnimation}>
      {active && (
        <div className="px-3 py-2 bg-blue-300 rounded shadow-lg cursor-grabbing">
          {active.data.word || active.data.label}
        </div>
      )}
    </DragOverlay>
  );
}

// Place once at root level
<DndContext>
  <YourApp />
  <DragPreview />
</DndContext>
```

**Benefits:**
- Renders above all content (portal/z-index)
- Follows pointer automatically
- Smooth drop animation on release
- Essential for mobile clarity (large visual feedback)

## Pattern-Specific Overlays

### Word Bank Preview

```tsx
function WordBankDragPreview() {
  const { active } = useDndMonitor();

  if (!active || active.data.type !== 'word') return null;

  return (
    <DragOverlay>
      <div className="px-3 py-2 bg-blue-300 rounded shadow-xl border-2 border-blue-500">
        <span className="text-sm font-semibold text-white">
          {active.data.word}
        </span>
      </div>
    </DragOverlay>
  );
}
```

### Image Label Preview

```tsx
function ImageLabelDragPreview() {
  const { active } = useDndMonitor();

  if (!active || active.data.type !== 'label') return null;

  return (
    <DragOverlay>
      <div className="px-4 py-3 bg-blue-400 rounded shadow-xl text-white font-medium">
        {active.data.label}
      </div>
    </DragOverlay>
  );
}
```

## Drop Animation

Customize drop animation on release:

```tsx
import { defaultDropAnimation, DropAnimationFunctionArguments } from '@dnd-kit/core';

const dropAnimation = defaultDropAnimation;
// or
const customDropAnimation: DropAnimationFunction = ({
  isSorting,
  animatingNodeRect,
  newRect,
  transform,
}: DropAnimationFunctionArguments) => {
  if (isSorting) {
    return {
      duration: 200,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      transform: newRect
        ? `translate3d(0, 0, 0)`
        : `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    };
  }
  return null;
};

<DragOverlay dropAnimation={customDropAnimation}>
  {/* ... */}
</DragOverlay>
```

## Over/Hover Visual Feedback

Highlight drop zones during drag:

### Slot Highlighting

```tsx
function BlankSlot({ slotId, filledWord }: any) {
  const { setNodeRef, isOver, active } = useDroppable({ id: slotId });

  return (
    <span
      ref={setNodeRef}
      className={`
        inline-block min-w-24 px-2 py-1 border-b-2 transition-all
        ${filledWord ? 'bg-green-100' : 'bg-yellow-100'}
        ${
          isOver && active?.data.type === 'word'
            ? 'ring-2 ring-blue-500 ring-offset-1 scale-110'
            : ''
        }
      `}
    >
      {filledWord || '______'}
    </span>
  );
}
```

### Zone Highlighting

```tsx
function DropZone({ id, x, y, radius, label }: any) {
  const { setNodeRef, isOver, active } = useDroppable({ id });

  return (
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
      className={`
        rounded-full border-2 transition-all
        ${
          isOver && active?.data.type === 'label'
            ? 'border-blue-500 bg-blue-200 scale-125'
            : 'border-gray-300 bg-gray-100/20'
        }
      `}
    >
      {label && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
          {label}
        </div>
      )}
    </div>
  );
}
```

## Disabled/Invalid Drop Feedback

```tsx
function BlankSlot({ slotId, filledWord, allowedType }: any) {
  const { setNodeRef, isOver, active } = useDroppable({ id: slotId });

  const canAccept = active && active.data.type === allowedType;
  const isInvalid = isOver && !canAccept;

  return (
    <span
      ref={setNodeRef}
      className={`
        inline-block min-w-24 px-2 py-1 border-b-2 transition-all
        ${filledWord ? 'bg-green-100' : 'bg-yellow-100'}
        ${isOver && canAccept ? 'ring-2 ring-blue-500' : ''}
        ${isInvalid ? 'ring-2 ring-red-500 ring-offset-1' : ''}
      `}
    >
      {filledWord || '______'}
    </span>
  );
}
```

## Mobile-Specific Feedback

On mobile, provide extra visual cues:

```tsx
function DragPreviewMobile() {
  const { active } = useDndMonitor();

  return (
    <DragOverlay>
      {active && (
        <div className="flex flex-col items-center gap-2">
          {/* Larger preview for touch */}
          <div className="px-4 py-3 bg-blue-400 rounded-lg shadow-2xl text-white font-medium text-lg">
            {active.data.word || active.data.label}
          </div>
          {/* Pointer circle */}
          <div className="w-4 h-4 bg-white rounded-full border-2 border-blue-400" />
        </div>
      )}
    </DragOverlay>
  );
}
```

## useDndMonitor for Global State

Monitor drag state globally (useful for multiple components):

```tsx
import { useDndMonitor } from '@dnd-kit/core';

function GlobalDragListener() {
  useDndMonitor({
    onDragStart(event) {
      console.log('Drag started:', event.active.id);
      // Disable scroll, freeze UI, etc.
    },
    onDragEnd(event) {
      console.log('Drag ended:', event.over?.id);
      // Re-enable scroll, play sound, etc.
    },
    onDragCancel(event) {
      console.log('Drag cancelled');
    },
  });

  return null;
}

<DndContext>
  <GlobalDragListener />
  <YourApp />
</DndContext>
```

## Animated Transitions

Use CSS transitions for smooth feedback:

```tsx
// Slot transition
className={`
  transition-all duration-150
  ${isOver ? 'scale-110 ring-2 ring-blue-500' : 'scale-100'}
`}

// Zone transition
className={`
  transition-colors duration-150
  ${isOver ? 'border-blue-500 bg-blue-200' : 'border-gray-300'}
`}
```

**Duration recommendations:**
- `duration-75`: Quick micro-interactions
- `duration-150`: Slot/zone highlights
- `duration-200`: Drop animations

## Accessibility for Feedback

Announce drag state to screen readers:

```tsx
function AccessibleDragFeedback() {
  const { active } = useDndMonitor();

  useEffect(() => {
    if (active) {
      const message = `Started dragging ${active.data.label || active.data.word}`;
      // Announce to screen reader
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);

      return () => announcement.remove();
    }
  }, [active?.id]);

  return null;
}
```
