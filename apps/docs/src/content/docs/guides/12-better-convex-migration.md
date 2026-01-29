---
title: "Guide 12: Better Convex Migration"
description: How we migrated from standard Convex to Better Convex with cRPC procedures and TanStack Query
---

# Better Convex Migration

This guide documents how we migrated the project from standard Convex (`convex/react` hooks) to [Better Convex](https://github.com/udecode/better-convex) — a framework that adds tRPC-style procedures, TanStack Query integration, and middleware-based auth to Convex.

## Why We Migrated

| Before                                                          | After                                                                                     |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Manual `authComponent.getAuthUser(ctx)` in every function       | Auth middleware — `ctx.user` guaranteed                                                   |
| `convex/react` hooks (`useQuery`, `useMutation`)                | TanStack Query hooks with Convex real-time sync                                           |
| `v.string()` validators from `convex/values`                    | Zod schemas with `.min()`, `.max()`, `.optional()`                                        |
| `ConvexBetterAuthProvider` from `@convex-dev/better-auth/react` | `ConvexAuthProvider` from `better-convex/auth-client` with unauthorized redirect handling |

## What Changed

### New Dependencies

**Backend (`packages/backend/package.json`):**

- `better-convex@^0.5.3` — cRPC server, middleware, meta codegen
- `convex-helpers@^0.1.111` — utility helpers
- `zod@^4.3.6` — input validation

**Frontend (`apps/web/package.json`):**

- `better-convex@^0.5.3` — React client, `ConvexAuthProvider`, cRPC context
- `@tanstack/react-query@^5.90.20` — query/mutation hooks, cache invalidation
- `@convex-dev/react-query@^0.1.0` — Convex + TanStack Query bridge
- `zod@^4.3.6` — shared validation schemas

### New Files

| File                                      | Purpose                                                     |
| ----------------------------------------- | ----------------------------------------------------------- |
| `packages/backend/convex/crpc.ts`         | cRPC procedure builder with auth middleware                 |
| `packages/backend/convex/types.ts`        | API type exports for the client-side cRPC context           |
| `packages/backend/convex/shared/meta.ts`  | Auto-generated metadata (auth requirements, function types) |
| `packages/backend/convex/shared/types.ts` | `Api`, `ApiInputs`, `ApiOutputs` type helpers               |
| `apps/web/lib/convex/crpc.tsx`            | Client-side cRPC context (`useCRPC`, `CRPCProvider`)        |

### Modified Files

| File                                | What Changed                                                     |
| ----------------------------------- | ---------------------------------------------------------------- |
| `packages/backend/convex/things.ts` | Rewrote all functions as cRPC procedures                         |
| `apps/web/app/providers.tsx`        | Replaced `ConvexBetterAuthProvider` with Better Convex providers |
| `apps/web/app/page.tsx`             | Switched to TanStack Query hooks via `useCRPC()`                 |
| `apps/web/tsconfig.json`            | Added `@convex/*` path alias for generated/shared types          |
| `packages/backend/package.json`     | Added `./meta` and `./types` exports                             |
| `biome.json`                        | Disabled formatter for `convex/shared/**` (auto-generated)       |

---

## Backend Changes

### The cRPC Procedure Builder (`convex/crpc.ts`)

This is the central piece. It initializes Better Convex's `initCRPC` with our data model and creates reusable procedure builders with middleware:

```typescript
import { CRPCError, initCRPC } from "better-convex/server"
import type { DataModel } from "./_generated/dataModel"
import { action, mutation, query } from "./_generated/server"
import { authComponent } from "./auth"

const c = initCRPC.dataModel<DataModel>().create({
	query,
	mutation,
	action,
})

// Auth middleware — throws UNAUTHORIZED if no user
export const authQuery = c.query.meta({ auth: "required" }).use(async ({ ctx, next }) => {
	const user = requireAuth(await authComponent.getAuthUser(ctx))
	return next({
		ctx: { ...ctx, user, userId: user._id as string },
	})
})

export const authMutation = c.mutation.meta({ auth: "required" }).use(async ({ ctx, next }) => {
	const user = requireAuth(await authComponent.getAuthUser(ctx))
	return next({
		ctx: { ...ctx, user, userId: user._id as string },
	})
})
```

Key details:

- `.meta({ auth: "required" })` marks functions for the codegen metadata, which the client uses to know auth is needed.
- `CRPCError` with `code: "UNAUTHORIZED"` provides structured error handling.
- `ctx.user` and `ctx.userId` are added by middleware — no manual auth checks in functions.

### Migrated Functions (`convex/things.ts`)

**Before** — standard Convex with `v` validators and manual auth:

```typescript
export const getThings = query({
	args: {},
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx)
		if (!user) return []
		const userId = user._id as string
		return await ctx.db
			.query("things")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect()
	},
})
```

**After** — cRPC procedure with Zod input and middleware auth:

```typescript
export const list = authQuery
	.input(
		z.object({
			limit: z.number().min(1).max(100).optional(),
		})
	)
	.query(async ({ ctx, input }) => {
		const query = ctx.db.query("things").withIndex("by_user", (q) => q.eq("userId", ctx.userId))

		if (input.limit) {
			return query.take(input.limit)
		}
		return query.collect()
	})
```

All four functions were migrated:

| Old Name      | New Name | Notes                                             |
| ------------- | -------- | ------------------------------------------------- |
| `getThings`   | `list`   | Added optional `limit` input                      |
| `getThing`    | `get`    | Takes `id` as Zod string, casts to `Id<"things">` |
| `createThing` | `create` | Zod validation: `title` min 1, max 200 chars      |
| `deleteThing` | `remove` | Named `remove` to avoid JS reserved word conflict |

### Type Exports (`convex/types.ts`)

The client-side cRPC context needs to know the full API shape including procedure types. This file re-exports the generated API type augmented with the procedure types:

```typescript
export type Api = typeof convexApi & {
	things: {
		list: typeof things.list
		get: typeof things.get
		create: typeof things.create
		remove: typeof things.remove
	}
}
```

### Meta Codegen (`convex/shared/meta.ts`)

Better Convex generates a metadata file that the client uses to determine auth requirements and function types at runtime:

```typescript
export const meta = {
	things: {
		create: { auth: "required", type: "mutation" },
		get: { auth: "required", type: "query" },
		list: { auth: "required", type: "query" },
		remove: { auth: "required", type: "mutation" },
	},
	_http: {},
} as const
```

The `biome.json` was updated to skip formatting on `convex/shared/**` since these files are auto-generated.

---

## Frontend Changes

### cRPC Client Context (`apps/web/lib/convex/crpc.tsx`)

Creates the React context that makes `useCRPC()` available throughout the app:

```typescript
import { api } from "@convex/api"
import { meta } from "@convex/meta"
import type { Api } from "@convex/types"
import { createCRPCContext } from "better-convex/react"

const crpcContext = createCRPCContext<Api>({
	api,
	meta,
	convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
})

export const CRPCProvider = crpcContext.CRPCProvider
export const useCRPC = crpcContext.useCRPC
```

This requires the `@convex/*` path alias added to `tsconfig.json`:

```json
{
	"paths": {
		"@/*": ["./*"],
		"@convex/*": [
			"../../packages/backend/convex/_generated/*",
			"../../packages/backend/convex/shared/*"
		]
	}
}
```

### Providers (`apps/web/app/providers.tsx`)

The provider stack changed significantly:

**Before:**

```
ConvexBetterAuthProvider (from @convex-dev/better-auth/react)
  └── children
```

**After:**

```
ConvexAuthProvider (from better-convex/auth-client)
  └── QueryClientProvider (TanStack Query)
      └── CRPCProvider (cRPC context with convexQueryClient)
          └── children
```

Key details in the new provider setup:

- `ConvexReactClient` is now created inside the component via `useState` (not module-level).
- `QueryClient` uses `staleTime: Infinity` because Convex handles real-time updates via WebSocket — no polling needed.
- `getConvexQueryClientSingleton` bridges Convex's real-time subscriptions into TanStack Query's cache.
- `ConvexAuthProvider` accepts `onMutationUnauthorized` and `onQueryUnauthorized` callbacks that redirect to `/login`.

### Page Component (`apps/web/app/page.tsx`)

**Before** — `convex/react` hooks:

```typescript
import { useMutation, useQuery } from "convex/react"
import { api } from "backend/convex"

const things = useQuery(api.things.getThings)
const createThing = useMutation(api.things.createThing)
```

**After** — TanStack Query via cRPC:

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCRPC } from "@/lib/convex/crpc"

