# Convex Functions

Master Convex functions including queries, mutations, actions, and HTTP endpoints with proper validation, error handling, and runtime considerations.

## Documentation Sources

- Primary: https://docs.convex.dev/functions
- Query Functions: https://docs.convex.dev/functions/query-functions
- Mutation Functions: https://docs.convex.dev/functions/mutation-functions
- Actions: https://docs.convex.dev/functions/actions
- HTTP Actions: https://docs.convex.dev/functions/http-actions
- LLM-optimized: https://docs.convex.dev/llms.txt

## Function Types Overview

| Type        | Database Access          | External APIs | Caching       | Use Case              |
| ----------- | ------------------------ | ------------- | ------------- | --------------------- |
| Query       | Read-only                | No            | Yes, reactive | Fetching data         |
| Mutation    | Read/Write               | No            | No            | Modifying data        |
| Action      | Via runQuery/runMutation | Yes           | No            | External integrations |
| HTTP Action | Via runQuery/runMutation | Yes           | No            | Webhooks, APIs        |

## Queries

Queries are reactive, cached, and read-only:

```typescript
import { v } from "convex/values"

import { query } from "./_generated/server"

export const getUser = query({
	args: { userId: v.id("users") },
	returns: v.union(
		v.object({
			_id: v.id("users"),
			_creationTime: v.number(),
			name: v.string(),
			email: v.string(),
		}),
		v.null()
	),
	handler: async (ctx, args) => {
		return await ctx.db.get(args.userId)
	},
})

// Query with index
export const listUserTasks = query({
	args: { userId: v.id("users") },
	returns: v.array(
		v.object({
			_id: v.id("tasks"),
			_creationTime: v.number(),
			title: v.string(),
			completed: v.boolean(),
		})
	),
	handler: async (ctx, args) => {
		return await ctx.db
			.query("tasks")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.order("desc")
			.collect()
	},
})
```

## Mutations

Mutations modify the database and are transactional:

```typescript
import { v } from "convex/values"
import { ConvexError } from "convex/values"

import { mutation } from "./_generated/server"

export const createTask = mutation({
	args: {
		title: v.string(),
		userId: v.id("users"),
	},
	returns: v.id("tasks"),
	handler: async (ctx, args) => {
		// Validate user exists
		const user = await ctx.db.get(args.userId)
		if (!user) {
			throw new ConvexError("User not found")
		}

		return await ctx.db.insert("tasks", {
			title: args.title,
			userId: args.userId,
			completed: false,
			createdAt: Date.now(),
		})
	},
})
```

## Actions

Actions can call external APIs but have no direct database access:

```typescript
"use node"

import { v } from "convex/values"

import { api, internal } from "./_generated/api"
import { action } from "./_generated/server"

export const sendEmail = action({
	args: {
		to: v.string(),
		subject: v.string(),
		body: v.string(),
	},
	returns: v.object({ success: v.boolean() }),
	handler: async (ctx, args) => {
		const response = await fetch("https://api.email.com/send", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(args),
		})
		return { success: response.ok }
	},
})

// Action calling queries and mutations
export const processOrder = action({
	args: { orderId: v.id("orders") },
	returns: v.null(),
	handler: async (ctx, args) => {
		const order = await ctx.runQuery(api.orders.get, { orderId: args.orderId })

		if (!order) {
			throw new Error("Order not found")
		}

		const paymentResult = await processPayment(order)

		await ctx.runMutation(internal.orders.updateStatus, {
			orderId: args.orderId,
			status: paymentResult.success ? "paid" : "failed",
		})

		return null
	},
})
```

## Internal Functions

Use internal functions for sensitive operations:

```typescript
import { v } from "convex/values"

import { internalAction, internalMutation, internalQuery } from "./_generated/server"

// Only callable from other Convex functions
export const _updateUserCredits = internalMutation({
	args: {
		userId: v.id("users"),
		amount: v.number(),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.userId)
		if (!user) return null

		await ctx.db.patch(args.userId, {
			credits: (user.credits || 0) + args.amount,
		})
		return null
	},
})
```

## Scheduling Functions

```typescript
import { v } from "convex/values"

import { internal } from "./_generated/api"
import { internalMutation, mutation } from "./_generated/server"

export const scheduleReminder = mutation({
	args: {
		userId: v.id("users"),
		message: v.string(),
		delayMs: v.number(),
	},
	returns: v.id("_scheduled_functions"),
	handler: async (ctx, args) => {
		return await ctx.scheduler.runAfter(args.delayMs, internal.notifications.sendReminder, {
			userId: args.userId,
			message: args.message,
		})
	},
})
```

## Best Practices

- Always define args and returns validators
- Use queries for read operations (they are cached and reactive)
- Use mutations for write operations (they are transactional)
- Use actions only when calling external APIs
- Use internal functions for sensitive operations
- Add `"use node"` at the top of action files using Node.js APIs
- Handle errors with ConvexError for user-facing messages

## Common Pitfalls

1. **Using actions for database operations** - Use queries/mutations instead
2. **Calling external APIs from queries/mutations** - Use actions
3. **Forgetting to add "use node"** - Required for Node.js APIs in actions
4. **Missing return validators** - Always specify returns
5. **Not using internal functions for sensitive logic** - Protect with internalMutation
