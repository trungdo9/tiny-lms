# Pattern: Label → Image Drop Zone Drag (Basic)

Dragging labels from a sidebar onto coordinate-based zones on an image.

## Architecture

- **Labels source:** Draggable text in sidebar
- **Image:** Background with absolute-positioned drop zones
- **Zones:** Invisible droppable areas (positioned divs)
- **Collision:** Use `pointerWithin` (forgiving overlap detection)

## Drop Zone (Droppable)

```tsx
interface DropZoneProps {
  id: string;
  x: number;
  y: number;
  radius: number;
  label?: string;
}

function DropZone({ id, x, y, radius, label }: DropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'zone', x, y, radius }
  });

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
        ${isOver ? 'border-blue-500 bg-blue-100/50' : 'border-gray-300 bg-gray-100/20'}
        ${label ? 'ring-2 ring-green-400' : ''}
      `}
    >
      {label && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
          {label}
        </div>
      )}
    </div>
  );
}
```

**Key CSS:**
- `position: absolute`: Within relative parent
- `transform: translate(-50%, -50%)`: Center on (x, y) point
- Parent must have `position: relative`

## Draggable Label

```tsx
function DraggableLabel({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, isDragging, transform } =
    useDraggable({
      id,
      data: { type: 'label', label }
    });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
      className={`
        p-3 bg-blue-100 border border-blue-300 rounded cursor-move
        text-sm font-medium transition-opacity
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      {label}
    </div>
  );
}
```

## Image with Zones Container

```tsx
function LabelImageDrag({
  imageUrl,
  labels,
  zones,
  onSubmit,
}: {
  imageUrl: string;
  labels: { id: string; text: string }[];
  zones: { id: string; x: number; y: number; radius: number }[];
  onSubmit: (placement: Record<string, string>) => void;
}) {
  const [placed, setPlaced] = useState<Record<string, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { distance: 8 }),
    useSensor(TouchSensor, { distance: 8 }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.data.type !== 'label') return;
    setPlaced(prev => ({
      ...prev,
      [over.id as string]: active.data.label,
    }));
  };

  const placedLabels = Object.values(placed);
  const availableLabels = labels.filter(l => !placedLabels.includes(l.text));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-40 space-y-2">
          <p className="text-sm font-medium text-gray-600 mb-3">Drag labels:</p>
          {availableLabels.map(label => (
            <DraggableLabel
              key={label.id}
              id={label.id}
              label={label.text}
            />
          ))}
        </div>

        {/* Image + Zones */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt="Diagram"
            className="w-full h-auto block"
          />
          {zones.map(zone => (
            <DropZone
              key={zone.id}
              id={zone.id}
              x={zone.x}
              y={zone.y}
              radius={zone.radius}
              label={placed[zone.id]}
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => onSubmit(placed)}
        disabled={Object.keys(placed).length < zones.length}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        Submit
      </button>

      <DragOverlay>
        {/* See: 04-overlay-preview-pattern.md */}
      </DragOverlay>
    </DndContext>
  );
}
```

## Collision Detection: pointerWithin

For image zones, use `pointerWithin`:

```tsx
<DndContext collisionDetection={pointerWithin}>
  {/* Zones don't need exact rectangles */}
  {/* Pointer location checked against zone geometry */}
</DndContext>
```

**Why `pointerWithin`:**
- ✅ Forgiving for touch
- ✅ Works with circles
- ✅ Pointer position is authoritative

## Replacement Logic

```tsx
const handleDragEnd = ({ active, over }: DragEndEvent) => {
  if (!over) return;
  // Replace existing label in zone
  setPlaced(prev => ({
    ...prev,
    [over.id as string]: active.data.label,
  }));
};
```

## Touch on Mobile

Zones are large targets (60px diameter) → excellent UX without changes.
