# Phase 02: Redesign

## Context

With RetroUI installed and theme configured, the second phase redesigns the home page with NeoBrutalism styling while preserving existing functionality.

## Overview

Transform the simple home page into a bold NeoBrutalism design using RetroUI Button, custom CSS, and the configured theme variables.

## Key Insights

- NeoBrutalism = thick borders + offset shadows + high contrast
- RetroUI Button already has built-in NeoBrutalism styling
- Need to add additional container styling for full effect
- Keep navigation links (Sign In, Create Account) functional

## Requirements

1. Import RetroUI Button component
2. Apply NeoBrutalism styling to page container
3. Style heading and description with new fonts
4. Use Button component for navigation
5. Add decorative NeoBrutalism elements

## Architecture

```
frontend/app/page.tsx - Redesigned with NeoBrutalism style
```

## Related Files

- `/home/trung/workspace/project/private/tiny-lms/frontend/app/page.tsx` - To be redesigned
- `/home/trung/workspace/project/private/tiny-lms/frontend/components/ui/button.tsx` - RetroUI Button

## Implementation Steps

### Step 1: Update page.tsx imports

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
```

### Step 2: Redesign the page component

Replace the current page content with NeoBrutalism styling:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#ffdb33] p-4">
      {/* Decorative brutalist container */}
      <div className="max-w-2xl w-full bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000000] p-8 md:p-12">
        {/* Retro badge */}
        <div className="inline-block bg-black text-white px-4 py-1 mb-6 font-mono text-sm">
          LMS v1.0
        </div>

        {/* Heading with Archivo Black */}
        <h1 className="text-5xl md:text-6xl font-black mb-4 text-black tracking-tight font-['var(--font-archivo-black)']">
          Tiny LMS
        </h1>

        {/* Description with Space Grotesk */}
        <p className="text-xl md:text-2xl text-gray-800 mb-8 font-medium font-['var(--font-space-grotesk)']">
          A compact Learning Management System for lessons and quizzes
        </p>

        {/* Button container with gap */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="bg-[#ffdb33] text-black border-[3px] border-black hover:bg-[#ffd000] shadow-[4px_4px_0px_0px_#000000] hover:shadow-[6px_6px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-bold text-lg px-8 py-6">
            <Link href="/login">
              Sign In
            </Link>
          </Button>

          <Button asChild variant="outline" className="bg-white text-black border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[6px_6px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-bold text-lg px-8 py-6">
            <Link href="/register">
              Create Account
            </Link>
          </Button>
        </div>

        {/* Decorative bottom element */}
        <div className="mt-8 pt-6 border-t-[3px] border-black">
          <p className="text-sm font-mono text-gray-600">
            Start learning today
          </p>
        </div>
      </div>
    </main>
  );
}
```

### Step 3: Verify Button component supports asChild

Check that the RetroUI Button component supports the `asChild` prop for rendering as Link. If not, wrap in a component or use direct styling.

### Step 4: Test the implementation

```bash
cd frontend
npm run dev
```

Navigate to http://localhost:3000 and verify:
- Yellow background (#ffdb33) visible
- Bold black borders on container and buttons
- Offset shadow effects working
- Fonts rendering correctly (Archivo Black headings, Space Grotesk body)
- Sign In and Create Account buttons navigate correctly

## Todo List

- [ ] Update imports in page.tsx
- [ ] Implement NeoBrutalism design with RetroUI Button
- [ ] Verify asChild prop works for Link integration
- [ ] Test navigation links
- [ ] Verify visual design matches NeoBrutalism spec

## Success Criteria

1. Page displays with yellow background (#ffdb33)
2. Container has 3px black border with offset shadow
3. Buttons have NeoBrutalism styling (border, shadow, hover effects)
4. Heading uses Archivo Black font
5. Body text uses Space Grotesk font
6. Sign In navigates to /login
7. Create Account navigates to /register
8. No console errors

## Risk Assessment

- **Low Risk:** Changes are isolated to page.tsx
- **Low Risk:** Navigation links remain unchanged
- **Medium Risk:** Button asChild prop may need adjustment if RetroUI doesn't support it
- **Low Risk:** Design is visually different but functionally equivalent
