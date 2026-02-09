---
title: Dark Mode Toggle
description: Adding a theme toggle to the web app using next-themes, leveraging the existing CSS dark mode variables.
---

## What We Did

Added a dark mode toggle to the `web` app so users can switch between light and dark themes. The CSS infrastructure (oklch color variables under a `.dark` class) already existed in `@repo/ui`, but there was no way for users to activate it. We installed `next-themes`, wired up a `ThemeProvider`, and created a toggle button visible on every page.

## Why This Approach

**Key reasons:**

- **next-themes** is the standard solution for Next.js theme switching — it handles SSR hydration, localStorage persistence, system preference detection, and FOUC prevention out of the box
- The existing CSS already used a `.dark` class with oklch color variables, so `attribute="class"` was a perfect fit with zero CSS changes needed
- The `<html>` tag in the layout already had `suppressHydrationWarning`, which is specifically designed for next-themes compatibility

**Alternatives considered:**

- **Manual implementation with React context**: Would require reimplementing localStorage sync, system preference detection, and hydration mismatch prevention — all solved by next-themes
- **CSS `prefers-color-scheme` only**: No user control; relies entirely on OS settings

## Commands Used

```bash
# Install next-themes in the web app
cd apps/web
bun add next-themes
```

## Implementation Details

### File Changes

**New file — `apps/web/components/theme-toggle.tsx`:**

A `"use client"` component that renders a ghost icon button. It uses `useTheme()` from next-themes to read the resolved theme and toggle between light and dark. The sun icon shows in light mode (hidden in dark via `dark:scale-0`), and the moon icon shows in dark mode (hidden in light via `scale-0 dark:scale-100`). Icons are inline SVGs to avoid adding an icon library dependency.

**Modified — `apps/web/app/providers.tsx`:**

Wrapped the entire provider tree with `<ThemeProvider>`:

```tsx
import { ThemeProvider } from "next-themes"

// In the Providers component return:
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
	<ConvexAuthProvider ...>
		<QueryProvider ...>{children}</QueryProvider>
	</ConvexAuthProvider>
</ThemeProvider>
```

The `ThemeProvider` is the outermost wrapper because it needs to apply the `.dark` class to `<html>` before any themed content renders.

**Modified — `apps/web/components/home-page.tsx`:**

Added `<ThemeToggle />` in two locations:

1. **Login view** (unauthenticated): Positioned absolutely in the top-right corner
2. **Authenticated view**: In the header, next to the `<UserHeader />` component

### How the Theme System Works

The flow connects three layers:

1. **`next-themes`** adds/removes the `dark` class on `<html>`
2. **`globals.css`** in `@repo/ui` defines CSS custom properties under `:root` (light) and `.dark` (dark) using oklch colors
3. **Tailwind CSS v4** maps these variables via `@custom-variant dark (&:is(.dark *))` so all `dark:` utilities work automatically

No CSS changes were needed — the entire dark theme was already defined.

## Key Dependencies

- `next-themes`: ^0.4.6 — Theme management for Next.js with SSR support, localStorage persistence, and system preference detection

## Integration with Existing Code

- **`@repo/ui` globals.css**: The `.dark` class selector and all oklch color variables were already defined — next-themes simply activates them
- **Tailwind CSS v4**: The `@custom-variant dark (&:is(.dark *))` rule means every `dark:` utility class works automatically once the `.dark` class is present
- **`@repo/ui` Button**: The toggle reuses the existing `Button` component with `variant="ghost"` and `size="icon"`
- **Layout `suppressHydrationWarning`**: Already present on the `<html>` tag, preventing React hydration warnings when next-themes modifies the class attribute client-side

## Context for AI

When working with theming in this project:

- The theme is controlled by the `dark` class on `<html>`, managed by `next-themes`
- All color tokens are defined as CSS custom properties using oklch in `packages/ui/src/styles/globals.css`
- Use Tailwind `dark:` variants for any theme-aware styling — they work automatically
- The `ThemeProvider` is in `apps/web/app/providers.tsx` as the outermost wrapper
- `defaultTheme="system"` means the app respects OS dark mode preference on first visit
- User preference is persisted in localStorage automatically by next-themes
- The `ThemeToggle` component uses inline SVGs, not an icon library

## Outcomes

### Before

- Dark mode CSS variables existed but were unreachable — no way to toggle the `.dark` class
- The app always rendered in light mode

### After

- Users can toggle between light and dark mode on any page
- System preference is respected by default on first visit
- Theme preference persists across page reloads via localStorage
- The toggle button appears on both the login screen and the authenticated dashboard

## Testing/Verification

```bash
# Type check
turbo check-types --filter=web

# Lint
turbo lint --filter=web

# Dev server
turbo dev --filter=web
```

Expected results:

- Toggle button visible in the top-right of the login page
- Toggle button visible in the header next to the user menu when authenticated
- Clicking the toggle switches between light and dark themes
- Refreshing the page preserves the selected theme
- On first visit with no preference, the app follows the OS setting

## Next Steps

- Consider adding a system/auto option to the toggle (currently cycles between light and dark only)
- The toggle could be extracted to `@repo/ui` if other apps in the monorepo need dark mode

## Related Documentation

- [next-themes documentation](https://github.com/pacocoursey/next-themes)
- [shadcn/ui Components](./07-shadcn-ui-components) — The UI library providing the Button and color system
- [Better Convex RSC](./23-better-convex-rsc) — Previous guide in the development journey