const crpc = useCRPC()
const queryClient = useQueryClient()

const { data, isPending, error } = useQuery(crpc.things.list.queryOptions({}))

const createThing = useMutation(
	crpc.things.create.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries(crpc.things.list.queryFilter({}))
		},
	})
)
```

Notable changes in the component:

- Loading state uses `isPending` (TanStack Query) instead of checking `=== undefined`.
- Error state is now explicitly handled (`error` from the query result).
- Cache invalidation on mutation success via `queryClient.invalidateQueries()`.
- Delete button gets `disabled={deleteThing.isPending}` to prevent double-clicks.
- The `data` from queries needs a type assertion since the cRPC type inference doesn't fully resolve through `queryOptions`.

---

## Issues and Workarounds

### 1. Type Inference on Query Data

The query data returned via `crpc.things.list.queryOptions({})` does not fully infer the return type. The page component uses an explicit type assertion:

```typescript
const things = data as
	| Array<{
			_id: string
			title: string
			_creationTime: number
			userId: string
	  }>
	| undefined
```

This is a rough edge — ideally the types would flow through without a cast.

### 2. Manual `types.ts` Augmentation

The `convex/types.ts` file manually re-declares the API type with explicit procedure references. This is fragile — adding a new cRPC function requires updating this file. Better Convex may improve this with codegen in the future.

### 3. Zod `Id` Validation

Convex document IDs (`Id<"things">`) don't have a Zod validator. The procedures accept `z.string()` and cast:

```typescript
const thing = await ctx.db.get(input.id as Id<"things">)
```

This loses the type-level safety that `v.id("things")` provided with Convex's native validators. A custom Zod refinement could help here but wasn't added.

### 4. Meta File Maintenance

The `convex/shared/meta.ts` file is described as auto-generated, but the codegen step isn't integrated into the dev workflow yet. If you add new cRPC procedures, you need to regenerate this file or update it manually.

### 5. `ConvexReactClient` Initialization

The client moved from module-level (`const convex = new ConvexReactClient(...)`) to inside the component via `useState`. The `convexUrl` check for the "not configured" fallback now happens after the client is already created, which means a missing URL would throw during `useState` initialization before the guard runs.

### 6. Function Renaming

All function names changed (`getThings` → `list`, `deleteThing` → `remove`, etc.). Any code referencing the old `api.things.getThings` style will break. Since the client was migrated simultaneously this wasn't an issue here, but it's worth noting for larger codebases where incremental migration matters.

---

## Package Export Changes

The backend package now exports additional entry points:

```json
{
	"exports": {
		"./convex": "./convex/_generated/api.js",
		"./meta": "./convex/shared/meta.ts",
		"./types": "./convex/types.ts"
	}
}
```

The web app's `tsconfig.json` uses path aliases instead of the package exports for the generated/shared files, since the TypeScript paths resolve directly to the source files in the monorepo.

---

## Summary

The migration touched 10 files (excluding config/lockfile changes) across 5 commits. The core pattern shift is:

1. **Server:** `query({args, handler})` → `authQuery.input(zod).query(({ctx, input}) => ...)`
2. **Client:** `useQuery(api.things.getThings)` → `useQuery(crpc.things.list.queryOptions({}))`
3. **Auth:** Manual `getAuthUser` per function → middleware adds `ctx.user` automatically
4. **State:** Direct Convex reactivity → Convex WebSocket → TanStack Query cache

The old `convex/react` hooks are no longer used anywhere in the codebase. The migration was done all-at-once rather than incrementally, since the app currently only has one entity (`things`) with four functions.
