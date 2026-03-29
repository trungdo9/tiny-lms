# RetroUI Landing Page Integration Plan

## Context

The Tiny LMS home page (`frontend/app/page.tsx`) currently uses a simple, minimal design with basic Tailwind CSS styling. The goal is to integrate RetroUI, a NeoBrutalism-styled UI library, to give the landing page a distinctive retro-bold aesthetic.

**Current State:**
- Simple centered layout with title, description, and two buttons
- Uses default Tailwind classes and shadcn/ui design tokens
- Fonts: Geist Sans/Mono

**Target State:**
- NeoBrutalism style with bold shadows, high contrast colors
- RetroUI Button component with yellow primary (#ffdb33)
- Fonts: Archivo Black (headings), Space Grotesk (body)

## Overview

This plan outlines the two-phase implementation:

1. **Phase 1 (Installation):** Install RetroUI components and configure theme
2. **Phase 2 (Redesign):** Redesign the home page with NeoBrutalism styling

## Key Insights

- RetroUI is installed via shadcn CLI using a remote URL
- NeoBrutalism style relies on thick black borders, offset shadows, and bold colors
- Need to swap fonts from Geist to Archivo Black and Space Grotesk
- RetroUI provides a Button component that matches the NeoBrutalism aesthetic

## Requirements

1. Install RetroUI Button component via shadcn CLI
2. Add RetroUI theme CSS variables (--primary: #ffdb33, bold shadows)
3. Update fonts to Archivo Black (headings) and Space Grotesk (body)
4. Redesign home page with NeoBrutalism styling
5. Preserve Sign In and Create Account navigation

## Architecture

```
frontend/
├── app/
│   ├── page.tsx          # Redesigned home page
│   ├── layout.tsx       # Updated with new fonts
│   └── globals.css     # Added RetroUI theme variables
└── components/
    └── ui/
        └── button.tsx  # New RetroUI Button component
```

## Related Files

- `/home/trung/workspace/project/private/tiny-lms/frontend/app/page.tsx` - Current home page
- `/home/trung/workspace/project/private/tiny-lms/frontend/app/layout.tsx` - Root layout with fonts
- `/home/trung/workspace/project/private/tiny-lms/frontend/app/globals.css` - Global CSS variables
- `/home/trung/workspace/project/private/tiny-lms/frontend/package.json` - Project dependencies
- `/home/trung/workspace/project/private/tiny-lms/frontend/components.json` - shadcn configuration

## Implementation Steps

See individual phase files:
- [Phase 01: Installation](./phase-01-installation.md)
- [Phase 02: Redesign](./phase-02-redesign.md)

## Todo List

- [x] Run shadcn CLI to install RetroUI Button
- [x] Update globals.css with RetroUI theme colors and shadows
- [x] Update layout.tsx with Archivo Black and Space Grotesk fonts
- [x] Redesign page.tsx with NeoBrutalism styling
- [x] Verify Sign In / Create Account navigation works

## Success Criteria

1. [x] RetroUI Button component renders correctly with yellow primary color
2. [x] Fonts are correctly loaded (Archivo Black for headings, Space Grotesk for body)
3. [x] Home page displays NeoBrutalism styling (bold borders, offset shadows)
4. [x] Sign In and Create Account buttons navigate to correct routes
5. [x] No console errors on page load

---

## Status: ✅ COMPLETED

## Risk Assessment

- **Low Risk:** RetroUI integrates via shadcn, which is already configured
- **Medium Risk:** Font changes may require Next.js dev server restart
- **Low Risk:** NeoBrutalism styling is additive, no existing functionality is modified
