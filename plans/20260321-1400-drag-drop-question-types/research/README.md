# @dnd-kit/core Drag-and-Drop Research

**Date:** 2026-03-21 | **Version:** @dnd-kit/core ^6.3.1 | **Project:** tiny-lms

## Overview

Comprehensive research on @dnd-kit/core patterns for implementing two custom drag-and-drop question types:
1. **Word Bank → Blank Slot:** Drag word tokens into inline text blanks
2. **Label → Image Zone:** Drag labels onto coordinate-based zones on images

## Documents

### Core API
- **01-core-api-reference.md** (120 LOC)
  - DndContext setup, useDraggable, useDroppable hooks
  - Collision detection algorithms
  - Touch & pointer event handling
  - CSS transform utilities

### Pattern 1: Word Bank Drag
- **02-word-bank-blank-slot-pattern.md** (180 LOC)
  - Architecture: inline slots in text
  - BlankSlot + WordToken components
  - Replacement/swap logic
  - Text wrapping & layout CSS
  - Accessibility via useDraggable ARIA

### Pattern 2: Image Label Drag
- **03a-image-label-zones-basic.md** (180 LOC)
  - Architecture: sidebar labels → image zones
  - DropZone + DraggableLabel components
  - Absolute positioning + transform
  - Collision detection (pointerWithin)
  - Mobile touch support

- **03b-image-responsive-svg.md** (220 LOC)
  - Responsive zone scaling with ResizeObserver
  - SVG for arbitrary region shapes (polygons, paths)
  - ViewBox + preserveAspectRatio
  - Touch hit area expansion in SVG
  - Accessibility for SVG regions

### Visual Feedback
- **04-overlay-preview-pattern.md** (220 LOC)
  - DragOverlay component + useDndMonitor hook
  - Pattern-specific previews (word vs. label)
  - Drop animations (defaultDropAnimation)
  - Over/hover zone highlighting
  - Disabled/invalid drop feedback
  - Mobile-specific visual cues
  - Accessibility announcements (aria-live)

### Trade-offs & Summary
- **05-tradeoffs-summary.md** (180 LOC)
  - Pattern comparison matrix
  - Collision detection trade-offs
  - Touch event handling (automatic)
  - CSS gotchas for inline slots
  - Responsive image zone approaches
  - Performance considerations
  - Implementation order
  - Common pitfalls
  - Testing strategy
  - Final recommendation: Use @dnd-kit/core for both

## Key Findings

### Quick Start
```tsx
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

// Draggable
const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: 'word-1', data: { word: 'apple' } });
<div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform) }} {...listeners} {...attributes}>

// Droppable
const { setNodeRef, isOver } = useDroppable({ id: 'slot-1' });
<div ref={setNodeRef} className={isOver ? 'highlight' : ''}>
```

### Word Bank Pattern
- Use `display: inline-block` for slots (respects text flow)
- Collision detection: `closestCenter`
- Transform-only drag (no re-layout)

### Image Label Pattern
- Use `position: absolute` for zones with `transform: translate(-50%, -50%)`
- Collision detection: `pointerWithin` (forgiving for touch)
- Responsive: SVG viewBox auto-scales

### Touch Support
- Library handles automatically via PointerSensor
- No manual touchstart/touchmove binding
- Distance property prevents click-drag

### Visual Feedback
- DragOverlay essential for mobile clarity
- useDndMonitor for global drag state
- Inline transitions smooth UX

## Recommendations

1. **Use @dnd-kit/core** (already in dependencies)
   - ✅ Smallest bundle (~22KB gzipped)
   - ✅ Excellent touch support
   - ✅ Flexible for future patterns
   - ✅ Active maintenance

2. **Implementation Order**
   - Start: Word bank → blank slot (simpler)
   - Expand: Label → image zones
   - Polish: Overlays + animations

3. **Avoid Pitfalls**
   - Always attach `setNodeRef` (no drag without it)
   - Use correct collision detection per pattern
   - Don't use `position: absolute` on text slot
   - Include DragOverlay for mobile

## Testing Checklist

- [ ] Unit tests: placement logic saves correctly
- [ ] E2E tests: drag tokens/labels to targets
- [ ] Touch tests: 8px distance activation
- [ ] Mobile: overlay preview visible
- [ ] Accessibility: ARIA attributes present
- [ ] Revert: drag outside zone reverts

---

**Next Step:** Implement patterns using this research as reference.
For questions, refer to specific document sections.
