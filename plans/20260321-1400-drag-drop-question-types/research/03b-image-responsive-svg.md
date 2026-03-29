# Pattern: Responsive Image Zones & SVG Regions

Advanced techniques for scaling zones and using SVG for arbitrary shapes.

## Responsive Zone Scaling

Scale zone coordinates when image resizes:

```tsx
function ResponsiveLabelImage({
  imageUrl,
  labels,
  baseZones, // Coordinates for base image size (e.g., 800x600)
  baseWidth = 800,
  onSubmit,
}: {
  imageUrl: string;
  labels: { id: string; text: string }[];
  baseZones: { id: string; x: number; y: number; radius: number }[];
  baseWidth?: number;
  onSubmit: (placement: Record<string, string>) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (imgRef.current) {
      const actualWidth = imgRef.current.offsetWidth;
      setScale(actualWidth / baseWidth);
    }

    const handleResize = () => {
      if (imgRef.current) {
        setScale(imgRef.current.offsetWidth / baseWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [baseWidth]);

  const scaledZones = baseZones.map(z => ({
    ...z,
    x: z.x * scale,
    y: z.y * scale,
    radius: z.radius * scale,
  }));

  return (
    <div className="relative">
      <img ref={imgRef} src={imageUrl} className="w-full" />
      {scaledZones.map(z => (
        <DropZone key={z.id} {...z} />
      ))}
    </div>
  );
}
```

**Key Points:**
- Store base zone coordinates for reference image size
- Recalculate scale on window resize
- Apply scale to all coordinates (x, y, radius)
- Works with ResizeObserver for better accuracy

## SVG for Arbitrary Regions

Use SVG for non-circular shapes (polygons, paths, rectangles):

```tsx
function LabelImageDragSVG({
  imageUrl,
  labels,
  regions, // SVG path or circle definitions
  onSubmit,
}: {
  imageUrl: string;
  labels: { id: string; text: string }[];
  regions: { id: string; path: string; label?: string }[];
  onSubmit: (placement: Record<string, string>) => void;
}) {
  const [placed, setPlaced] = useState<Record<string, string>>({});

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.data.type !== 'label') return;
    setPlaced(prev => ({
      ...prev,
      [over.id as string]: active.data.label,
    }));
  };

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragEnd={handleDragEnd}
    >
      <div className="relative w-full inline-block">
        <img src={imageUrl} className="w-full block" />

        {/* SVG Overlay */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'auto' }}
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid meet"
        >
          {regions.map(region => (
            <SVGDropZone
              key={region.id}
              id={region.id}
              path={region.path}
              label={placed[region.id]}
            />
          ))}
        </svg>
      </div>

      {/* Sidebar labels */}
      <div className="mt-4 space-y-2">
        {labels.map(label => (
          <DraggableLabel
            key={label.id}
            id={label.id}
            label={label.text}
          />
        ))}
      </div>

      <DragOverlay>{/* ... */}</DragOverlay>
    </DndContext>
  );
}
```

## SVG Drop Zone Component

```tsx
function SVGDropZone({
  id,
  path,
  label,
}: {
  id: string;
  path: string;
  label?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'zone', id }
  });

  return (
    <g
      ref={setNodeRef as any}
      data-droppable={id}
      className={`transition ${
        isOver ? 'opacity-70' : 'opacity-0 hover:opacity-30'
      }`}
    >
      {/* SVG path for region */}
      <path
        d={path}
        fill="currentColor"
        className="text-blue-500 cursor-pointer"
      />

      {/* Label text if placed */}
      {label && (
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-medium text-gray-700 pointer-events-none"
        >
          {label}
        </text>
      )}
    </g>
  );
}
```

## SVG Region Definitions (Examples)

```tsx
// Circle
const regions = [
  {
    id: 'zone-1',
    path: 'M 200 200 m -30, 0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0'
  }
];

// Rectangle
const regions = [
  {
    id: 'zone-1',
    path: 'M 100 100 L 200 100 L 200 150 L 100 150 Z'
  }
];

// Polygon
const regions = [
  {
    id: 'zone-1',
    path: 'M 300 100 L 400 100 L 350 200 Z' // Triangle
  }
];

// Irregular path (draw in Illustrator, export SVG, copy path)
const regions = [
  {
    id: 'zone-1',
    path: 'M 150 50 Q 200 30 250 50 L 260 100 Q 250 140 200 150 L 140 100 Z'
  }
];
```

## ViewBox for Responsive SVG

Use `viewBox` + `preserveAspectRatio` for scaling:

```tsx
<svg
  viewBox="0 0 800 600"        // Original size
  preserveAspectRatio="xMidYMid meet"  // Scale uniformly
  className="w-full"            // CSS responsive
>
  {/* Coordinates stay in 800x600 space */}
</svg>
```

**Key Points:**
- Coordinates are in viewBox units (800x600)
- SVG scales automatically with CSS `w-full`
- No manual scale calculation needed
- Works on all screen sizes

## Combining Multiple Shapes

```tsx
const regions = [
  { id: 'heart', path: 'M 100,100 ...' },      // Curved path
  { id: 'brain', path: 'M 300,100 ...' },      // Another curve
  { id: 'lungs', path: 'M 500,100 L 600,150...' }, // Polygon
];
```

## Touch on Mobile with SVG

SVG zones need larger hit areas for touch:

```tsx
function SVGDropZone({ id, path, label }: any) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { type: 'zone' } });

  return (
    <g ref={setNodeRef as any} data-droppable={id}>
      {/* Invisible larger path for touch hit area */}
      <path
        d={path}
        fill="transparent"
        stroke="none"
        strokeWidth="10"
        className="cursor-pointer"
      />

      {/* Visible smaller path */}
      <path
        d={path}
        fill="currentColor"
        className="text-blue-400 opacity-0 hover:opacity-30 transition"
      />

      {label && <text>...</text>}
    </g>
  );
}
```

## Accessibility with SVG

SVG regions need ARIA labels:

```tsx
<g
  ref={setNodeRef as any}
  role="region"
  aria-label={`Drop zone for ${label}`}
  data-droppable={id}
>
  {/* ... */}
</g>
```
