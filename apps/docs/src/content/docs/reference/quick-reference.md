---
title: Quick Reference
description: Common commands and patterns for daily development.
---

## Commands

### Development

```bash
bun dev                       # Start all apps
turbo dev --filter=web        # Next.js on port 3000
turbo dev --filter=docs       # Astro docs on port 4321
```

### Building

```bash
bun build                     # Build all apps
turbo build --filter=web      # Build specific app
```

### Code Quality

```bash
bun lint                      # Lint all packages
bun format                    # Format all files
bun format:check              # Check formatting (CI)
bun check-types               # Type check all
bun test                      # Run all tests
bun test:watch                # Watch mode
```

### Turborepo Filters

```bash
turbo <task> --filter=web           # By name
turbo <task> --filter=@repo/ui      # By package name
turbo <task> --filter=./apps/web    # By path
turbo <task> --affected             # Changed only
turbo <task> --filter=!docs         # Exclude
```

## Imports

### UI Components

```tsx
import { Button } from "@repo/ui/components/ui/button"
import { Card, Input } from "@repo/ui/components/ui"
import { cn } from "@repo/ui/lib/utils"
```

### Convex

```tsx
import { api } from "@repo/backend/convex"
import { useQuery, useMutation } from "convex/react"

const things = useQuery(api.functions.things.list)
const create = useMutation(api.functions.things.create)
```

### Validators

```tsx
import { createThingSchema } from "@repo/validators/things"
```

### Styles

```css
@import "@repo/ui/styles/globals.css";
```

## Adding Components

```bash
cd packages/ui
bunx shadcn@latest add <component>
# Update imports: @/lib/utils → ../../lib/utils
```

## File Locations

| What | Where |
|------|-------|
| Web app pages | `apps/web/app/` |
| UI components | `packages/ui/src/components/ui/` |
| Convex functions | `packages/backend/convex/functions/` |
| Validators | `packages/validators/src/` |
| Docs content | `apps/docs/src/content/docs/` |
| oxlint configs | `packages/oxlint-config/` |
| TypeScript configs | `packages/typescript-config/` |
| Vitest config | `packages/vitest-config/` |

## Ports

| App | Port |
|-----|------|
| Web (Next.js) | 3000 |
| Docs (Astro) | 4321 |

## Environment Variables

| Variable | Location | Purpose |
|----------|----------|---------|
| `CONVEX_DEPLOYMENT` | `packages/backend/.env.local` | Convex deployment |
| `NEXT_PUBLIC_CONVEX_URL` | `apps/web/.env.local` | Client Convex URL |
| `SITE_URL` | `packages/backend/.env.local` | Better Auth base URL |
