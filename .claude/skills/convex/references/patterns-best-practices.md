# Convex Best Practices

Build production-ready Convex applications by following established patterns for function organization, query optimization, validation, TypeScript usage, and error handling.

## Documentation Sources

- Primary: https://docs.convex.dev/understanding/best-practices/
- Error Handling: https://docs.convex.dev/functions/error-handling
- Write Conflicts: https://docs.convex.dev/error#1
- LLM-optimized: https://docs.convex.dev/llms.txt

## The Zen of Convex

1. **Convex manages the hard parts** - Let Convex handle caching, real-time sync, and consistency
2. **Functions are the API** - Design your functions as your application's interface
3. **Schema is truth** - Define your data model explicitly in schema.ts
4. **TypeScript everywhere** - Leverage end-to-end type safety
5. **Queries are reactive** - Think in terms of subscriptions, not requests

## Function Organization

Organize your Convex functions by domain:

```typescript
// convex/users.ts - User-related functions
export const get = query({
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
```

## Argument and Return Validation

Always define validators for arguments AND return types:

```typescript
export const createTask = mutation({
	args: {
		title: v.string(),
		description: v.optional(v.string()),
		priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
	},
	returns: v.id("tasks"),
	handler: async (ctx, args) => {
		return await ctx.db.insert("tasks", {
			title: args.title,
			description: args.description,
			priority: args.priority,
			completed: false,
			createdAt: Date.now(),
		})
	},
})
```

## Query Patterns

Use indexes instead of filters for efficient queries:

```typescript
// Schema with index
export default defineSchema({
	tasks: defineTable({
		userId: v.id("users"),
		status: v.string(),
		createdAt: v.number(),
	})
		.index("by_user", ["userId"])
		.index("by_user_and_status", ["userId", "status"]),
})

// Query using index
export const getTasksByUser = query({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("tasks")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.order("desc")
			.collect()
	},
})
```

## Error Handling

Use ConvexError for user-facing errors:

```typescript
import { ConvexError } from "convex/values"

export const updateTask = mutation({
	args: {
		taskId: v.id("tasks"),
		title: v.string(),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const task = await ctx.db.get(args.taskId)

		if (!task) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Task not found",
			})
		}

		await ctx.db.patch(args.taskId, { title: args.title })
		return null
	},
})
```

## Avoiding Write Conflicts (OCC)

Make mutations idempotent:

```typescript
export const completeTask = mutation({
	args: { taskId: v.id("tasks") },
	returns: v.null(),
	handler: async (ctx, args) => {
		const task = await ctx.db.get(args.taskId)

		// Early return if already complete (idempotent)
		if (!task || task.status === "completed") {
			return null
		}

		await ctx.db.patch(args.taskId, {
			status: "completed",
			completedAt: Date.now(),
		})
		return null
	},
})

// Patch directly without reading first when possible
export const updateNote = mutation({
	args: { id: v.id("notes"), content: v.string() },
	returns: v.null(),
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, { content: args.content })
		return null
	},
})
```

## TypeScript Best Practices

```typescript
import { Doc, Id } from "./_generated/dataModel"

type UserId = Id<"users">
type User = Doc<"users">

const userScores: Record<Id<"users">, number> = {}
```

## Best Practices Summary

- Always define return validators for functions
- Use indexes for all queries that filter data
- Make mutations idempotent to handle retries gracefully
- Use ConvexError for user-facing error messages
- Organize functions by domain (users.ts, tasks.ts, etc.)
- Use internal functions for sensitive operations
- Leverage TypeScript's Id and Doc types

## Common Pitfalls

1. **Using filter instead of withIndex** - Always define indexes and use withIndex
2. **Missing return validators** - Always specify the returns field
3. **Non-idempotent mutations** - Check current state before updating
4. **Reading before patching unnecessarily** - Patch directly when possible
5. **Not handling null returns** - Document IDs might not exist
