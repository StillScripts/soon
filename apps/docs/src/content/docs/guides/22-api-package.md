---
title: Shared API Package
description: Created @repo/api package for reusable TanStack Query hooks with type-safe Convex integration
---

## What We Did

Created a new `@repo/api` package that centralizes all TanStack Query hooks for Convex API operations. This package provides type-safe `useQuery` and `useMutation` hooks that can be reused across any app in the monorepo.

## Why This Approach

**Key reasons:**

- **Code reuse**: Query hooks can be shared between apps/web and future apps
- **Type inference**: Full type safety from Convex API through better-convex/cRPC
- **Consistency**: Single source of truth for API interactions
- **Developer experience**: Pre-built hooks with cache invalidation patterns

**Alternatives considered:**

- Keep hooks in apps/web: Would require duplication for new apps
- Generate hooks automatically: Added complexity without clear benefit
- Use Convex React hooks directly: Would lose TanStack Query benefits (caching, devtools)

## Implementation Details

### Package Structure

```
packages/api/
├── src/
│   ├── context/           # CRPC context factory
│   │   └── index.ts
│   ├── things/            # Things API hooks
│   │   ├── index.ts
│   │   └── things.test.ts
│   ├── types.ts           # Re-exported types
│   └── types.test.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── .oxlintrc.json
```

### Exports

The package provides three main exports:

```typescript
// Context factory and types for app initialization
import { type Api, createCRPCContext } from "@repo/api/context"
// Type-safe hooks for Things CRUD
import { useThings, useThingsCreate, useThingsList } from "@repo/api/things"
// Re-exported types from backend
import type { ApiInputs, ApiOutputs, Thing } from "@repo/api/types"
```

### Context Setup

Apps create their CRPC context by importing the factory and Convex API:

```typescript
// apps/web/lib/convex/crpc.tsx
"use client"

import { api } from "@convex/api"
import { meta } from "@convex/meta"
import { type Api, createCRPCContext } from "@repo/api/context"

const crpcContext = createCRPCContext<Api>({
	api,
	meta,
	convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
})

export const useCRPC = crpcContext.useCRPC
export const useCRPCClient = crpcContext.useCRPCClient
export const CRPCProvider = crpcContext.CRPCProvider
```

Note: The app must import `api` and `meta` directly since they require path aliases that are app-specific. The `@repo/api` package provides the factory and types.

### Available Hooks

#### Individual Hooks

```typescript
// List all things
const { data: things, isPending } = useThingsList(crpc, { limit: 10 })

// Get single thing
const { data: thing } = useThingsGet(crpc, thingId)

// Mutations with custom callbacks
const createThing = useThingsCreate(crpc, { onSuccess: () => invalidate() })
const updateThing = useThingsUpdate(crpc, { onSuccess: () => invalidate() })
const deleteThing = useThingsRemove(crpc, { onSuccess: () => invalidate() })

// Image upload URL generation
const generateUrl = useThingsGenerateUploadUrl(crpc)
```

#### Bundled Hook

The `useThings` hook provides all operations with automatic cache invalidation:

```typescript
const { things, isLoading, error, create, update, remove, generateUploadUrl, invalidate } =
	useThings(crpc)

// Create with automatic cache invalidation
await create.mutateAsync({ title: "New Thing" })

// Update
await update.mutateAsync({ id: thingId, title: "Updated" })

// Delete
await remove.mutate({ id: thingId })
```

## Key Dependencies

- `@tanstack/react-query`: ^5.90.20 - Query/mutation state management
- `backend`: workspace:\* - Convex API types and cRPC utilities
- `better-convex`: ^0.5.7 - Type-safe cRPC for Convex

## Integration with Existing Code

The package integrates with the existing better-convex/cRPC architecture:

1. **Backend**: Exports API types through `backend/types`
2. **@repo/api**: Provides hooks that consume these types
3. **Apps**: Use hooks with their local CRPC context

```
packages/backend/
├── convex/shared/types.ts      # ApiInputs, ApiOutputs
├── convex/shared/react.ts      # createCRPCContext re-export
└── convex/functions/_generated/api.d.ts

packages/api/
├── src/context/index.ts        # createApiContext (wraps createCRPCContext)
├── src/things/index.ts         # Hooks using the types
└── src/types.ts                # Re-exports for convenience

apps/web/
└── lib/convex/crpc.tsx         # App-specific context instance
```

## Context for AI

When working with @repo/api:

- All hooks require a `crpc` client from `useCRPC()` as the first argument
- Hooks return standard TanStack Query results (data, isPending, error, etc.)
- The `useThings` hook bundles CRUD operations with automatic cache invalidation
- Individual hooks (useThingsList, etc.) offer more control over mutation callbacks
- Types are re-exported from `@repo/api/types` for convenience
- Context creation requires `NEXT_PUBLIC_CONVEX_SITE_URL` environment variable

## Outcomes

### Before

Query hooks were defined inline in component files:

```typescript
const { data: things } = useQuery(crpc.things.list.queryOptions({}))
const createThing = useMutation(crpc.things.create.mutationOptions({ onSuccess }))
```

### After

Hooks are imported from the shared package:

```typescript
import { useThings } from "@repo/api/things"

const { things, create, update, remove } = useThings(crpc)
```

## Testing/Verification

```bash
# Run API package tests
turbo test --filter=@repo/api

# Type check
turbo check-types --filter=@repo/api

# Verify web app still works
turbo check-types --filter=web
```

Expected results:

- 7 tests pass in @repo/api
- Type checking passes for all packages
- Web app builds without errors

## Next Steps

When adding new entities to the backend:

1. Create hooks in `packages/api/src/<entity>/index.ts`
2. Export from `package.json`
3. Add types to `packages/api/src/types.ts`
4. Update consuming apps to use the new hooks

## Related Documentation

- [Better Convex Migration](./12-better-convex-migration) - cRPC setup
- [Better Convex Folder Structure](./16-better-convex-folder-structure) - Backend organization
- [Shared Validators](./13-shared-validators) - Input validation schemas
