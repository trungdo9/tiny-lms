# Trade-offs & Implementation Summary

## Pattern Comparison

### Word Bank → Blank Slot

**Strengths:**
- ✅ Inline slots preserve natural text flow
- ✅ Transform-based drag (no re-layout thrashing)
- ✅ Small file size (no SVG overhead)
- ✅ Fast on low-end devices

**Weaknesses:**
- ⚠️ Text wrapping complexity with long words
- ⚠️ Requires careful CSS (display: inline-block)
- ⚠️ Overlay preview essential on mobile (pointer position unclear)
- ⚠️ Slot positioning tied to text rendering

**Best For:** Reading comprehension, grammar exercises, vocabulary fill-ins

### Label → Image Drop Zone

**Strengths:**
- ✅ Large visual target (excellent mobile UX)
- ✅ `pointerWithin` collision very forgiving
- ✅ Supports arbitrary zone shapes (SVG)
- ✅ Works on any image (anatomy, maps, diagrams)
- ✅ Responsive scaling straightforward

**Weaknesses:**
- ⚠️ Coordinate mapping overhead (base → scale)
- ⚠️ SVG introduces complexity for non-circles
- ⚠️ ResizeObserver callback overhead
- ⚠️ Zone coordinates require careful measurement

**Best For:** Anatomy labeling, image annotation, diagram completion

## Collision Detection Trade-offs

| Algorithm | Accuracy | Touch-Friendly | Performance | Recommended |
|-----------|----------|---|---|---|
| `closestCenter` | High | Medium | Fast | Word slots |
| `pointerWithin` | Medium | High | Fast | Image zones |
| `closestCorners` | High | Medium | Fast | Grids (avoid) |
| `rectIntersection` | Very High | Low | Medium | Avoid |

**Recommendation:** Use `closestCenter` for text, `pointerWithin` for zones.

## Touch Event Handling

**@dnd-kit/core Automatic Handling:**
- ✅ PointerSensor unifies mouse/touch/pen
- ✅ TouchSensor fallback for old browsers
- ✅ No manual touchstart/touchmove binding needed
- ✅ Distance property prevents click-drag sensitivity

**Manual Handling Not Needed** (library does it):
```tsx
// ❌ DON'T do this
element.addEventListener('touchstart', ...);
element.addEventListener('touchmove', ...);

// ✅ DO this (library handles)
useSensor(PointerSensor, { distance: 8 });
```

## Inline Slot CSS Gotchas

```tsx
// ✅ CORRECT: Respects text flow
className="inline-block min-w-24 px-2 py-1 border-b-2"

// ❌ WRONG: Breaks text wrapping
className="block min-w-24 px-2 py-1 border-b-2"

// ❌ WRONG: Removes from flow
style={{ position: 'absolute' }}

// ✅ GOOD: Alternative inline approach
className="inline-flex items-center min-w-24 px-1 border-b-2"
```

## Overlay Preview Essentials

**Mobile:** Overlay is critical
```tsx
// Without overlay → user doesn't know what they're dragging
// With overlay → clear visual feedback at pointer position
<DragOverlay>
  <div className="px-3 py-2 bg-blue-300 rounded shadow-lg">
    {active.data.word}
  </div>
</DragOverlay>
```

**Desktop:** Overlay improves UX but not critical.

## Responsive Image Zones

**SVG viewBox approach (best):**
```tsx
<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" className="w-full">
  {/* Coordinates 0-800, 0-600; auto-scales with CSS */}
</svg>
```

**Manual scale calculation (less ideal):**
```tsx
const scale = actualWidth / baseWidth;
const scaledX = x * scale; // Brittle, needs re-calc on resize
```

## Accessibility Checklist

- ✅ useDraggable provides ARIA automatically (role, aria-pressed, aria-describedby)
- ✅ useDroppable provides implicit semantics
- ✅ DragOverlay doesn't interfere with ARIA
- ⚠️ SVG zones need role="region" + aria-label
- ⚠️ Announce drag state changes via aria-live

## Performance Considerations

### No Significant Overhead For:
- ✅ < 50 draggables/droppables
- ✅ < 1000 zones (with pointerWithin)
- ✅ Text slot questions

### Potential Bottlenecks:
- ⚠️ ResizeObserver on slots if they resize frequently
- ⚠️ SVG with > 100 regions (rendering cost)
- ⚠️ High DOM node count + transform updates

**Mitigation:** Use CSS transforms (no re-layout), batch state updates.

## Implementation Order

1. **Start:** Word bank → blank slot (simpler API)
   - Test useDraggable + useDroppable
   - Validate CSS inline-block flow
   - Verify touch support

2. **Expand:** Label → image zones (add complexity)
   - Test pointerWithin collision
   - Responsive scaling
   - SVG if needed

3. **Polish:** Overlay previews + animations
   - DragOverlay for feedback
   - Drop animations
   - Mobile-specific tweaks

## Common Pitfalls

1. **Forgetting `setNodeRef`:** Drag won't work
   ```tsx
   const { setNodeRef } = useDraggable({...});
   // ❌ <div /> -- no ref, won't drag
   // ✅ <div ref={setNodeRef} /> -- works
   ```

2. **Wrong collision detection:** Drag targets misaligned
   ```tsx
   // ❌ closestCorners for text slots (will miss)
   // ✅ closestCenter for text slots
   // ✅ pointerWithin for image zones
   ```

3. **Missing DragOverlay:** Mobile users lost
   ```tsx
   // ❌ No overlay --> unclear what's being dragged
   // ✅ <DragOverlay>{...}</DragOverlay>
   ```

4. **Slot CSS position: absolute:** Breaks text flow
   ```tsx
   // ❌ style={{ position: 'absolute' }}
   // ✅ className="inline-block"
   ```

5. **Not handling revert:** Dropped outside zone stays at 0,0
   ```tsx
   // Library handles automatically via transform
   // Just don't update state if !over
   if (!over) return; // Don't save placement
   ```

## File Size Impact

- @dnd-kit/core: ~20KB (gzipped)
- @dnd-kit/utilities: ~2KB
- **Total:** ~22KB added to bundle

Compare to drag libraries:
- react-beautiful-dnd: ~45KB (but sortable only)
- react-dnd: ~40KB (more complex API)
- dnd-kit: Smallest, most flexible

## Testing Strategy

```tsx
// Unit test placement logic
it('saves word to slot on drop', () => {
  handleDragEnd({ active: { data: { word: 'apple' } }, over: { id: 'slot-1' } });
  expect(filled['slot-1']).toBe('apple');
});

// E2E test drag interaction
it('drags word token to slot', async () => {
  const word = screen.getByText('apple');
  const slot = screen.getByRole('button', { name: /blank slot/i });

  await userEvent.dragAndDrop(word, slot);
  expect(slot).toHaveTextContent('apple');
});

// Touch test (if using Cypress)
cy.get('[data-draggable]')
  .trigger('touchstart')
  .trigger('touchmove', { pageX: 100, pageY: 100 })
  .trigger('touchend');
```

## Final Recommendation

**Use @dnd-kit/core for both patterns:**
- ✅ Single library (no fragmentation)
- ✅ @dnd-kit/sortable already in dependencies
- ✅ Excellent mobile support (pointer events)
- ✅ Small bundle cost (~22KB gzipped)
- ✅ Flexible for future drag patterns

**Avoid:**
- ❌ Custom drag implementation (buggy)
- ❌ HTML5 Drag & Drop (poor mobile UX)
- ❌ react-beautiful-dnd (limited to sortable)
