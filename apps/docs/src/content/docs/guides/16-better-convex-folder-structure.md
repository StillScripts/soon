---
title: "Guide 16: Better Convex Folder Structure"
description: How we migrated to Better Convex's recommended folder structure and fixed critical type inference issues
---

# Better Convex Folder Structure Migration

This guide documents the migration to Better Convex's recommended folder structure and the resolution of type inference issues that emerged in Bun-based monorepos.

## Why This Migration Was Needed

The [original Better Convex migration](/guides/12-better-convex-migration/) got cRPC working but used a flat folder structure. This caused issues with:

1. **Mixed concerns**: Deployed functions, server helpers, and client exports all lived in `convex/`
2. **Missing type inference**: Procedures lacked `.output()` declarations, breaking static API type generation
3. **Bun module resolution**: TypeScript couldn't resolve unique symbols across symlinked `node_modules`

## The Better Convex Folder Structure

Better Convex recommends separating concerns into three directories:

```
packages/backend/
├── convex.json                    # Convex configuration
├── convex/
│   ├── functions/                 # Deployed to Convex runtime
│   │   ├── _generated/            # Auto-generated types
│   │   ├── schema.ts
│   │   ├── things.ts
│   │   ├── auth.ts
│   │   ├── http.ts
│   │   ├── auth.config.ts
│   │   └── convex.config.ts
│   ├── lib/                       # Server helpers (NOT deployed)
│   │   └── crpc.ts
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

## Configuration: `convex.json`

The `convex.json` file tells Convex where to find functions and enables static API generation:

```json
{
	"functions": "convex/functions",
	"codegen": {
		"staticApi": true,
		"staticDataModel": true
	}
}
```

**Key settings:**

- `functions`: Points to the deployed functions directory
- `staticApi`: Generates strongly-typed API based on `.output()` schemas
- `staticDataModel`: Generates DataModel types for the cRPC builder

## The cRPC Builder (`lib/crpc.ts`)

The cRPC builder lives in `lib/` because it's a server-side helper that shouldn't be deployed:

```typescript
import { CRPCError, initCRPC } from "better-convex/server"

import type { DataModel } from "../functions/_generated/dataModel"
import {
	action,
	internalAction,
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "../functions/_generated/server"
import { authComponent } from "../functions/auth"

const c = initCRPC.dataModel<DataModel>().create({
	query,
	internalQuery,
	mutation,
	internalMutation,
	action,
	internalAction,
})

export const publicQuery = c.query
export const publicMutation = c.mutation
export const publicAction = c.action

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

## Critical Fix: `.output()` with `zid()`

The original implementation was missing `.output()` declarations on procedures. Without these, the static API generator cannot infer return types, breaking type safety on the client.

**Before (broken):**

```typescript
export const list = authQuery.input(listThingsSchema).query(async ({ ctx, input }) => {
	// Return type not captured in static API
	return ctx.db.query("things").collect()
})
```

**After (correct):**

```typescript
import { zid } from "convex-helpers/server/zod4"

const thingOutputSchema = z.object({
	_id: zid("things"),
	_creationTime: z.number(),
	title: z.string(),
	description: z.string().optional(),
	imageId: zid("_storage").optional(),
	userId: z.string(),
	imageUrl: z.string().nullable(),
})

export const list = authQuery
	.input(listThingsSchema)
	.output(z.array(thingOutputSchema))
	.query(async ({ ctx, input }) => {
		// Return type is now part of the static API
		const things = await ctx.db.query("things").collect()
		return things.map(thing => ({
			...thing,
			imageUrl: thing.imageId ? await ctx.storage.getUrl(thing.imageId) : null,
		}))
	})

export const create = authMutation
	.input(createThingSchema)
	.output(zid("things"))
	.mutation(async ({ ctx, input }) => {
		return ctx.db.insert("things", { ... })
	})
```

**Key details:**

- Use `zid("tableName")` from `convex-helpers/server/zod4` for Convex ID types
- Every procedure that returns data should have `.output()`
- Mutations that don't return values can omit `.output()` (do NOT use `z.void()`)

## Critical Fix: Bun Symlink Type Resolution

Bun uses symlinks in `node_modules`, which breaks TypeScript's ability to resolve unique symbols across packages. This manifests as:

```
The inferred type of 'useCRPC' references an inaccessible 'unique symbol' type
```

### Solution 1: Re-export through backend package

Create `convex/shared/react.ts`:

```typescript
export { createCRPCContext } from "better-convex/react"
export type { ConvexQueryClient } from "better-convex/react"
```

Add to `packages/backend/package.json`:

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

Import in `apps/web/lib/convex/crpc.tsx`:

```typescript
import { createCRPCContext } from "backend/react"

// NOT: import { createCRPCContext } from "better-convex/react"
```

### Solution 2: Add direct dependency

Add `@tanstack/query-core` as a direct dependency in the web app:

```bash
cd apps/web
bun add @tanstack/query-core
```

### Solution 3: Disable declaration maps

In `apps/web/tsconfig.json`:

```json
{
	"compilerOptions": {
		"strictFunctionTypes": false,
		"declaration": false,
		"declarationMap": false
	}
}
```

### Why all three?

The symlink issue requires addressing at multiple levels:

1. **Re-export** ensures both packages resolve the same module instance
2. **Direct dependency** ensures TypeScript can find the symbol definitions
3. **Disable declarations** prevents TypeScript from trying to emit `.d.ts` files that reference inaccessible symbols

## Updated TypeScript Paths

The web app's `tsconfig.json` paths must point to the new structure:

```json
{
	"paths": {
		"@/*": ["./*"],
		"@convex/*": [
			"../../packages/backend/convex/functions/_generated/*",
			"../../packages/backend/convex/shared/*"
		],
		"backend/react": ["../../packages/backend/convex/shared/react.ts"]
	}
}
```

## Client-Side cRPC Context

The client now imports from `backend/react`:

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
export const useCRPCClient = crpcContext.useCRPCClient
export const CRPCProvider = crpcContext.CRPCProvider
```

## Migration Steps

1. **Create `convex.json`** with functions path and codegen settings
2. **Create directories**: `convex/functions/`, `convex/lib/`, `convex/shared/`
3. **Move files**:
   - Deployed functions → `functions/`
   - cRPC builder → `lib/`
   - Keep shared types in `shared/`
4. **Update imports** in all files to use relative paths to new locations
5. **Add `.output()` declarations** to all procedures
6. **Use `zid()`** for Convex ID types in output schemas
7. **Create `shared/react.ts`** re-export
8. **Update `package.json` exports**
9. **Update web app `tsconfig.json`** paths and compiler options
10. **Add `@tanstack/query-core`** to web app dependencies
11. **Run `bun run dev`** in backend to regenerate types
12. **Verify with `turbo check-types`**

## Verification

```bash
# Regenerate types
cd packages/backend && bun run dev

# Type check
turbo check-types --filter=backend
turbo check-types --filter=web

# Test the app
turbo dev --filter=web
```

## Summary

The folder structure migration addressed three categories of issues:

| Issue                  | Solution                                             |
| ---------------------- | ---------------------------------------------------- |
| Mixed concerns         | Separate `functions/`, `lib/`, `shared/` directories |
| Missing type inference | Add `.output()` with `zid()` to all procedures       |
| Bun symlink resolution | Re-export, direct dependency, disable declarations   |

This structure follows Better Convex's official recommendations and ensures full type safety from server to client.
