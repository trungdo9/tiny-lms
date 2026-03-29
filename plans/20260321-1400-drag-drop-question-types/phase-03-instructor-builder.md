# Phase 3: Frontend — Instructor Question Builder

**Parent plan:** [plan.md](./plan.md)
**Date:** 2026-03-21
**Priority:** P1
**Status:** Pending
**Depends on:** Phase 1 (backend accepts new types + upload endpoint)

---

## Overview

Add drag_drop_text and drag_drop_image builder UI to the instructor question bank page.
Image upload saves to **local disk** (same pattern as SCORM — multer diskStorage + express.static).

Files to modify:
- `frontend/app/instructor/question-banks/[id]/page.tsx`
- `backend/src/modules/questions/questions.controller.ts` — add image upload endpoint
- `backend/src/main.ts` — serve `/uploads/images` as static

---

## Key Insights

- `QUESTION_TYPES` array already exists — just add two entries
- SCORM uses `memoryStorage()` + custom processing; images need `diskStorage` to save directly to disk
- Static serving pattern already in `main.ts`: `/scorm/content` → `public/scorm/` — add `/uploads/images` → `public/uploads/images/`
- Image URL returned from upload: `http://localhost:3001/uploads/images/filename.jpg` → stored in `Question.mediaUrl`
- No new DB needed — `Question.mediaUrl` + `Question.mediaType = "image"` already exist

---

## Architecture

### Backend — Image Upload Endpoint

**New endpoint:** `POST /questions/upload-image`
- Auth guard: `JwtAuthGuard` (instructor/admin only)
- Multer: `diskStorage` → saves to `backend/public/uploads/images/`
- Filename: `uuid() + ext` (to avoid collisions)
- Returns: `{ url: "/uploads/images/<filename>" }`

**main.ts addition:**
```ts
app.use(
  '/uploads/images',
  express.static(path.join(process.cwd(), 'public', 'uploads', 'images')),
);
```

### Frontend — Question Bank Builder

**File:** `frontend/app/instructor/question-banks/[id]/page.tsx`

---

## Implementation Steps

### Step 3.1 — Backend: add upload endpoint

In `backend/src/modules/questions/questions.controller.ts`:
```ts
@Post('upload-image')
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: path.join(process.cwd(), 'public', 'uploads', 'images'),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) cb(new BadRequestException('Only images allowed'), false);
    else cb(null, true);
  },
}))
async uploadImage(@UploadedFile() file: Express.Multer.File) {
  return { url: `/uploads/images/${file.filename}` };
}
```

In `backend/src/main.ts`, add after SCORM static serve:
```ts
app.use(
  '/uploads/images',
  express.static(path.join(process.cwd(), 'public', 'uploads', 'images')),
);
```

Ensure `backend/public/uploads/images/` directory is gitignored (add to `.gitignore`).

### Step 3.2 — Register new types (frontend)
```ts
const QUESTION_TYPES = [
  ...existing,
  { value: 'drag_drop_text',  label: 'Drag Words into Blanks' },
  { value: 'drag_drop_image', label: 'Drag Labels onto Image' },
];
```

### Step 3.3 — drag_drop_text form section

Add state for template + tokens:
```ts
const [ddtTemplate, setDdtTemplate] = useState('');
const [ddtTokens, setDdtTokens] = useState<{ content: string; slotId: string | null }[]>([]);
```

UI:
- `<textarea>` for template; helper: "Use [slot_0], [slot_1]… to mark blanks"
- Live preview showing `[slot_N]` highlighted as colored pills
- "Add correct token" button → inline input + slot dropdown (`slot_0`, `slot_1`, derived from template) → push to `ddtTokens`
- "Add distractor" button → inline input → push `{ content, slotId: null }`
- Token list: chips with "fox → slot_0 ✕" or "elephant (distractor) ✕"
- On save: `content = ddtTemplate`, `options = ddtTokens.map(t => ({ content: t.content, isCorrect: !!t.slotId, matchKey: t.slotId }))`

### Step 3.4 — drag_drop_image form section

Add state:
```ts
const [ddiImageUrl, setDdiImageUrl] = useState('');
const [ddiUploading, setDdiUploading] = useState(false);
const [ddiZones, setDdiZones] = useState<{ id: string; label: string; x: number; y: number }[]>([]);
const [ddiDistractors, setDdiDistractors] = useState<string[]>([]);
```

UI flow:
1. **Upload button** → `<input type="file" accept="image/*">` → `POST /questions/upload-image` (FormData) → sets `ddiImageUrl`
2. **Image preview container** (`position: relative`, fixed height):
   - `onClick(e)` → `getBoundingClientRect()` → compute `x = (e.clientX - rect.left) / rect.width * 100`, `y = (e.clientY - rect.top) / rect.height * 100` → push new zone `{ id: uuid(), label: '', x, y }`
   - Zone overlays: `position: absolute`, 20×20px circle centered at `(x%, y%)`; label input below marker; delete button
3. **Add distractor** button → text input → push to `ddiDistractors`

On save:
```ts
content = questionContent
mediaUrl = API_URL + ddiImageUrl  // full URL
mediaType = "image"
options = [
  ...ddiZones.map((z, i) => ({
    content: z.label,
    isCorrect: true,
    matchKey: `zone_${i}`,
    matchValue: JSON.stringify({ x: z.x, y: z.y, w: 10, h: 8 }),
  })),
  ...ddiDistractors.map(d => ({ content: d, isCorrect: false, matchKey: null, matchValue: null })),
]
```

### Step 3.5 — Frontend upload helper

```ts
async function uploadImage(file: File): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API}/questions/upload-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session?.access_token}` },
    body: form,
  });
  if (!res.ok) throw new Error('Upload failed');
  const { url } = await res.json();
  return url; // "/uploads/images/filename.jpg"
}
```

---

## Todo

- [ ] **Verify** `multer` and `@types/multer` are in `backend/package.json` deps/devDeps; add if missing
- [ ] Add `POST /questions/upload-image` endpoint with `diskStorage` (5MB limit, images only)
- [ ] **Route ordering**: declare `@Post('upload-image')` **before** any `@Post(':id/...')` routes in `QuestionsController` to prevent NestJS matching `upload-image` as a `:id` param
- [ ] Add static route in `main.ts` for `/uploads/images`
- [ ] Create `backend/public/uploads/images/` dir with `fs.mkdirSync(..., { recursive: true })` in the controller or on app startup; add path to `.gitignore`
- [ ] Add two entries to `QUESTION_TYPES` array
- [ ] Add drag_drop_text form section (template textarea + token manager)
- [ ] Add drag_drop_image form section (upload + click-to-place zones + distractors)
- [ ] Zone `x,y` stored as **center point** percentages — consistent with Phase 2 `translate(-50%,-50%)` and Phase 4 result overlay
- [ ] Wire both into save/create mutation payload

---

## Success Criteria

- [ ] Instructor can upload an image; served at `http://localhost:3001/uploads/images/<file>`
- [ ] Instructor can build drag_drop_text question with slots and tokens
- [ ] Instructor can build drag_drop_image question with image + click-placed zones + distractors
- [ ] Created questions appear in question bank and work in student attempt

---

## Risk Assessment

- `getBoundingClientRect()` click coords: use `e.clientX - rect.left` and `e.clientY - rect.top` for container-relative position before converting to percentage
- Zone default size `w:10, h:8` (% of image container) — refinement is future work
- Portrait/non-16:9 images: zone positions will visually match since the builder preview and student attempt use the same container aspect ratio
