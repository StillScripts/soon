---
title: shadcn/ui Components
description: Setting up shadcn/ui with Base UI primitives in the @repo/ui package for a modern, accessible component system.
---

## What We Did

Replaced the placeholder UI components in `@repo/ui` with a full shadcn/ui component library using the new **Base UI** primitives. This provides a complete, accessible, and customizable design system with Tailwind CSS v4 and oklch color space theming.

## Why This Approach

**Key reasons:**
- **Base UI primitives**: shadcn's new `@base-ui/react` provides unstyled, accessible components that are more lightweight than Radix UI
- **oklch color space**: Modern color system with better perceptual uniformity for consistent light/dark themes
- **Tailwind CSS v4**: Latest version with native CSS variables and improved performance
- **Monorepo-ready**: Components live in `@repo/ui` and can be consumed by any app in the workspace
- **Full customization**: shadcn components are copied into your codebase, not imported from node_modules

**Alternatives considered:**
- **Radix UI + old shadcn**: More mature but heavier; Base UI is the future direction
- **Headless UI**: Less comprehensive component set
- **Build from scratch**: Too time-consuming; shadcn provides battle-tested patterns

## Commands Used

```bash
# Install dependencies
bun install

# Verify types compile
turbo check-types --filter=@repo/ui --filter=web

# Run development server
turbo dev --filter=web
```

## Implementation Details

### Package Structure

```
packages/ui/
├── components.json          # shadcn configuration
├── package.json             # Dependencies
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── alert-dialog.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── combobox.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── field.tsx
│   │       ├── index.ts        # Barrel export
│   │       ├── input-group.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       └── textarea.tsx
│   ├── lib/
│   │   └── utils.ts            # cn() utility
│   └── styles/
│       └── globals.css         # Tailwind theme
```

### Package Exports

The `@repo/ui` package exports are configured in `package.json`:

```json
{
  "exports": {
    "./components/ui/*": "./src/components/ui/*.tsx",
    "./components/ui": "./src/components/ui/index.ts",
    "./lib/utils": "./src/lib/utils.ts",
    "./styles/globals.css": "./src/styles/globals.css"
  }
}
```

### Components Configuration

The `components.json` file configures shadcn for the monorepo:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-vega",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@repo/ui/components",
    "utils": "@repo/ui/lib/utils",
    "ui": "@repo/ui/components/ui"
  }
}
```

### Theme Configuration

The theme uses oklch color space for better color consistency. Key variables in `globals.css`:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  /* ... mapped from CSS variables to Tailwind */
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.67 0.16 58);
  /* ... full light theme */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.77 0.16 70);
  /* ... full dark theme */
}
```

### Apps/Web Integration

The web app imports the theme in `app/globals.css`:

```css
@import "tailwindcss";
@import "@repo/ui/styles/globals.css";
```

And configures Next.js to transpile the package in `next.config.js`:

```javascript
const nextConfig = {
  transpilePackages: ["@repo/ui"],
};
```

## Key Dependencies

Added to `packages/ui/package.json`:

- `@base-ui/react`: ^1.1.0 - Unstyled, accessible UI primitives from shadcn
- `class-variance-authority`: ^0.7.0 - Type-safe variant styling
- `clsx`: ^2.1.1 - Conditional class names
- `tailwind-merge`: ^2.3.0 - Merge Tailwind classes without conflicts
- `lucide-react`: ^0.468.0 - Icon library
- `tw-animate-css`: ^1.3.4 - Animation utilities

Added to `apps/web/package.json`:

- `tailwindcss`: ^4.1.0 - Tailwind CSS v4
- `@tailwindcss/postcss`: ^4.1.0 - PostCSS plugin for Tailwind

## Integration with Existing Code

### Importing Components

Components can be imported individually or from the barrel export:

```tsx
// Individual imports (tree-shakeable)
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

// Barrel import
import { Button, Card, Input } from "@repo/ui/components/ui";
```

### Using the cn() Utility

The `cn()` function merges Tailwind classes safely:

```tsx
import { cn } from "@repo/ui/lib/utils";

<div className={cn("base-class", conditional && "conditional-class", className)} />
```

### Example Usage

```tsx
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

export function MyForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex gap-2">
          <Input placeholder="Enter title..." className="flex-1" />
          <Button type="submit">Create</Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

## Context for AI

When working with the UI components:

- **Component location**: All shadcn components are in `packages/ui/src/components/ui/`
- **Import paths**: Use `@repo/ui/components/ui/button` not `@/components/ui/button`
- **Internal imports**: Components import utils with relative paths `../../lib/utils`
- **Base UI**: Components use `@base-ui/react` primitives, not Radix UI
- **Dark mode**: Uses `.dark` class selector, configured via `@custom-variant dark`
- **Adding components**: Can use `bunx shadcn@latest add <component>` but will need to update import paths

### Available Components

| Component | Description |
|-----------|-------------|
| `AlertDialog` | Modal dialog for important actions |
| `Badge` | Status indicators and labels |
| `Button` | Primary interactive element (6 variants) |
| `Card` | Container with header/content/footer |
| `Combobox` | Searchable select with autocomplete |
| `DropdownMenu` | Context menus and action menus |
| `Field` | Form field wrapper with label/error |
| `Input` | Text input field |
| `InputGroup` | Input with addons (icons, buttons) |
| `Label` | Form label component |
| `Select` | Dropdown select component |
| `Separator` | Visual divider |
| `Textarea` | Multi-line text input |

## Outcomes

### Before
- 3 placeholder components (button, card, code) with no styling
- No design system or theme
- Inline styles in page components

### After
- 13 fully-styled, accessible components
- Complete oklch-based theme with light/dark mode
- Consistent design language across the app
- Type-safe component variants

## Testing/Verification

```bash
# Type check
turbo check-types --filter=@repo/ui --filter=web

# Run dev server
turbo dev --filter=web
```

Expected results:
- Page renders at http://localhost:3000 with styled components
- Cards have subtle shadows and rounded corners
- Button has primary color styling
- Dark mode works automatically (via prefers-color-scheme)
- Form inputs have proper focus states

## Next Steps

- Add more shadcn components as needed (Dialog, Toast, Form, etc.)
- Consider adding a theme switcher for manual dark mode toggle
- Set up Storybook for component documentation
- Add component tests with Testing Library

## Related Documentation

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Base UI Documentation](https://base-ui.com)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [oklch Color Space](https://oklch.com)
- [Convex Backend Guide](./05-convex-backend)
