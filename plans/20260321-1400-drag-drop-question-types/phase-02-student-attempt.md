# Phase 2: Frontend — Student Attempt Components

**Parent plan:** [plan.md](./plan.md)
**Date:** 2026-03-21
**Priority:** P1
**Status:** Pending (revised after review)
**Depends on:** Phase 1

---

## Overview

Add `DragDropTextInput` and `DragDropImageInput` inline components to the quiz attempt page.
Pattern mirrors existing `MatchingInput`, `OrderingInput`, `ClozeInput` in the same file.

---

## Key Insights

- `@dnd-kit/core` + `@dnd-kit/utilities` already installed — use `useDraggable`/`useDroppable`
- `PointerSensor` handles mouse + touch uniformly — no extra mobile work
- `DragOverlay` required for clean mobile UX
- Each question card needs its own `DndContext` (must not nest; `paginationMode=all` renders multiple)

**Critical — answer key format differs between types (do not mix up):**
| Type | matchAnswer keys | Example |
|------|-----------------|---------|
| `drag_drop_text` | slot string IDs | `{ "slot_0": "fox", "slot_1": "lazy dog" }` |
| `drag_drop_image` | zone option UUIDs | `{ "uuid-of-zone-option": "Left Ventricle" }` |

**Zone coordinate convention:** `x,y` are the **center point** of the zone as percentages of the image container. Both student attempt and result page must apply `transform: translate(-50%, -50%)` when rendering zones to anchor them correctly.

**Backend changes in Phase 1 that this phase depends on:**
- `getPage()` now returns `mediaUrl` on question
- `getPage()` now returns `matchValue` (zone coords) for `drag_drop_image` options — distractor options have `matchValue = null`
- `getPage()` still strips `matchKey` and `isCorrect` for both drag types

---

## Architecture

### File to modify
`frontend/app/quizzes/[id]/attempt/[attemptId]/page.tsx`

### Changes
1. Update `Question` interface — add `mediaUrl`, add `matchValue` to options
2. Add `DragDropTextInput` component (bottom of file)
3. Add `DragDropImageInput` component (bottom of file)
4. Wire both into question render block

---

## Interface Updates

```ts
interface QuestionOption {
  id: string;
  content: string;
  isCorrect?: boolean;
  matchKey?: string;
  matchValue?: string;   // ADD — used by drag_drop_image for zone coords
  orderIndex?: number;
}

interface Question {
  // inside the outer Question interface:
  question: {
    content: string;
    type: string;
    mediaUrl?: string;     // ADD — needed for drag_drop_image
    explanation?: string;
    options?: QuestionOption[];
  };
  answer?: {
    selectedOptions?: string[];
    textAnswer?: string;
    matchAnswer?: Record<string, string>;  // already present
    orderAnswer?: string[];
  };
}
```

---

## DragDropTextInput Design

**Props:** `content: string`, `options: QuestionOption[]`, `answer: Record<string,string>`, `onChange`

- Parse `content` by splitting on `/(\[slot_\d+\])/`
- For each `[slot_N]`: render `<DroppableSlot id="slot_N">` inline in text
  - Filled: shows token chip; empty: shows dashed border box
- Word bank below text: all options as `<DraggableToken>` chips
  - Tokens already placed are dimmed (still draggable for swap)
- `DndContext` wraps the whole component; `closestCenter` collision detection
- On drop to slot: `onChange({ ...answer, [slotId]: droppedTokenContent })`
- On drop back to word bank (droppable "bank" target): `onChange({ ...answer, [slotId]: undefined })`

```
DragDropTextInput
  └── DndContext (PointerSensor, closestCenter)
      ├── inline text with DroppableSlot spans
      ├── word bank with DraggableToken chips
      └── DragOverlay (floating chip preview)
```

---

## DragDropImageInput Design

**Props:** `mediaUrl: string`, `options: QuestionOption[]`, `answer: Record<string,string>`, `onChange`

**Identifying zones vs distractors from frontend (no isCorrect exposed):**
- Zone options: `option.matchValue !== null` (has JSON coords)
- Distractor options: `option.matchValue === null` or `undefined`

**Rendering:**
- Container: `position: relative`, `aspect-ratio: 16/9` (MVP default), overflow hidden
- `<img src={mediaUrl}>` fills container
- For each zone option: `<DroppableZone>` absolutely positioned:
  ```tsx
  style={{
    position: 'absolute',
    left: `${coords.x}%`,
    top: `${coords.y}%`,
    width: `${coords.w}%`,
    height: `${coords.h}%`,
    transform: 'translate(-50%, -50%)',  // center-anchor — matches Phase 3 builder
  }}
  ```
  - Shows placed label chip if `answer[zone.id]` set; else dashed border + "Drop here"
- Label pool below image: all options as `<DraggableLabel>` chips (`pointerWithin` collision detection)
- On drop: `onChange({ ...answer, [zone.id]: droppedLabelContent })`

---

## Implementation Steps

- [ ] Update `QuestionOption` interface: add `matchValue?: string`
- [ ] Update inner `question` interface: add `mediaUrl?: string`
- [ ] Add `DragDropTextInput` component at bottom of file
- [ ] Add `DragDropImageInput` component at bottom of file
- [ ] Add render branches in question loop (after `cloze` block):
  ```tsx
  {q.question.type === 'drag_drop_text' && (
    <DragDropTextInput
      content={q.question.content}
      options={q.question.options || []}
      answer={(q.answer?.matchAnswer as Record<string,string>) || {}}
      onChange={(val) => handleAnswerChange(q.questionId, 'matchAnswer', val)}
    />
  )}
  {q.question.type === 'drag_drop_image' && (
    <DragDropImageInput
      mediaUrl={q.question.mediaUrl || ''}
      options={q.question.options || []}
      answer={(q.answer?.matchAnswer as Record<string,string>) || {}}
      onChange={(val) => handleAnswerChange(q.questionId, 'matchAnswer', val)}
    />
  )}
  ```

---

## Success Criteria

- [ ] Student can drag tokens into slots (`drag_drop_text`)
- [ ] Student can drag labels onto image zones (`drag_drop_image`)
- [ ] Zone overlays render at correct positions using center-anchor transform
- [ ] Works on mobile via PointerSensor
- [ ] Answers auto-saved (debounced 500ms, same as other types)
- [ ] DragOverlay shows floating preview while dragging
- [ ] `isAnswered` turns true after first placement

---

## Risk Assessment

- `DndContext` per question card — confirm no nesting issues when `paginationMode=all`
- Image aspect-ratio lock: if instructor uploads a portrait image, 16:9 container will letterbox it and zone positions may visually misalign. MVP trade-off; future: derive aspect ratio from image `onLoad` event
