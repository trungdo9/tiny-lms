# Phase 02 — Frontend AI Generate Modal

**Context:** [Parent Plan](plan.md) | [Frontend Research](research/researcher-02-frontend-report.md)
**Depends on:** Phase 01 (backend `POST /ai-questions/generate` endpoint)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-21 |
| Description | "Generate with AI" button + modal on question bank detail page for instructor and admin portals |
| Priority | High |
| Implementation Status | 🔲 Pending |
| Review Status | 🔲 Not reviewed |

---

## Key Insights
- Question bank detail page (`[id]/page.tsx`) is inline JSX — no component extraction needed, follow existing pattern
- Best placement: new button in page header alongside "Add Question" and "Import"
- AI modal is separate from the existing create modal — avoids complicating the existing form
- Two-step flow: (1) Generate → preview cards, (2) Select + Save → individual creates
- Page uses **inline fetch + supabase auth** — NOT `api.ts`; AI calls must follow same pattern
- Bulk endpoint confirmed: `POST /questions/bank/:bankId/bulk` — save all selected in one call
- Bulk payload: `{ questions: CreateQuestionDto[] }` matching `BulkCreateQuestionDto`
- `QUESTION_TYPES` constant, `handleTypeChange()` helpers already defined — reuse them
- Must add `OPENAI_API_KEY` only on backend — frontend just calls `POST /ai-questions/generate`

---

## Requirements
1. "Generate with AI" button in question bank detail page header
2. AI modal with inputs: topic, context (optional), question types (checkboxes), difficulty, count
3. Loading state while generating (spinner + "Generating questions...")
4. Preview: generated questions shown as cards with type/difficulty badges
5. Instructor can select/deselect which questions to save
6. "Save Selected" button → bulk-save to bank via existing endpoint
7. Error display: API errors shown inline in modal
8. Works in both `/instructor/question-banks/[id]` and `/admin/question-banks/[id]`

---

## Architecture

### Inline Types (in page.tsx — no api.ts)
```typescript
interface AIGeneratedQuestion {
  type: string;
  content: string;
  explanation?: string;
  difficulty: string;
  defaultScore: number;
  tags: string[];
  options: { content: string; isCorrect: boolean; matchKey?: string; matchValue?: string; orderIndex?: number }[];
}
```

### Generate Fetch (inline, same auth pattern as rest of page)
```typescript
const handleGenerate = async () => {
  setAiGenerating(true);
  setAiError('');
  setAiResults([]);
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${API}/ai-questions/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ topic: aiTopic, context: aiContext || undefined, types: aiTypes, difficulty: aiDifficulty, count: aiCount }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Generation failed'); }
    const data: AIGeneratedQuestion[] = await res.json();
    setAiResults(data);
    setAiSelected(new Set(data.map((_, i) => i))); // select all by default
  } catch (err: any) {
    setAiError(err.message);
  } finally {
    setAiGenerating(false);
  }
};
```

### UI State in Modal Component
```typescript
// AI Modal state
const [aiOpen, setAiOpen] = useState(false);
const [aiTopic, setAiTopic] = useState('');
const [aiContext, setAiContext] = useState('');
const [aiTypes, setAiTypes] = useState<string[]>(['single']);
const [aiDifficulty, setAiDifficulty] = useState('mixed');
const [aiCount, setAiCount] = useState(5);
const [aiGenerating, setAiGenerating] = useState(false);
const [aiResults, setAiResults] = useState<AIGeneratedQuestion[]>([]);
const [aiSelected, setAiSelected] = useState<Set<number>>(new Set());
const [aiError, setAiError] = useState('');
const [aiSaving, setAiSaving] = useState(false);
```

### Modal Layout (inline JSX, TailwindCSS)
```
[AI Generate Modal]
├── Header: "Generate Questions with AI" + X close
├── Step 1: Generation Form (shown when aiResults.length === 0 OR always as collapsible)
│   ├── Topic input (required)
│   ├── Context textarea (optional, collapsed by default)
│   ├── Question Types: checkbox grid (single, multi, true_false, short_answer, essay)
│   ├── Difficulty: select (Easy / Medium / Hard / Mixed)
│   ├── Count: number input (1-20)
│   └── "Generate" button (disabled while loading)
├── Loading: spinner + "Generating N questions..." message
├── Step 2: Preview (shown when aiResults.length > 0)
│   ├── "X questions generated" header + "Regenerate" link
│   ├── "Select All / Deselect All" toggle
│   ├── Question cards (scrollable list):
│   │   ├── Checkbox (selected state)
│   │   ├── Type badge + Difficulty badge
│   │   ├── Question content (truncated to 3 lines)
│   │   ├── Options preview (first 2 options)
│   │   └── Expand/collapse toggle
│   └── Footer: "Save Selected (N)" button + Cancel
└── Error banner (red, if aiError)
```

