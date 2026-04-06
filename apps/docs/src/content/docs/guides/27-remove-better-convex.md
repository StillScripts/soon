---
title: "27. Remove Better Convex"
description: Migrating from Better Convex cRPC to standard Convex functions with Better Auth
---

## Why

Better Convex added a cRPC abstraction layer over Convex that included TanStack Query integration, middleware-based auth, and type-safe procedures. While powerful, this introduced multiple abstraction layers:

- `better-convex/server` for cRPC builders
- `better-convex/react` for client context and providers
- `better-convex/rsc` for RSC prefetching
- `better-convex/auth/client` for auth providers
- TanStack Query for data fetching (on top of Convex's built-in reactivity)
- A separate `@repo/api` package for cRPC hooks and context

The goal was to simplify to core Convex packages: standard `query`/`mutation` functions with `useQuery`/`useMutation` from `convex/react`, keeping `@convex-dev/better-auth` for authentication.

## What Changed

### Packages Removed

| Package                   | Purpose                    | Replacement                                |
| ------------------------- | -------------------------- | ------------------------------------------ |
| `better-convex`           | cRPC, providers, RSC       | Standard Convex APIs                       |
| `@tanstack/react-query`   | Data fetching              | `convex/react` hooks (built-in reactivity) |
| `@convex-dev/react-query` | Convex + TanStack bridge   | Not needed                                 |
| `@repo/api`               | cRPC context, hooks, types | Direct Convex API imports                  |

### Packages Kept

| Package                   | Purpose                          |
| ------------------------- | -------------------------------- |
| `@convex-dev/better-auth` | Convex component for Better Auth |
| `better-auth`             | Authentication framework         |
| `convex`                  | Core Convex SDK                  |
| `convex-helpers`          | Utility helpers                  |

### Backend Changes

**Before** (cRPC with middleware):

```typescript
import { authMutation, authQuery } from "../lib/crpc"

export const list = authQuery
	.input(z.object({ limit: z.number().optional() }))
	.output(z.array(thingOutputSchema))
	.query(async ({ ctx, input }) => {
		// ctx.userId provided by middleware
	})
```

**After** (standard Convex):

```typescript
import { v } from "convex/values"

import { query } from "./_generated/server"
import { authComponent } from "./auth"

export const list = query({
	args: { limit: v.optional(v.number()) },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) throw new Error("Not authenticated")
		// Use userId directly
	},
})
```

### Frontend Provider Stack

**Before** (5 nested providers):

```
ThemeProvider
  ConvexAuthProvider (better-convex/auth/client)
    QueryClientProvider (@tanstack/react-query)
      CRPCProvider (custom)
        children
```

**After** (2 providers):

```
ThemeProvider
  ConvexBetterAuthProvider (@convex-dev/better-auth/react)
    children
```

### Frontend Data Fetching

**Before** (TanStack Query via cRPC):

```typescript
const crpc = useCRPC()
const { data: things, isPending } = useQuery(crpc.things.list.queryOptions({}))
const createThing = useMutation(crpc.things.create.mutationOptions({}))
await createThing.mutateAsync({ title: "..." })
```

**After** (standard Convex hooks):

```typescript
import { api } from "@convex/api"
import { useMutation, useQuery } from "convex/react"

const things = useQuery(api.things.list, {})
const createThing = useMutation(api.things.create)
await createThing({ title: "..." })
```

### Files Deleted

- `packages/api/` - Entire package (cRPC context, hooks, types)
- `packages/backend/convex/lib/crpc.ts` - cRPC builder
- `packages/backend/convex/shared/` - Generated API, meta, types, react re-exports
- `packages/backend/convex/functions/generated/` - Better Convex codegen files
- `packages/backend/better-convex.json` - Better Convex config
- `apps/web/lib/convex/crpc.tsx` - Client cRPC context
- `apps/web/lib/convex/rsc.tsx` - RSC prefetching layer

### Schema Update

Updated `imageId` field to accept `null` for existing data:

```typescript
imageId: v.optional(v.union(v.id("_storage"), v.null())),
```

## Key Decisions

1. **Auth helper in functions file**: Rather than creating a separate auth middleware file, the `getAuthUserId` helper lives in `things.ts`. It can be extracted to a shared helper as the codebase grows.

2. **Kept convex-test compatibility**: The auth helper checks `ctx.auth.getUserIdentity()` first (for tests) before falling back to `authComponent.getAuthUser()` (production), preserving all 40 existing tests.

3. **No RSC prefetching**: Convex's built-in WebSocket reactivity provides near-instant updates without the complexity of server-side prefetching. The tradeoff is a brief loading state on initial page load.

4. **Removed @repo/api entirely**: The `Thing` type and API hooks were only used in the web app. With standard Convex hooks, there's no need for a separate API package.

## Troubleshooting: JWKS Private Key Decryption Error

After the migration, you may encounter this error in the Convex logs when trying to create or interact with things:

```
[CONVEX H(GET /api/auth/convex/token)] [ERROR]
BetterAuthError: Failed to decrypt private key.
Make sure the secret currently in use is the same as the one used to encrypt the private key.
```

**Symptom**: The UI shows you as authenticated (session cookies work), but all Convex mutations fail with "Not authenticated." The `/api/auth/convex/token` endpoint returns a 500 error.

**Cause**: The JWKS (JSON Web Key Set) entries stored in the Convex database were encrypted with a previous `BETTER_AUTH_SECRET`. When the secret changes (or if stale keys exist from prior setups), Better Auth cannot decrypt the private keys needed to sign JWTs. Without a valid JWT, `ctx.auth.getUserIdentity()` returns `null` in all Convex functions.

**Fix**: Rotate the JWKS keys to regenerate them with the current secret:

1. Create a temporary file `packages/backend/convex/functions/admin.ts`:

```typescript
import { internalAction } from "./_generated/server"
import { createAuth } from "./auth"

export const rotateKeys = internalAction({
	args: {},
	handler: async (ctx) => {
		const auth = createAuth(ctx as any)
		return await auth.api.rotateKeys()
	},
})
```

2. Push and run:

```bash
cd packages/backend
bunx convex dev --run "admin:rotateKeys" --typecheck=disable
```

3. Delete `admin.ts` after confirming the token endpoint works.

**Prevention**: If you ever change the `BETTER_AUTH_SECRET` environment variable, you must rotate JWKS keys immediately afterward. The secret and the stored keys must always match.

## Related Guides

- [Guide 8: Better Auth Integration](./08-better-auth) - Original Better Auth setup and environment variables
- [Guide 12: Better Convex Migration](./12-better-convex-migration) - Original migration to Better Convex (now reversed)
- [Guide 23: Better Convex RSC](./23-better-convex-rsc) - RSC integration (now removed)
