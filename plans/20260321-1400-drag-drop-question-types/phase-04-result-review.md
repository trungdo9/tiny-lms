# Phase 4: Frontend — Result Review Display

**Parent plan:** [plan.md](./plan.md)
**Date:** 2026-03-21
**Priority:** P2
**Status:** ✅ Complete
**Depends on:** Phase 2 (student components as reference), Phase 1 (backend result endpoint)

---

## Overview

Show correct vs. student answers for `drag_drop_text` and `drag_drop_image` on the quiz result page.
File: `frontend/app/quizzes/[id]/result/[attemptId]/page.tsx`

---

## Key Insights

- Result page calls `GET /attempts/:id/result` which uses `getResult()` in `attempts.service.ts`
- `getResult()` calls `getAttempt()` which exposes `matchKey`/`matchValue`/`isCorrect` when `showCorrectAnswer=true` (attempt is submitted, not in_progress)
- So result page receives full option data including coordinates and correct labels
- `QuizAnswer.matchAnswer` (Json) contains student's slot/zone placements
- Existing result page already handles `selectedOptions`/`textAnswer`; needs 2 new type branches

---

## Architecture

### File to modify
`frontend/app/quizzes/[id]/result/[attemptId]/page.tsx`

### Result display approach

**drag_drop_text result:**
- Re-render template text with each slot filled
- Student's placed token shown; color coded green (correct) / red (wrong) / gray (empty)
- Below: show correct answer for each slot

```
"The [fox ✓] jumped over the [cat ✗]."
           ↑ green               ↑ red, correct: "lazy dog"
```

**drag_drop_image result:**
- Show image with zones overlaid (same absolute positioning from `matchValue` coords)
- Each zone shows: student's label + correct label
- Zone border: green if correct, red if wrong

---

## Implementation Steps

### Step 4.1 — Update Attempt interface in result page

Add to the question interface:
```ts
question: {
  content: string;
  type: string;
  mediaUrl?: string;
  explanation?: string;
  options?: {
    id: string;
    content: string;
    isCorrect?: boolean;
    matchKey?: string;
    matchValue?: string;
  }[];
};
answer?: {
  selectedOptions?: string[];
  textAnswer?: string;
  matchAnswer?: Record<string, string>;
};
```

### Step 4.2 — drag_drop_text result display

Add after the existing answer review block (where `showAnswers` is checked):

```tsx
{aq.question.type === 'drag_drop_text' && showAnswers && (() => {
  const slots = (aq.question.content.match(/\[slot_\d+\]/g) || []);
  const correctMap: Record<string, string> = {};
  aq.question.options?.forEach(o => {
    if (o.isCorrect && o.matchKey) correctMap[o.matchKey] = o.content;
  });
  const studentMap: Record<string, string> = aq.answer?.matchAnswer || {};

  const parts = aq.question.content.split(/(\[slot_\d+\])/);
  return (
    <div className="text-lg leading-relaxed">
      {parts.map((part, i) => {
        const m = part.match(/\[(slot_\d+)\]/);
        if (!m) return <span key={i}>{part}</span>;
        const slotId = m[1];
        const student = studentMap[slotId];
        const correct = correctMap[slotId];
        const isRight = student?.toLowerCase() === correct?.toLowerCase();
        return (
          <span key={i} className={`inline-block mx-1 px-2 py-0.5 rounded border-2 font-medium
            ${isRight ? 'bg-green-100 border-green-400 text-green-700'
             : student  ? 'bg-red-100 border-red-400 text-red-700'
             : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
            {student || '(empty)'}
            {!isRight && <span className="ml-1 text-xs text-gray-500">→ {correct}</span>}
          </span>
        );
      })}
    </div>
  );
})()}
```

### Step 4.3 — drag_drop_image result display

```tsx
{aq.question.type === 'drag_drop_image' && showAnswers && (() => {
  const zones = aq.question.options?.filter(o => o.matchValue) || [];
  const studentMap: Record<string, string> = aq.answer?.matchAnswer || {};
  return (
    <div>
      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
        <img src={aq.question.mediaUrl} className="w-full h-full object-contain" />
        {zones.map(zone => {
          const coords = JSON.parse(zone.matchValue!);
          const placed = studentMap[zone.id];
          const isRight = placed?.toLowerCase() === zone.content.toLowerCase();
          return (
            <div key={zone.id} className={`absolute border-2 rounded flex items-center justify-center text-xs font-bold
              ${isRight ? 'bg-green-200/70 border-green-500' : placed ? 'bg-red-200/70 border-red-500' : 'bg-gray-200/70 border-gray-400'}`}
              style={{ left: `${coords.x}%`, top: `${coords.y}%`, width: `${coords.w}%`, height: `${coords.h}%`,
                       transform: 'translate(-50%, -50%)' }}>
              <span>{placed || '?'}</span>
              {!isRight && <span className="block text-green-700">{zone.content}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
})()}
```

---

## Todo

- [ ] Update `Attempt` interface in result page to include `mediaUrl`, `matchAnswer`, `matchKey`, `matchValue`
- [ ] Add drag_drop_text result display block
- [ ] Add drag_drop_image result display block

---

## Success Criteria

- [ ] drag_drop_text result shows template with green/red colored tokens
- [ ] drag_drop_image result shows image with colored zone overlays and correct/student labels
- [ ] Correct answers only shown when `quiz.showCorrectAnswer = true`
- [ ] Explanation shown when `quiz.showExplanation = true`

---

## Unresolved Questions

- `aspectRatio: '16/9'` hardcoded for image result display — should ideally be derived from uploaded image dimensions; for MVP, fixed ratio acceptable
