---
title: "kitcn Migration"
description: "Migrating from better-convex to kitcn - the complete Convex framework"
---

Better Convex has been rebranded and expanded into **kitcn** - a complete framework for Convex with a CLI, Drizzle-style ORM, integrated auth, migrations, rate limiting, and more.

## What Changed

| Before                              | After                              |
| ----------------------------------- | ---------------------------------- |
| `better-convex` package             | `kitcn` package                    |
| `better-convex dev` CLI             | `kitcn dev` CLI                    |
| `better-convex/server`              | `kitcn/server`                     |
| `better-convex/react`               | `kitcn/react`                      |
| `better-convex/rsc`                 | `kitcn/rsc`                        |
| `better-convex/auth/client`         | `kitcn/auth/client`                |
| `better-convex/auth/nextjs`         | `kitcn/auth/nextjs`                |
| `defineSchema` from `convex/server` | `defineSchema` from `kitcn/orm`    |
| `defineTable` + `v.string()`        | `convexTable` + `text().notNull()` |

## Schema Migration

The schema was migrated from Convex's native validators to kitcn's Drizzle-style ORM:

**Before:**

```typescript
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
	things: defineTable({
		title: v.string(),
		description: v.optional(v.string()),
		imageId: v.optional(v.id("_storage")),
		userId: v.string(),
	}).index("by_user", ["userId"]),
})
```

**After:**

```typescript
import { convexTable, defineSchema, id, index, text } from "kitcn/orm"

export const thingsTable = convexTable(
	"things",
	{
		title: text().notNull(),
		description: text(),
		imageId: id("_storage"),
		userId: text().notNull(),
	},
	(t) => [index("by_user").on(t.userId)]
)

export const tables = { things: thingsTable }
export default defineSchema(tables, { strict: false })
```

Key differences:

- Fields are nullable by default in kitcn ORM (use `.notNull()` for required)
- Indexes are defined with a builder pattern: `index("name").on(t.field)`
- Tables are exported individually for reuse with ORM mutations
- `strict: false` allows queries without explicit index anchoring

## cRPC Builder Changes

The cRPC builder now uses the generated `initCRPC` instead of manual wiring:

**Before:**

```typescript
import { CRPCError, initCRPC } from "better-convex/server"
import { action, mutation, query, ... } from "../functions/_generated/server"

const c = initCRPC.dataModel<DataModel>().create({
  query, internalQuery, mutation, internalMutation, action, internalAction,
})
```

**After:**

```typescript
import { CRPCError } from "kitcn/server"

import { initCRPC } from "../functions/generated/server"

const c = initCRPC.create()
```

The generated `server.ts` in `functions/generated/` already has the DataModel wired in, so no manual function builder passing is needed.

## Auth Integration

The auth component (`@convex-dev/better-auth`) is still used for the Convex component registration since kitcn's CLI-scaffolded auth patterns require a fresh setup. The key auth imports remained on `@convex-dev/better-auth` for:

- `convex.config.ts` - Convex component registration
- `auth.ts` - `createClient` and `convex` plugin
- `auth.config.ts` - `getAuthConfigProvider`

Client-side auth imports moved to kitcn:

- `kitcn/auth/client` for `ConvexAuthProvider` and `convexClient` (re-exports from `@convex-dev/better-auth`)
- `kitcn/auth/nextjs` for `convexBetterAuth` (RSC server caller factory)

## Frontend Changes

### auth-server.ts Consolidation

The auth server setup was consolidated using `convexBetterAuth` from `kitcn/auth/nextjs`, which returns `{ createContext, createCaller, handler }`. The RSC file (`rsc.tsx`) now imports from `auth-server.ts` instead of duplicating the setup.

### Provider Imports

All provider imports updated from `better-convex/*` to `kitcn/*`:

- `ConvexAuthProvider` from `kitcn/auth/client`
- `ConvexReactClient`, `getConvexQueryClientSingleton`, etc. from `kitcn/react`

## What Didn't Change

- **Procedures** (`things.ts`): Still use `ctx.db` directly - the ORM query methods are additive
- **Tests** (`things.test.ts`): No changes needed - `convex-test` works independently
- **API hooks** (`packages/api`): TanStack Query + cRPC patterns are identical
- **Validators** (`@repo/validators`): Shared Zod schemas are unchanged

## Dependencies

| Package                   | Before | After                       |
| ------------------------- | ------ | --------------------------- |
| `better-convex`           | 0.11.0 | Removed                     |
| `kitcn`                   | -      | 0.12.8                      |
| `@convex-dev/better-auth` | 0.11.4 | 0.11.4 (kept for component) |
| `@convex-dev/react-query` | 0.1.0  | Removed (kitcn integrates)  |

## kitcn CLI

The development workflow now uses the kitcn CLI:

```bash
# Start backend dev server
kitcn dev

# Generate code
kitcn codegen

# Analyze bundle
kitcn analyze

# Manage environment
kitcn env push --prod
```

## References

- kitcn docs: https://www.better-convex.com/docs
- kitcn CLI: https://www.better-convex.com/docs/cli
- Migration from Convex: https://www.better-convex.com/docs/migrations/convex
