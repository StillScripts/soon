---
title: Convex API
description: Patterns for writing Convex queries, mutations, and schema.
---

## Project Structure

```
packages/backend/convex/
├── _generated/           # Auto-generated (don't edit)
│   ├── api.d.ts
│   ├── api.js
│   ├── dataModel.d.ts
│   └── server.ts
├── schema.ts             # Database schema
└── things.ts             # Queries and mutations
```

## Schema Definition

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  things: defineTable({
    title: v.string(),
  }),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
  }).index("by_email", ["email"]),
})
```

### Validators

| Validator | Description |
|-----------|-------------|
| `v.string()` | String value |
| `v.number()` | Number value |
| `v.boolean()` | Boolean value |
| `v.null()` | Null value |
| `v.id("tableName")` | Document ID reference |
| `v.array(v.string())` | Array of strings |
| `v.object({ key: v.string() })` | Object with shape |
| `v.optional(v.string())` | Optional string |
| `v.union(v.literal("a"), v.literal("b"))` | Union type |
| `v.any()` | Any value (avoid if possible) |

## Queries

```typescript
// convex/things.ts
import { query } from "./_generated/server"
import { v } from "convex/values"

// Query without arguments
export const getThings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("things").collect()
  },
})

// Query with arguments
export const getThing = query({
  args: {
    id: v.id("things"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// Query with filter
export const getThingsByTitle = query({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("things")
      .filter((q) => q.eq(q.field("title"), args.title))
      .collect()
  },
})
```

### Using Indexes (Preferred)

```typescript
// Define index in schema
defineTable({
  title: v.string(),
  status: v.string(),
}).index("by_status", ["status"])

// Use index in query
export const getByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("things")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect()
  },
})
```

## Mutations

```typescript
import { mutation } from "./_generated/server"
import { v } from "convex/values"

// Create
export const createThing = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("things", { title: args.title })
  },
})

// Update
export const updateThing = mutation({
  args: {
    id: v.id("things"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { title: args.title })
  },
})

// Delete
export const deleteThing = mutation({
  args: {
    id: v.id("things"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

// Replace entire document
export const replaceThing = mutation({
  args: {
    id: v.id("things"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.replace(args.id, { title: args.title })
  },
})
```

## Frontend Usage

### Import Pattern

```typescript
import { api } from "backend/convex"
import { useQuery, useMutation } from "convex/react"
```

### useQuery

```typescript
// Returns data or undefined (loading)
const things = useQuery(api.things.getThings)

// With arguments
const thing = useQuery(api.things.getThing, { id: thingId })

// Skip query conditionally
const thing = useQuery(
  thingId ? api.things.getThing : "skip",
  thingId ? { id: thingId } : "skip"
)
```

### useMutation

```typescript
const createThing = useMutation(api.things.createThing)

// Call the mutation
await createThing({ title: "New Thing" })
```

### Complete Example

```tsx
"use client"

import { api } from "backend/convex"
import { useMutation, useQuery } from "convex/react"
import { FormEvent, useState } from "react"

export default function ThingsPage() {
  const things = useQuery(api.things.getThings)
  const createThing = useMutation(api.things.createThing)
  const [title, setTitle] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await createThing({ title: title.trim() })
    setTitle("")
  }

  if (things === undefined) {
    return <p>Loading...</p>
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Create</button>
      </form>

      <ul>
        {things.map((thing) => (
          <li key={thing._id}>{thing.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

## Database Operations

| Operation | Method | Description |
|-----------|--------|-------------|
| Get by ID | `ctx.db.get(id)` | Get single document |
| Insert | `ctx.db.insert(table, doc)` | Create new document |
| Patch | `ctx.db.patch(id, fields)` | Update specific fields |
| Replace | `ctx.db.replace(id, doc)` | Replace entire document |
| Delete | `ctx.db.delete(id)` | Delete document |

## Query Methods

| Method | Description |
|--------|-------------|
| `.collect()` | Return all matching documents as array |
| `.first()` | Return first matching document or null |
| `.unique()` | Return exactly one document (throws if 0 or >1) |
| `.take(n)` | Return first n documents |
| `.order("asc")` / `.order("desc")` | Order by `_creationTime` |

## Type Safety

```typescript
// IDs are typed
import { Id } from "./_generated/dataModel"

type ThingId = Id<"things">

// Use in functions
export const getThing = query({
  args: { id: v.id("things") },
  handler: async (ctx, args) => {
    // args.id is typed as Id<"things">
    return await ctx.db.get(args.id)
  },
})
```

## Development Commands

```bash
# Start Convex dev server
cd packages/backend
bunx convex dev

# Open dashboard
bunx convex dashboard

# Push schema changes
bunx convex deploy
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `CONVEX_DEPLOYMENT` | Deployment identifier |
| `CONVEX_URL` | Convex API endpoint |
| `NEXT_PUBLIC_CONVEX_URL` | Client-side API endpoint |