### Question Card Preview Component (inline)
```tsx
{aiResults.map((q, i) => (
  <div
    key={i}
    onClick={() => toggleSelect(i)}
    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
      aiSelected.has(i) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}
  >
    <div className="flex items-start gap-3">
      <input type="checkbox" checked={aiSelected.has(i)} readOnly className="mt-1" />
      <div className="flex-1">
        <div className="flex gap-2 mb-2">
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{q.type}</span>
          <span className={`text-xs px-2 py-0.5 rounded ${difficultyColor(q.difficulty)}`}>
            {q.difficulty}
          </span>
        </div>
        <p className="text-sm font-medium line-clamp-3">{q.content}</p>
        {q.options.slice(0, 2).map((opt, j) => (
          <p key={j} className={`text-xs mt-1 ${opt.isCorrect ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
            {opt.isCorrect ? '✓' : '○'} {opt.content}
          </p>
        ))}
      </div>
    </div>
  </div>
))}
```

### Save Flow (bulk endpoint — one call)
```typescript
const handleSaveSelected = async () => {
  const selected = aiResults.filter((_, i) => aiSelected.has(i));
  if (!selected.length) return;
  setAiSaving(true);
  setAiError('');
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${API}/questions/bank/${bankId}/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ questions: selected.map(q => ({
        type: q.type, content: q.content, difficulty: q.difficulty,
        defaultScore: q.defaultScore, options: q.options,
      })) }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Save failed'); }
    queryClient.invalidateQueries({ queryKey: queryKeys.questionBanks.questions(bankId) });
    setAiOpen(false);
    setAiTopic(''); setAiContext(''); setAiTypes(['single']); setAiDifficulty('mixed');
    setAiCount(5); setAiResults([]); setAiSelected(new Set());
  } catch (err: any) {
    setAiError('Failed to save questions. Please try again.');
  } finally {
    setAiSaving(false);
  }
};
```

---

## Related Code Files
- `frontend/app/instructor/question-banks/[id]/page.tsx` — add button + modal here
- `frontend/app/admin/question-banks/[id]/page.tsx` — same changes
- `frontend/lib/query-keys.ts` — no changes needed (reuse `questionBanks.questions`)

---

## Implementation Steps

1. **Update instructor question bank detail page** (`[id]/page.tsx`):
   - Add "Generate with AI" button in header (next to "Add Question")
   - Add all AI modal state variables
   - Add AI modal JSX (inline, following existing modal pattern)
   - Add `handleGenerate`, `toggleSelect`, `selectAll`, `handleSaveSelected` handlers
   - Add `toCreateQuestionDto` mapper function

3. **Mirror same changes in admin** (`admin/question-banks/[id]/page.tsx`)

4. **Test end-to-end**:
   - Generate 5 single-choice questions on topic
   - Select 3, save → verify in question list
   - Test error state (disconnect network)

---

## Todo
- [ ] Add AI modal to `instructor/question-banks/[id]/page.tsx`
- [ ] Add "Generate with AI" button to header
- [ ] Implement generate handler + loading state
- [ ] Implement question preview cards with select
- [ ] Implement save selected handler
- [ ] Mirror changes in `admin/question-banks/[id]/page.tsx`
- [ ] Test all 5 question types in preview
- [ ] Test error states

---

## Success Criteria
- "Generate with AI" button visible in question bank detail header
- Modal opens, accepts topic + options, submits to backend
- Loading state shown during generation (≤15s)
- Preview shows generated questions with correct type/difficulty display
- Selecting and saving adds questions to bank (verified in table)
- Error shown if backend returns error

---

## Risk Assessment
| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Slow generation (user wait) | Low | Loading state + message; GPT-4o-mini is fast |
| Admin/instructor code duplication | Medium | Copy-paste is acceptable given current inline pattern |
| Options mapping edge cases (essay/short_answer) | Low | Test all 5 types explicitly |

---

## Security Considerations
- Frontend never touches OpenAI API key — only calls backend endpoint
- Backend validates auth (JwtAuthGuard + RolesGuard) before calling OpenAI
- Topic/context inputs capped by backend DTO validation (MaxLength)

---

## Next Steps
After completion: update `docs/codebase-summary.md` and `docs/course-content-and-activities.md` to document the AI generation feature.
