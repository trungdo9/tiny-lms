# Pattern: Word Bank → Blank Slot Drag

Dragging word tokens from a word bank into inline text blanks.

## Architecture

- **Word source:** List of draggable tokens (word bank)
- **Slot targets:** Inline `<span>` elements embedded in text
- **Constraint:** Inline placement requires CSS flow; transform only during drag

## Implementation

### Blank Slot (Droppable)

```tsx
interface BlankSlotProps {
  slotId: string;
  filledWord?: string;
  isOver?: boolean;
  canAccept?: boolean;
}

function BlankSlot({ slotId, filledWord, isOver, canAccept }: BlankSlotProps) {
  const { setNodeRef, isOver: isOverLocal, active } = useDroppable({
    id: slotId,
    data: { type: 'slot', slotId }
  });

  const over = isOverLocal && active?.data.type === 'word';

  return (
    <span
      ref={setNodeRef}
      className={`
        inline-block min-w-24 px-2 py-1 border-b-2 align-text-bottom
        transition-colors duration-150
        ${filledWord ? 'bg-green-100 border-green-400' : 'bg-yellow-100 border-yellow-300'}
        ${over ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
      `}
    >
      {filledWord || '______'}
    </span>
  );
}
```

**Key CSS:**
- `display: inline-block`: Respects text flow
- `min-w-24`: Ensures visible slot size
- `align-text-bottom`: Aligns with text baseline
- `border-b-2`: Visual blank underline

### Word Token (Draggable)

```tsx
interface WordTokenProps {
  id: string;
  word: string;
  isDragging?: boolean;
}

function WordToken({ id, word, isDragging: isDraggingProp }: WordTokenProps) {
  const { attributes, listeners, setNodeRef, isDragging, transform } =
    useDraggable({
      id,
      data: { type: 'word', word }
    });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
      }}
      {...listeners}
      {...attributes}
      className={`
        px-3 py-2 bg-blue-200 rounded cursor-grab active:cursor-grabbing
        border border-blue-300 text-sm font-medium
        transition-opacity duration-75
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      {word}
    </div>
  );
}
```

**Key Points:**
- Draggable stays in word bank (no repositioning)
- Transform applied only during drag
- `opacity-50` during drag to show movement

### Question Container

```tsx
interface FillBlankQuestionProps {
  id: string;
  text: string;
  blanks: { id: string; position: number }[];
  wordOptions: string[];
  onSubmit: (answers: Record<string, string>) => void;
}

function FillBlankQuestion({
  id,
  text,
  blanks,
  wordOptions,
  onSubmit,
}: FillBlankQuestionProps) {
  const [filled, setFilled] = useState<Record<string, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { distance: 8 }),
    useSensor(TouchSensor, { distance: 8 }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.data.type !== 'word') return;

    setFilled(prev => ({
      ...prev,
      [over.id as string]: active.data.word,
    }));
  };

  const usedWords = Object.values(filled);
  const availableWords = wordOptions.filter(w => !usedWords.includes(w));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {/* Question Text with Embedded Slots */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <p className="text-lg leading-relaxed">
          {text.split('_____').map((segment, idx) => (
            <span key={idx}>
              {segment}
              {idx < blanks.length && (
                <BlankSlot
                  slotId={blanks[idx].id}
                  filledWord={filled[blanks[idx].id]}
                />
              )}
            </span>
          ))}
        </p>
      </div>

      {/* Word Bank */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <p className="text-sm font-medium text-gray-600 mb-3">Select words:</p>
        <div className="flex flex-wrap gap-2">
          {availableWords.map(word => (
            <WordToken key={word} id={word} word={word} />
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={() => onSubmit(filled)}
        disabled={Object.keys(filled).length < blanks.length}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        Submit Answer
      </button>

      {/* Drag Overlay for Visual Feedback */}
      <DragOverlay>
        {/* See: 03-overlay-preview-pattern.md */}
      </DragOverlay>
    </DndContext>
  );
}
```

## Replacement/Swap Logic

### Option 1: Replace (Simple)
```tsx
// Dragging word → slot (slot already has word)
setFilled(prev => ({
  ...prev,
  [over.id as string]: active.data.word,  // New word replaces
}));
// Old word lost (stays in bank if available)
```

### Option 2: Swap Between Slots
```tsx
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (!over) return;

  const oldWord = filled[over.id as string];

  if (active.data.type === 'slot') {
    // Swapping word from one slot to another
    setFilled(prev => ({
      ...prev,
      [active.id as string]: oldWord || '',
      [over.id as string]: filled[active.id as string],
    }));
  } else {
    // Word from bank to slot
    setFilled(prev => ({
      ...prev,
      [over.id as string]: active.data.word,
    }));
  }
};
```

## Text Wrapping & Layout

```tsx
// Container: allow text to flow naturally
<div className="text-lg leading-relaxed">
  {/* Inline-block slots don't break layout */}
</div>

// Avoid these:
// ❌ display: block on slot → breaks text flow
// ❌ position: absolute → removes from flow
// ✅ display: inline-block → respects text
// ✅ min-width: ensure visible
```

## Touch Compatibility

Text selection on mobile can interfere with drag:
```tsx
// Disable text selection on draggables
className="select-none"

// Or globally:
<style>{`
  [data-draggable] { user-select: none; }
`}</style>
```

## Accessibility

useDraggable provides ARIA attributes automatically:
- `role="button"` on draggable
- `aria-pressed` during drag
- `aria-describedby` links to screen reader instructions

No additional work needed.

## Testing Scenarios

1. Drag word → empty slot → word appears
2. Drag word → filled slot → replaces (if Option 1)
3. Drag word → word zone (outside text) → revert
4. Keyboard: Tab + Space/Enter to activate
5. Mobile touch → drag activates after 8px distance
