# Better Convex Patterns

This reference covers the Better Convex patterns used in this project, extracted from development guides 12 and 16.

## Documentation Sources

- Better Convex: https://www.better-convex.com
- GitHub: https://github.com/udecode/better-convex

## Folder Structure

Better Convex recommends separating concerns:

```
packages/backend/
├── convex.json                    # Convex configuration
├── convex/
│   ├── functions/                 # Deployed to Convex runtime
│   │   ├── _generated/            # Auto-generated types
│   │   ├── schema.ts
│   │   ├── things.ts              # cRPC procedures
│   │   ├── auth.ts
│   │   ├── http.ts
│   │   └── convex.config.ts
│   ├── lib/                       # Server helpers (NOT deployed)
│   │   └── crpc.ts                # cRPC builder with middleware
│   └── shared/                    # Exported to web app
│       ├── meta.ts                # Auto-generated auth metadata
│       ├── types.ts               # API type exports
│       └── react.ts               # Re-exported React hooks
```

### Why This Structure?

| Directory    | Purpose                                    | Deployed? |
| ------------ | ------------------------------------------ | --------- |
| `functions/` | Convex queries, mutations, actions         | Yes       |
| `lib/`       | cRPC builder, middleware, server utilities | No        |
| `shared/`    | Types and hooks for the web app            | No        |

## convex.json Configuration

```json
{
	"functions": "convex/functions",
	"codegen": {
		"staticApi": true,
		"staticDataModel": true
	}
}
```

- `functions`: Points to the deployed functions directory
- `staticApi`: Generates strongly-typed API based on `.output()` schemas
- `staticDataModel`: Generates DataModel types for the cRPC builder

## The cRPC Builder

Located in `lib/crpc.ts`:

```typescript
import { CRPCError, initCRPC } from "better-convex/server"

import type { DataModel } from "../functions/_generated/dataModel"
import { action, mutation, query } from "../functions/_generated/server"
import { authComponent } from "../functions/auth"

const c = initCRPC.dataModel<DataModel>().create({
	query,
	mutation,
	action,
})

export const publicQuery = c.query
export const publicMutation = c.mutation

export const authQuery = c.query.meta({ auth: "required" }).use(async ({ ctx, next }) => {
	const user = await authComponent.getAuthUser(ctx)
	if (!user) {
		throw new CRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" })
	}
	return next({ ctx: { ...ctx, user, userId: user._id } })
})

export const authMutation = c.mutation.meta({ auth: "required" }).use(async ({ ctx, next }) => {
	const user = await authComponent.getAuthUser(ctx)
	if (!user) {
		throw new CRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" })
	}
	return next({ ctx: { ...ctx, user, userId: user._id } })
})
```

## Critical: .output() with zid()

**Without `.output()`, the static API generator cannot infer return types.**

```typescript
import { zid } from "convex-helpers/server/zod4"
import { z } from "zod"

const thingOutputSchema = z.object({
  _id: zid("things"),           // NOT z.string()
  _creationTime: z.number(),
  title: z.string(),
  description: z.string().optional(),
  imageId: zid("_storage").optional(),
  userId: z.string(),
  imageUrl: z.string().nullable(),
})

export const list = authQuery
  .input(listThingsSchema)         // From validators package
  .output(z.array(thingOutputSchema))  // Required for type inference
  .query(async ({ ctx, input }) => {
    const things = await ctx.db.query("things").collect()
    return things.map(thing => ({
      ...thing,
      imageUrl: thing.imageId ? await ctx.storage.getUrl(thing.imageId) : null,
    }))
  })

export const create = authMutation
  .input(createThingSchema)
  .output(zid("things"))           // Returns document ID
  .mutation(async ({ ctx, input }) => {
    return ctx.db.insert("things", { ... })
  })
```

**Key rules:**

- Use `zid("tableName")` from `convex-helpers/server/zod4` for Convex IDs
- Every procedure that returns data should have `.output()`
- Mutations that don't return values can omit `.output()` (do NOT use `z.void()`)

## Shared Validators Pattern

The `packages/validators/` package uses `z.string()` for IDs because:

- `zid()` from `convex-helpers/server/zod4` is server-only
- Validators are shared between web and backend

```typescript
// packages/validators/src/things.ts
import { z } from "zod"

export const createThingSchema = z.object({
	title: z.string().min(1).max(200),
	description: z.string().max(2000).optional(),
	imageId: z.string().optional(), // z.string(), not zid()
})
```

## Bun Symlink Resolution Fix

In Bun monorepos, importing `better-convex/react` directly causes TypeScript errors:

```
The inferred type of 'useCRPC' references an inaccessible 'unique symbol' type
```

**Fix: Re-export through backend package:**

```typescript
// packages/backend/convex/shared/react.ts
export { createCRPCContext } from "better-convex/react"
export type { ConvexQueryClient } from "better-convex/react"
```

```typescript
// apps/web/lib/convex/crpc.tsx
import { createCRPCContext } from "backend/react"

// NOT better-convex/react
```

## Client-Side cRPC Context

```typescript
"use client"

import { api } from "@convex/api"
import { meta } from "@convex/meta"
import { createCRPCContext } from "backend/react"

const crpcContext = createCRPCContext<typeof api>({
	api,
	meta,
	convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
})

export const useCRPC = crpcContext.useCRPC
export const CRPCProvider = crpcContext.CRPCProvider
```

## TanStack Query Integration

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCRPC } from "@/lib/convex/crpc"

function Component() {
  const crpc = useCRPC()
  const queryClient = useQueryClient()

  const { data, isPending } = useQuery(crpc.things.list.queryOptions({}))

  const createThing = useMutation(
    crpc.things.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(crpc.things.list.queryFilter({}))
      },
    })
  )

  return (/* ... */)
}
```

## Migration from Standard Convex

| Before                            | After                                         |
| --------------------------------- | --------------------------------------------- |
| `query({ args, handler })`        | `authQuery.input(zod).output(zod).query(...)` |
| `useQuery(api.things.list)`       | `useQuery(crpc.things.list.queryOptions({}))` |
| Manual `getAuthUser` per function | Middleware adds `ctx.user` automatically      |
| `convex/react` hooks              | TanStack Query via cRPC                       |

## Package Exports

```json
{
	"exports": {
		"./convex": "./convex/functions/_generated/api.js",
		"./meta": "./convex/shared/meta.ts",
		"./types": "./convex/shared/types.ts",
		"./react": "./convex/shared/react.ts"
	}
}
```

## Best Practices

- Always add `.output()` to procedures for type inference
- Use `zid()` in output schemas, `z.string()` in shared validators
- Re-export `better-convex/react` through backend package
- Use `.meta({ auth: "required" })` for auth metadata generation
- Invalidate queries after mutations using TanStack Query
