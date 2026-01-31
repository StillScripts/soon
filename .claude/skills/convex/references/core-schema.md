# Convex Schema Validator

Define and validate database schemas in Convex with proper typing, index configuration, optional fields, unions, and strategies for schema migrations.

## Documentation Sources

- Primary: https://docs.convex.dev/database/schemas
- Indexes: https://docs.convex.dev/database/indexes
- Data Types: https://docs.convex.dev/database/types
- LLM-optimized: https://docs.convex.dev/llms.txt

## Basic Schema Definition

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
	users: defineTable({
		name: v.string(),
		email: v.string(),
		avatarUrl: v.optional(v.string()),
		createdAt: v.number(),
	}),

	tasks: defineTable({
		title: v.string(),
		description: v.optional(v.string()),
		completed: v.boolean(),
		userId: v.id("users"),
		priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
	}),
})
```

## Validator Types

| Validator        | TypeScript Type  | Example             |
| ---------------- | ---------------- | ------------------- |
| `v.string()`     | `string`         | `"hello"`           |
| `v.number()`     | `number`         | `42`, `3.14`        |
| `v.boolean()`    | `boolean`        | `true`, `false`     |
| `v.null()`       | `null`           | `null`              |
| `v.int64()`      | `bigint`         | `9007199254740993n` |
| `v.bytes()`      | `ArrayBuffer`    | Binary data         |
| `v.id("table")`  | `Id<"table">`    | Document reference  |
| `v.array(v)`     | `T[]`            | `[1, 2, 3]`         |
| `v.object({})`   | `{ ... }`        | `{ name: "..." }`   |
| `v.optional(v)`  | `T \| undefined` | Optional field      |
| `v.union(...)`   | `T1 \| T2`       | Multiple types      |
| `v.literal(x)`   | `"x"`            | Exact value         |
| `v.any()`        | `any`            | Any value           |
| `v.record(k, v)` | `Record<K, V>`   | Dynamic keys        |

## Index Configuration

```typescript
export default defineSchema({
	messages: defineTable({
		channelId: v.id("channels"),
		authorId: v.id("users"),
		content: v.string(),
		sentAt: v.number(),
	})
		.index("by_channel", ["channelId"])
		.index("by_channel_and_author", ["channelId", "authorId"])
		.index("by_channel_and_time", ["channelId", "sentAt"]),

	// Full-text search index
	articles: defineTable({
		title: v.string(),
		body: v.string(),
		category: v.string(),
	}).searchIndex("search_content", {
		searchField: "body",
		filterFields: ["category"],
	}),
})
```

## Complex Types

```typescript
export default defineSchema({
	// Nested objects
	profiles: defineTable({
		userId: v.id("users"),
		settings: v.object({
			theme: v.union(v.literal("light"), v.literal("dark")),
			notifications: v.object({
				email: v.boolean(),
				push: v.boolean(),
			}),
		}),
	}),

	// Arrays of objects
	orders: defineTable({
		customerId: v.id("users"),
		items: v.array(
			v.object({
				productId: v.id("products"),
				quantity: v.number(),
				price: v.number(),
			})
		),
		status: v.union(
			v.literal("pending"),
			v.literal("processing"),
			v.literal("shipped"),
			v.literal("delivered")
		),
	}),

	// Record type for dynamic keys
	analytics: defineTable({
		date: v.string(),
		metrics: v.record(v.string(), v.number()),
	}),
})
```

## Optional vs Nullable Fields

```typescript
export default defineSchema({
	items: defineTable({
		// Optional: field may not exist
		description: v.optional(v.string()),

		// Nullable: field exists but can be null
		deletedAt: v.union(v.number(), v.null()),

		// Optional and nullable
		notes: v.optional(v.union(v.string(), v.null())),
	}),
})
```

## Index Naming Convention

Always include all indexed fields in the index name:

```typescript
export default defineSchema({
	posts: defineTable({
		authorId: v.id("users"),
		categoryId: v.id("categories"),
		publishedAt: v.number(),
		status: v.string(),
	})
		.index("by_author", ["authorId"])
		.index("by_author_and_category", ["authorId", "categoryId"])
		.index("by_category_and_status", ["categoryId", "status"])
		.index("by_status_and_published", ["status", "publishedAt"]),
})
```

## Using Schema Types in Functions

```typescript
import { Doc, Id } from "./_generated/dataModel"

type UserId = Id<"users">
type User = Doc<"users">
```

## Best Practices

- Always define explicit schemas rather than relying on inference
- Use descriptive index names that include all indexed fields
- Start with optional fields when adding new columns
- Use discriminated unions for polymorphic data
- Plan index strategy based on query patterns

## Common Pitfalls

1. **Missing indexes for queries** - Every withIndex needs a corresponding schema index
2. **Wrong index field order** - Fields must be queried in order defined
3. **Using v.any() excessively** - Lose type safety benefits
4. **Not making new fields optional** - Breaks existing data
5. **Forgetting system fields** - \_id and \_creationTime are automatic
