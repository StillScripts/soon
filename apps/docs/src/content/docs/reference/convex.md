---
title: Convex API
description: Standard Convex patterns with Better Auth authentication.
---

## Project Structure

```
packages/backend/convex/
├── functions/            # API endpoints
│   ├── auth.ts           # Better Auth integration
│   ├── auth.config.ts    # Better Auth config provider
│   ├── convex.config.ts  # App config with betterAuth component
│   ├── http.ts           # HTTP router with auth routes
│   ├── schema.ts         # Database schema
│   ├── things.ts         # Example CRUD operations
│   └── _generated/       # Auto-generated (don't edit)
```

## Authentication

This project uses `@convex-dev/better-auth` for authentication with standard Convex functions.

### Auth Helper

Defined in `things.ts` (or extract to a shared helper):

```typescript
import { authComponent } from "./auth"

async function getAuthUserId(ctx) {
	// Check for convex-test mock identity first
	const testIdentity = await ctx.auth.getUserIdentity()
	if (testIdentity) return testIdentity.subject

	// Production: use better-auth
	const user = await authComponent.getAuthUser(ctx)
	if (user) return user._id

	return null
}
```

### Writing Functions

```typescript
import { v } from "convex/values"

import { mutation, query } from "./_generated/server"
import { authComponent } from "./auth"

export const list = query({
	args: { limit: v.optional(v.number()) },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) throw new Error("Not authenticated")

		const q = ctx.db.query("things").withIndex("by_user", (q) => q.eq("userId", userId))

		return args.limit ? await q.take(args.limit) : await q.collect()
	},
})

export const create = mutation({
	args: {
		title: v.string(),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) throw new Error("Not authenticated")

		return ctx.db.insert("things", {
			title: args.title,
			description: args.description,
			userId,
		})
	},
})
```

## Schema Definition

```typescript
// convex/functions/schema.ts
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
import { api } from "@convex/api"
import { useMutation, useQuery } from "convex/react"

// Real-time query - automatically updates when data changes
const things = useQuery(api.things.list, {})

// Mutation
const createThing = useMutation(api.things.create)
await createThing({ title: "New Thing" })
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
