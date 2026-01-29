---
title: Quick Reference
description: Common commands and patterns for daily development.
---

## Essential Commands

### Development

```bash
# Start all apps in dev mode
bun dev

# Start specific app
turbo dev --filter=web       # Next.js on port 3000
turbo dev --filter=docs      # Astro docs on port 4321
turbo dev --filter=backend   # Convex dev server
```

### Building

```bash
# Build all apps
bun build

# Build specific app
turbo build --filter=web
turbo build --filter=docs
```

### Code Quality

```bash
# Lint all packages (with auto-fix)
bun lint

# Lint specific package
turbo lint --filter=web
turbo lint --filter=@repo/ui

# Format all files
bun format

# Type checking
bun check-types
turbo check-types --filter=web
```

### Testing

```bash
# Run all tests
bun test

# Watch mode
bun test:watch
```

## Import Patterns

### UI Components

```tsx
// Individual imports
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"

// Barrel import (all components)
import { Button, Card, Input } from "@repo/ui/components/ui"

// Utilities
import { cn } from "@repo/ui/lib/utils"
```

### Convex API

```tsx
import { api } from "backend/convex"
import { useQuery, useMutation } from "convex/react"

const data = useQuery(api.things.getThings)
const mutate = useMutation(api.things.createThing)
```

### Styles

```css
/* In CSS files */
@import "@repo/ui/styles/globals.css";
```

## Adding New Components

### shadcn/ui Components

```bash
cd packages/ui
bunx shadcn@latest add <component>
# Then update imports from @/lib/utils to ../../lib/utils
```

### Generate Custom Component

```bash
cd packages/ui
bun generate:component
```

## Turborepo Filters

```bash
# By package name
turbo <task> --filter=web
turbo <task> --filter=@repo/ui

# By directory
turbo <task> --filter=./apps/web

# Only affected packages
turbo <task> --affected

# Exclude package
turbo <task> --filter=!docs
```

## File Locations

| What               | Where                            |
| ------------------ | -------------------------------- |
| Web app pages      | `apps/web/app/`                  |
| UI components      | `packages/ui/src/components/ui/` |
| Convex functions   | `packages/backend/convex/`       |
| Docs content       | `apps/docs/src/content/docs/`    |
| Biome configs      | `packages/biome-config/`         |
| TypeScript configs | `packages/typescript-config/`    |

## Ports

| App           | Port |
| ------------- | ---- |
| Web (Next.js) | 3000 |
| Docs (Astro)  | 4321 |

## Environment Variables

| Variable                 | Location                      | Purpose                |
| ------------------------ | ----------------------------- | ---------------------- |
| `CONVEX_DEPLOYMENT`      | `packages/backend/.env.local` | Convex deployment ID   |
| `CONVEX_URL`             | `packages/backend/.env.local` | Convex API URL         |
| `NEXT_PUBLIC_CONVEX_URL` | `apps/web/.env.local`         | Client-side Convex URL |
