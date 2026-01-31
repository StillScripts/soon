# Convex Migrations

Evolve your Convex database schema safely with patterns for adding fields, backfilling data, removing deprecated fields, and maintaining zero-downtime deployments.

## Documentation Sources

- Primary: https://docs.convex.dev/database/schemas
- Schema Overview: https://docs.convex.dev/database
- Migration Patterns: https://stack.convex.dev/migrate-data-postgres-to-convex
- LLM-optimized: https://docs.convex.dev/llms.txt

## Migration Philosophy

Convex handles schema evolution differently than traditional databases:

- No explicit migration files or commands
- Schema changes deploy instantly with `npx convex dev`
- Existing data is not automatically transformed
- Use optional fields and backfill mutations for safe migrations

## Adding New Fields

```typescript
// Step 1: Add optional field to schema
export default defineSchema({
	users: defineTable({
		name: v.string(),
		email: v.string(),
		avatarUrl: v.optional(v.string()), // New field - start as optional
	}),
})

// Step 2: Backfill existing documents
export const backfillAvatarUrl = internalMutation({
	args: { cursor: v.optional(v.string()) },
	handler: async (ctx, args) => {
		const result = await ctx.db
			.query("users")
			.paginate({ numItems: 100, cursor: args.cursor ?? null })

		for (const user of result.page) {
			if (user.avatarUrl === undefined) {
				await ctx.db.patch(user._id, {
					avatarUrl: generateDefaultAvatar(user.name),
				})
			}
		}

		if (!result.isDone) {
			await ctx.scheduler.runAfter(0, internal.migrations.backfillAvatarUrl, {
				cursor: result.continueCursor,
			})
		}

		return null
	},
})

// Step 3: After backfill completes, make field required
export default defineSchema({
	users: defineTable({
		name: v.string(),
		email: v.string(),
		avatarUrl: v.string(), // Now required
	}),
})
```

## Removing Fields

```typescript
// Step 1: Stop using the field in queries and mutations

// Step 2: Remove field from schema

// Step 3: Optionally clean up existing data
export const removeDeprecatedField = internalMutation({
	args: { cursor: v.optional(v.string()) },
	returns: v.null(),
	handler: async (ctx, args) => {
		const result = await ctx.db
			.query("posts")
			.paginate({ numItems: 100, cursor: args.cursor ?? null })

		for (const post of result.page) {
			const { legacyField, ...rest } = post as typeof post & { legacyField?: string }
			if (legacyField !== undefined) {
				await ctx.db.replace(post._id, rest)
			}
		}

		if (!result.isDone) {
			await ctx.scheduler.runAfter(0, internal.migrations.removeDeprecatedField, {
				cursor: result.continueCursor,
			})
		}

		return null
	},
})
```

## Changing Field Types

```typescript
// Example: Change from string to number for a "priority" field

// Step 1: Add new field with new type
export default defineSchema({
	tasks: defineTable({
		title: v.string(),
		priority: v.string(), // Old: "low", "medium", "high"
		priorityLevel: v.optional(v.number()), // New: 1, 2, 3
	}),
})

// Step 2: Backfill with type conversion
export const migratePriorityToNumber = internalMutation({
	args: { cursor: v.optional(v.string()) },
	handler: async (ctx, args) => {
		const priorityMap: Record<string, number> = {
			low: 1,
			medium: 2,
			high: 3,
		}

		const result = await ctx.db
			.query("tasks")
			.paginate({ numItems: 100, cursor: args.cursor ?? null })

		for (const task of result.page) {
			if (task.priorityLevel === undefined) {
				await ctx.db.patch(task._id, {
					priorityLevel: priorityMap[task.priority] ?? 1,
				})
			}
		}

		if (!result.isDone) {
			await ctx.scheduler.runAfter(0, internal.migrations.migratePriorityToNumber, {
				cursor: result.continueCursor,
			})
		}

		return null
	},
})

// Step 3: After backfill, update schema
export default defineSchema({
	tasks: defineTable({
		title: v.string(),
		priorityLevel: v.number(),
	}),
})
```

## Best Practices

- Always start with optional fields when adding new data
- Backfill data in batches to avoid timeouts
- Test migrations on development before production
- Keep track of completed migrations to avoid re-running
- Update code to handle both old and new data during transition
- Remove deprecated fields only after all code stops using them

## Common Pitfalls

1. **Making new fields required immediately** - Breaks existing documents
2. **Not handling undefined values** - Causes runtime errors
3. **Large batch sizes** - Causes function timeouts
4. **Forgetting to update indexes** - Queries fail or perform poorly
5. **Running migrations without tracking** - May run multiple times
