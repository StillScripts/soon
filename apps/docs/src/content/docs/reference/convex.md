---
title: Convex API
description: Better Convex patterns with cRPC, auth middleware, and type-safe queries.
---

## Project Structure

```
packages/backend/convex/
├── functions/            # API endpoints
│   ├── auth.ts           # Better Auth integration
│   └── things.ts         # Example CRUD operations
├── lib/
│   └── crpc.ts           # cRPC builder with auth middleware
├── schema.ts             # Database schema
├── auth.config.ts        # Better Auth config
└── _generated/           # Auto-generated (don't edit)
```

## Better Convex (cRPC)

This project uses **Better Convex** for type-safe cRPC procedures.

### cRPC Builder

Defined in `lib/crpc.ts`:

```typescript
import { CRPCError, initCRPC } from "better-convex/server"

const c = initCRPC.dataModel<DataModel>().create({
	query,
	mutation,
	action,
	internalQuery,
	internalMutation,
	internalAction,
})

export const publicQuery = c.query
export const publicMutation = c.mutation

// Auth middleware - adds user and userId to context
export const authQuery = c.query.meta({ auth: "required" }).use(async ({ ctx, next }) => {
	const user = await authComponent.getAuthUser(ctx)
	if (!user) {
		throw new CRPCError({ code: "UNAUTHORIZED" })
	}
	return next({ ctx: { ...ctx, user, userId: user._id } })
})

export const authMutation = c.mutation.meta({ auth: "required" }).use(async ({ ctx, next }) => {
	const user = await authComponent.getAuthUser(ctx)
	if (!user) {
		throw new CRPCError({ code: "UNAUTHORIZED" })
	}
	return next({ ctx: { ...ctx, user, userId: user._id } })
})
```

### Writing Functions

```typescript
import { zid } from "convex-helpers/server/zod4"
import { z } from "zod"

import { authMutation, authQuery } from "../lib/crpc"

// Output schema with typed IDs
const thingOutputSchema = z.object({
	_id: zid("things"),
	_creationTime: z.number(),
	title: z.string(),
	userId: z.string(),
})

// Query with input/output validation
export const list = authQuery
	.input(z.object({ limit: z.number().optional() }))
	.output(z.array(thingOutputSchema))
	.query(async ({ ctx, input }) => {
		return ctx.db
			.query("things")
			.withIndex("by_user", (q) => q.eq("userId", ctx.userId))
			.take(input.limit ?? 100)
	})

// Mutation with input validation
export const create = authMutation
	.input(z.object({ title: z.string().min(1).max(100) }))
	.output(zid("things"))
	.mutation(async ({ ctx, input }) => {
		return ctx.db.insert("things", {
			title: input.title,
			userId: ctx.userId,
		})
	})
```

## Schema Definition

```typescript
// convex/schema.ts
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

### Validators

| Validator         | Description           |
| ----------------- | --------------------- |
| `v.string()`      | String value          |
| `v.number()`      | Number value          |
| `v.boolean()`     | Boolean value         |
| `v.id("table")`   | Document ID reference |
| `v.optional(...)` | Optional field        |
| `v.array(...)`    | Array of values       |
| `v.object({...})` | Nested object         |

## Shared Validators

Input validation lives in `@repo/validators` (shared with frontend):

```typescript
// packages/validators/src/things.ts
import { z } from "zod"

export const createThingSchema = z.object({
	title: z.string().min(1).max(100),
	description: z.string().max(500).optional(),
})

// Use z.string() for IDs (not zid - that's server-only)
export const getThingSchema = z.object({
	id: z.string(),
})
```

Use in Convex functions:

```typescript
import { createThingSchema } from "@repo/validators/things"

export const create = authMutation.input(createThingSchema).mutation(async ({ ctx, input }) => {
	// input is typed from the schema
})
```

## Database Operations

| Operation | Method                      | Description         |
| --------- | --------------------------- | ------------------- |
| Get by ID | `ctx.db.get(id)`            | Get single document |
| Insert    | `ctx.db.insert(table, doc)` | Create document     |
| Patch     | `ctx.db.patch(id, fields)`  | Update fields       |
| Delete    | `ctx.db.delete(id)`         | Delete document     |

### Query Methods

| Method                | Description          |
| --------------------- | -------------------- |
| `.collect()`          | Return all as array  |
| `.first()`            | Return first or null |
| `.take(n)`            | Return first n       |
| `.withIndex(name, q)` | Use index for query  |

## Frontend Usage

```tsx
"use client"
import { api } from "@repo/backend/convex"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useConvexQuery, useConvexMutation } from "@repo/backend/react"

// With TanStack Query (recommended)
const { data: things } = useConvexQuery(api.functions.things.list, { limit: 10 })
const createThing = useConvexMutation(api.functions.things.create)

// Or with Convex hooks
const things = useQuery(api.functions.things.list, { limit: 10 })
const create = useMutation(api.functions.things.create)
```

## Development Commands

```bash
cd packages/backend

# Start dev server
bunx convex dev

# Open dashboard
bunx convex dashboard

# Deploy to production
bunx convex deploy
```
