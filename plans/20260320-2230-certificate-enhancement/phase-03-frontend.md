# Phase 03 — Frontend: Share + Public Verify Page + UI Enhancements

**Date:** 2026-03-20
**Status:** Pending (depends on Phase 1)
**Priority:** High

---

## Context Links

- Parent plan: [plan.md](./plan.md)
- Cert list page: `frontend/app/certificates/page.tsx`
- Cert detail page: `frontend/app/certificates/[id]/page.tsx` (has downloadPdf already)
- API client: `frontend/lib/api.ts` (no `certificatesApi` yet — need to add)
- Query keys: `frontend/lib/query-keys.ts`

---

## Key Insights

- `frontend/app/certificates/[id]/page.tsx` already has `downloadPdf()` function
- `certificatesApi` is NOT in `frontend/lib/api.ts` — need to add full section
- Public verify page needs no auth — use plain `fetch`, no auth header
- Share: copy `window.location.origin + '/verify/' + certNumber` to clipboard

---

## Related Code Files

| File | Action |
|------|--------|
| `frontend/lib/api.ts` | Add `certificatesApi` section |
| `frontend/lib/query-keys.ts` | Add `certificates` query keys |
| `frontend/app/certificates/page.tsx` | Show `certificateNumber` in list |
| `frontend/app/certificates/[id]/page.tsx` | Add Share button, show cert number |
| `frontend/app/verify/[certificateNumber]/page.tsx` | Create — public verify page |

---

## Implementation Steps

### Step 1 — Add certificatesApi to frontend/lib/api.ts

```typescript
certificatesApi: {
  getMy: () => fetchApi<Certificate[]>('/certificates/my'),
  getById: (id: string) => fetchApi<Certificate>(`/certificates/${id}`),
  verify: (certNumber: string) => fetch(`/api/proxy/certificates/verify/${certNumber}`).then(r => r.json()),
  downloadPdfUrl: (id: string) => `${API_BASE_URL}/certificates/${id}/pdf`,
},
```

### Step 2 — Add query keys

```typescript
certificates: {
  all: ['certificates'] as const,
  my: () => [...queryKeys.certificates.all, 'my'] as const,
  detail: (id: string) => [...queryKeys.certificates.all, id] as const,
  verify: (certNumber: string) => [...queryKeys.certificates.all, 'verify', certNumber] as const,
},
```

### Step 3 — Update cert detail page

Add Share button alongside existing download button:

```typescript
const handleShare = () => {
  const url = `${window.location.origin}/verify/${cert.certificateNumber}`;
  navigator.clipboard.writeText(url);
  toast({ title: 'Link copied!', description: url });
};

// In JSX, next to existing download button:
<Button variant="outline" onClick={handleShare}>
  <Share2 className="w-4 h-4 mr-2" /> Share
</Button>
```

Also display cert number:
```tsx
<p className="text-sm text-muted-foreground">
  Certificate No: <span className="font-mono">{cert.certificateNumber ?? 'N/A'}</span>
</p>
```

### Step 4 — Create public verify page

```
frontend/app/verify/[certificateNumber]/page.tsx
```

- No auth required — `'use client'` with plain fetch, or server component
- Use `GET /certificates/verify/:certificateNumber` (public endpoint from Phase 1)
- Shows: holder name, course title, issued date, cert number, valid badge
- Error state: "Certificate not found" if 404

```typescript
// Server component approach:
export default async function VerifyPage({ params }: { params: { certificateNumber: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificates/verify/${params.certificateNumber}`,
    { cache: 'no-store' });

  if (!res.ok) {
    return <div>Certificate not found</div>;
  }

  const cert = await res.json();
  return (
    <div className="max-w-lg mx-auto mt-20 p-8 border rounded-lg text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold">Valid Certificate</h1>
      <p className="text-lg mt-4">{cert.holderName}</p>
      <p className="text-muted-foreground">completed</p>
      <p className="text-xl font-semibold">{cert.course.title}</p>
      <p className="text-sm mt-4">Issued: {new Date(cert.issuedAt).toLocaleDateString()}</p>
      <p className="font-mono text-xs text-muted-foreground mt-2">{cert.certificateNumber}</p>
    </div>
  );
}
```

### Step 5 — Update certificates list page

Add `certificateNumber` column/field to list cards.

---

## Todo List

- [ ] Add `certificatesApi` to `frontend/lib/api.ts`
- [ ] Add `certificates` query keys to `frontend/lib/query-keys.ts`
- [ ] Add Share button to `/certificates/[id]/page.tsx`
- [ ] Display `certificateNumber` on detail and list pages
- [ ] Create `frontend/app/verify/[certificateNumber]/page.tsx`
- [ ] Add `/verify` route to Next.js (no auth middleware exclusion needed if already public)

---

## Success Criteria

- [ ] Share button copies `/verify/:certificateNumber` URL to clipboard
- [ ] `/verify/CERT-20260320-ABC12` page works without login
- [ ] Valid cert shows green badge with holder name and course
- [ ] Invalid cert number shows "Certificate not found" message
- [ ] Cert number displayed on list and detail pages
