# Phase 1: Backend — Question Types + Scoring

**Parent plan:** [plan.md](./plan.md)
**Date:** 2026-03-21
**Priority:** P0 — blocker for all other phases
**Status:** ✅ Complete
**Depends on:** Nothing

---

## Overview

Add `drag_drop_text` and `drag_drop_image` to the question type system with validation and auto-scoring.
**No DB migration needed.** All storage reuses existing fields.

---

## Key Insights

- `QuestionOption.matchKey`/`matchValue`/`isCorrect` already support slot/zone storage
- `QuizAnswer.matchAnswer` (Json?) already used for `matching` — reused here
- **Answer key asymmetry** (intentional):
  - `drag_drop_text`: `matchAnswer = { "slot_0": "fox" }` — string slot ID as key
  - `drag_drop_image`: `matchAnswer = { "uuid-of-zone-option": "Left Ventricle" }` — option UUID as key
  - Frontend components must implement each pattern accordingly (see Phase 2)
- **Pre-existing bug in `getPage()`**: current code returns only `{ id, content, isCorrect }` for options — `matchKey` and `matchValue` are **never returned**. This silently breaks `MatchingInput` too. Step 1.2 fixes this for all types.
- `create()` does not save `matchKey`/`matchValue` on options (missing vs `bulkCreate`) — fixed in Step 1.1

---

## Data Model

### drag_drop_text
```
Question:
  type = "drag_drop_text"
  content = "The [slot_0] jumped over the [slot_1]."

QuestionOption (correct tokens):
  content = "fox", isCorrect = true, matchKey = "slot_0", matchValue = null

QuestionOption (distractors):
  content = "elephant", isCorrect = false, matchKey = null, matchValue = null

QuizAnswer:
  matchAnswer = { "slot_0": "fox", "slot_1": "lazy dog" }  // slotId (string) → placed text
```

### drag_drop_image
```
Question:
  type = "drag_drop_image", mediaUrl = "/uploads/images/heart.png", mediaType = "image"

QuestionOption (zones):
  content = "Left Ventricle", isCorrect = true, matchKey = "zone_0"
  matchValue = '{"x":45.2,"y":60.1,"w":10,"h":8}'  // center x,y as %; w,h as %

QuestionOption (distractors):
  content = "Aorta", isCorrect = false, matchKey = null, matchValue = null

QuizAnswer:
  matchAnswer = { "<zone-option-uuid>": "Left Ventricle" }  // option UUID → placed label
```

---

## Architecture

| File | Change |
|------|--------|
| `backend/src/modules/questions/questions.service.ts` | Add to `validTypes`; add drag-type validation; fix `create()` to save matchKey/matchValue |
| `backend/src/modules/attempts/attempts.service.ts` | Fix `getPage()` options shape; add `mediaUrl`; add scoring branches |

---

## Implementation Steps

### Step 1.1 — questions.service.ts: register types + validate

Update `validTypes` in both `create()` and `bulkCreate()`:
```ts
const validTypes = [
  'single', 'multi', 'true_false', 'short_answer', 'essay',
  'matching', 'ordering', 'cloze',
  'drag_drop_text', 'drag_drop_image',
];
```

Extract a shared validator called in both methods:
```ts
function validateDragQuestionDto(dto: CreateQuestionDto) {
  if (dto.type === 'drag_drop_text') {
    if (!dto.content.match(/\[slot_\d+\]/))
      throw new BadRequestException('drag_drop_text content must include at least one [slot_N] marker');
    const correctTokens = dto.options?.filter(o => o.isCorrect && o.matchKey);
    if (!correctTokens?.length)
      throw new BadRequestException('drag_drop_text must have at least one correct token with matchKey');
  }
  if (dto.type === 'drag_drop_image') {
    if (!dto.mediaUrl)
      throw new BadRequestException('drag_drop_image requires a mediaUrl');
    const zones = dto.options?.filter(o => o.isCorrect && o.matchKey && o.matchValue);
    if (!zones?.length)
      throw new BadRequestException('drag_drop_image must have at least one zone with matchKey + matchValue');
    for (const zone of zones) {
      try {
        const c = JSON.parse(zone.matchValue!);
        if (c.x === undefined || c.y === undefined) throw new Error();
      } catch {
        throw new BadRequestException('Zone matchValue must be JSON { x, y, w, h }');
      }
    }
  }
}
```

Fix `create()` option creation to include matchKey/matchValue (currently omitted):
```ts
create: dto.options.map((opt, idx) => ({
  content: opt.content,
  isCorrect: opt.isCorrect || false,
  matchKey: opt.matchKey,     // ADD
  matchValue: opt.matchValue, // ADD
  orderIndex: idx,
})),
```

