---
title: Convex Backend
description: Adding Convex as the real-time serverless backend with end-to-end Next.js integration.
---

## What We Did

1. Added Convex to `packages/backend` as the application's backend-as-a-service solution
2. Created a Claude Code skill (`/convex`) for AI-assisted Convex development
3. Integrated Convex with the Next.js web app with a working "Things" CRUD example

## Why Convex

**Convex provides a complete backend solution** that aligns perfectly with our Bun-first, TypeScript-native approach.

**Key reasons:**

- **Real-time by default**: Live queries automatically update when data changes
- **TypeScript-first**: End-to-end type safety from database to client
- **Serverless**: No infrastructure to manage, scales automatically
- **Developer experience**: Hot reload, local dev server, built-in debugging
- **React integration**: First-class hooks (`useQuery`, `useMutation`)

**Alternatives considered:**

- **Supabase**: Excellent, but Convex's real-time model is simpler
- **Firebase**: Good real-time, but TypeScript support is weaker
- **tRPC + Prisma**: Type-safe, but more complex setup and no built-in real-time

## Project Structure

```
packages/backend/
├── convex/
│   ├── _generated/          # Auto-generated (don't edit)
│   │   ├── api.d.ts
│   │   ├── api.js
│   │   ├── dataModel.d.ts
│   │   └── server.ts
│   ├── schema.ts            # Database schema
│   ├── things.ts            # Things queries/mutations
│   └── tsconfig.json
├── .env.local               # Convex deployment URL (gitignored)
├── .env.example             # Template for .env.local
└── package.json

apps/web/
├── app/
│   ├── providers.tsx        # ConvexProvider setup
│   ├── layout.tsx           # Wraps app with Providers
│   └── page.tsx             # Things CRUD UI
├── .env.local               # Copy of backend .env.local + NEXT_PUBLIC_*
└── .env.example
```

## Backend Implementation

### Schema (`convex/schema.ts`)

```typescript
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
	things: defineTable({
		title: v.string(),
	}),
})
```

### Queries and Mutations (`convex/things.ts`)

```typescript
import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getThings = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("things").collect()
	},
})

export const getThing = query({
	args: {
		id: v.id("things"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id)
	},
})

export const createThing = mutation({
	args: {
		title: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("things", { title: args.title })
	},
})
```

### Package Exports (`package.json`)

The backend package exports the Convex API for the web app:

```json
{
	"name": "backend",
	"exports": {
		"./convex": "./convex/_generated/api.js"
	},
	"dependencies": {
		"convex": "^1.31.6"
	}
}
```

## Frontend Integration

### Convex Provider (`apps/web/app/providers.tsx`)

```tsx
"use client"

import { ConvexProvider, ConvexReactClient } from "convex/react"
import { ReactNode } from "react"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

export function Providers({ children }: { children: ReactNode }) {
	if (!convexUrl) {
		return (
			<div style={{ padding: "2rem", fontFamily: "system-ui" }}>
				<h1>Convex Not Configured</h1>
				<p>
					Missing <code>NEXT_PUBLIC_CONVEX_URL</code> environment variable.
				</p>
				{/* Setup instructions... */}
			</div>
		)
	}

	const convex = new ConvexReactClient(convexUrl)
	return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
```

### Layout Integration (`apps/web/app/layout.tsx`)

```tsx
import { Providers } from "./providers"

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
```

### Using Convex in Components (`apps/web/app/page.tsx`)

```tsx
"use client"

import { useMutation, useQuery } from "convex/react"
import { api } from "backend/convex"
import { FormEvent, useState } from "react"

export default function Home() {
	const things = useQuery(api.things.getThings)
	const createThing = useMutation(api.things.createThing)
	const [title, setTitle] = useState("")

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		if (!title.trim()) return
		await createThing({ title: title.trim() })
		setTitle("")
	}

	return (
		<main>
			<h1>Things Manager</h1>

			{/* Create Form */}
			<form onSubmit={handleSubmit}>
				<input
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Enter thing title..."
				/>
				<button type="submit">Create</button>
			</form>

			{/* List Things */}
			{things === undefined ? (
				<p>Loading...</p>
			) : things.length === 0 ? (
				<p>No things yet.</p>
			) : (
				<ul>
					{things.map((thing) => (
						<li key={thing._id}>
							{thing.title}
							<span>{new Date(thing._creationTime).toLocaleDateString()}</span>
						</li>
					))}
				</ul>
			)}
		</main>
	)
}
```

## Environment Variables

### Turborepo Configuration (`turbo.json`)

Declare Convex env vars for proper cache invalidation:

```json
{
	"globalEnv": ["NEXT_PUBLIC_CONVEX_URL", "CONVEX_DEPLOYMENT"]
}
```

### Backend `.env.local`

Generated by `bunx convex dev`:

```bash
CONVEX_DEPLOYMENT=dev:your-deployment-name
CONVEX_URL=https://your-deployment-name.convex.cloud
```

### Web App `.env.local`

Copy from backend and add `NEXT_PUBLIC_` prefix:

```bash
CONVEX_DEPLOYMENT=dev:your-deployment-name
CONVEX_URL=https://your-deployment-name.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud
```

**Important**: Both files must point to the same Convex deployment.

## Claude Code Skill

A comprehensive `/convex` skill was added to `.claude/skills/convex/SKILL.md` providing:

- **Function syntax**: Queries, mutations, actions with validators
- **Schema design**: Tables, indexes, validators
- **TypeScript patterns**: `Id<"tableName">`, strict typing
- **Best practices**: Use indexes over `.filter()`, include return validators
- **Complete examples**: Real-world chat app implementation

**Usage**: Invoke `/convex` when writing Convex code for AI-assisted development.

## Development Workflow

### Initial Setup

```bash
# 1. Start Convex dev server (generates .env.local)
cd packages/backend
bunx convex dev

# 2. Copy env to web app
cp .env.local ../../apps/web/.env.local

# 3. Add NEXT_PUBLIC prefix to web app's .env.local
echo "NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud" >> ../../apps/web/.env.local

# 4. Start all apps
cd ../..
bun dev
```

### Ongoing Development

Run both servers in parallel (Turborepo handles this):

```bash
bun dev
# Runs: web#dev, docs#dev, backend#dev (convex dev)
```

Or run individually:

```bash
turbo dev --filter=backend   # Convex dev server
turbo dev --filter=web       # Next.js on port 3000
```

## Key Patterns

### Importing the API

```typescript
// In web app components
import { api } from "backend/convex"

// Use with hooks
const data = useQuery(api.things.getThings)
const mutate = useMutation(api.things.createThing)
```

### Reactive Queries

Convex queries are **reactive** - the UI automatically updates when data changes:

```typescript
const things = useQuery(api.things.getThings)
// No manual refetching needed - updates automatically
```

### Type Safety

Full end-to-end type inference:

```typescript
// Backend defines the shape
export const createThing = mutation({
	args: { title: v.string() },
	handler: async (ctx, args) => {
		/* ... */
	},
})

// Frontend gets type checking
createThing({ title: "Hello" }) // ✓
createThing({ name: "Hello" }) // ✗ Type error
```

## Testing/Verification

```bash
# Verify Convex is running
cd packages/backend && bunx convex dev
# Should show: "Convex functions ready!"

# Verify web app connects
turbo dev --filter=web
# Open http://localhost:3000
# Should show Things Manager UI

# Test the integration
# 1. Enter a title and click Create
# 2. New thing appears instantly (real-time)
# 3. Open Convex dashboard to see data
```

## Troubleshooting

| Issue                                      | Solution                                                  |
| ------------------------------------------ | --------------------------------------------------------- |
| "No address provided to ConvexReactClient" | Missing `NEXT_PUBLIC_CONVEX_URL` in `apps/web/.env.local` |
| "Could not find public function"           | Different deployments - sync `.env.local` files           |
| Functions not updating                     | Restart `bunx convex dev`                                 |
| Types not found                            | Run `bun install` at repo root                            |

## Related Documentation

- [Convex Documentation](https://docs.convex.dev)
- [Convex React Integration](https://docs.convex.dev/client/react)
- [Convex TypeScript Guide](https://docs.convex.dev/typescript)
- `/convex` skill in `.claude/skills/convex/SKILL.md`