### Step 1.2 — attempts.service.ts: fix `getPage()` options + add mediaUrl

**Current state (bug):** `getPage()` only returns `{ id, content, isCorrect? }` — matchKey/matchValue always omitted.
This silently breaks `MatchingInput` and will break all drag types.

**Fix — replace the options map in `getPage()`:**
```ts
options: aq.question.options?.map((o: any) => {
  const isActive = attempt.status === 'in_progress';
  const type = aq.question.type;

  // drag_drop_text: strip matchKey (reveals slot assignment) + isCorrect
  if (type === 'drag_drop_text') {
    return { id: o.id, content: o.content, orderIndex: o.orderIndex };
  }

  // drag_drop_image: expose matchValue (zone coords for rendering) but strip matchKey + isCorrect
  if (type === 'drag_drop_image') {
    return { id: o.id, content: o.content, orderIndex: o.orderIndex, matchValue: o.matchValue };
  }

  // All other types (including matching, cloze, ordering): expose matchKey + matchValue
  return {
    id: o.id,
    content: o.content,
    orderIndex: o.orderIndex,
    matchKey: o.matchKey,
    matchValue: o.matchValue,
    isCorrect: (!isActive || attempt.quiz.showCorrectAnswer) ? o.isCorrect : undefined,
  };
}),
```

Also add `mediaUrl` to the question shape in `getPage()`:
```ts
question: {
  content: aq.question.content,
  type: aq.question.type,
  mediaUrl: aq.question.mediaUrl,     // ADD
  explanation: attempt.status !== 'in_progress' ? aq.question.explanation : undefined,
  options: ... // as above
},
```

### Step 1.3 — attempts.service.ts: scoring in submit()

Add after the `cloze` branch:

```ts
} else if (question.type === 'drag_drop_text') {
  // matchAnswer keys = slot string IDs ("slot_0", "slot_1")
  const matchAnswer = answer.matchAnswer as Record<string, string> | null;
  if (matchAnswer) {
    const correctTokens = question.options.filter((o: any) => o.isCorrect && o.matchKey);
    let correctCount = 0;
    for (const token of correctTokens) {
      const placed = matchAnswer[token.matchKey]; // key = slot string ID
      if (placed?.trim().toLowerCase() === token.content.trim().toLowerCase()) correctCount++;
    }
    if (correctTokens.length > 0) {
      const ratio = correctCount / correctTokens.length;
      isCorrect = ratio === 1;
      scoreEarned = Math.round(ratio * Number(question.defaultScore));
    }
  }
} else if (question.type === 'drag_drop_image') {
  // matchAnswer keys = zone option UUIDs
  const matchAnswer = answer.matchAnswer as Record<string, string> | null;
  if (matchAnswer) {
    const zones = question.options.filter((o: any) => o.isCorrect && o.matchKey);
    let correctCount = 0;
    for (const zone of zones) {
      const placed = matchAnswer[zone.id]; // key = option UUID
      if (placed?.trim().toLowerCase() === zone.content.trim().toLowerCase()) correctCount++;
    }
    if (zones.length > 0) {
      const ratio = correctCount / zones.length;
      isCorrect = ratio === 1;
      scoreEarned = Math.round(ratio * Number(question.defaultScore));
    }
  }
}
```

---

## Todo

- [ ] Add `drag_drop_text` and `drag_drop_image` to `validTypes` in `create()` and `bulkCreate()`
- [ ] Add `validateDragQuestionDto()` helper; call in both `create()` and `bulkCreate()`
- [ ] Fix `create()` to save `matchKey` + `matchValue` on options
- [ ] Fix `getPage()` options map to expose `matchKey`/`matchValue` for all types; special handling for drag types
- [ ] Add `mediaUrl` to `getPage()` question shape
- [ ] Add `drag_drop_text` and `drag_drop_image` scoring branches in `submit()`

---

## Success Criteria

- [ ] `POST /question-banks/:id/questions` accepts/rejects drag type payloads correctly
- [ ] `getPage()` returns `matchKey`/`matchValue` for matching/cloze (fixes pre-existing bug)
- [ ] `getPage()` strips correct fields for drag types (text: all; image: keep matchValue only)
- [ ] `getPage()` returns `mediaUrl` on question
- [ ] `submit()` scores both drag types with partial credit
- [ ] All existing question types unaffected

---

## Security Considerations

- `drag_drop_text`: must never expose `matchKey` or `isCorrect` during active attempt (reveals which word goes in which slot)
- `drag_drop_image`: `matchValue` (coords) can be exposed — purely positional, not correctness data; `matchKey` and `isCorrect` must be stripped

---

## Next Steps

Phase 2 and Phase 3 can start after this phase is merged.
