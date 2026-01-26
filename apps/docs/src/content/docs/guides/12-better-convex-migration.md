---
title: Better Convex Migration Plan
description: Migration plan for adopting the Better Convex framework for tRPC-style APIs with TanStack Query integration
---

# Better Convex Migration Plan

This document outlines the migration plan from standard Convex to [Better Convex](https://github.com/udecode/better-convex) - a comprehensive framework that integrates tRPC-style APIs, TanStack Query, and enhanced database patterns.

## Executive Summary

**Current State:** Standard Convex with `convex/react` hooks (`useQuery`, `useMutation`) and Better Auth integration.

**Target State:** Better Convex with cRPC procedures, TanStack Query native hooks, and unified type-safe patterns.

**Key Benefits:**
- tRPC-style procedure builder with `.input()`, `.use()`, and middleware
- Native TanStack Query integration (real-time subscriptions flow into query cache)
- Type inference from schema through procedures to client
- RSC prefetching and server-side calling for Next.js

## What is Better Convex?

Better Convex is a production-ready framework built on top of Convex that combines:

| Layer | Feature | Description |
|-------|---------|-------------|
| **Server** | cRPC | tRPC-style procedure builder with middleware support |
| **Database** | Triggers | Automatic side effects on insert/update/delete |
| **Database** | Aggregates | O(log n) counts, sums, leaderboards |
| **Client** | React | TanStack Query integration with real-time sync |
| **Client** | Next.js | RSC prefetching, hydration, server caller |
| **Auth** | Better Auth | Lifecycle hooks, session management, guards |

### Code Comparison

**Current (Standard Convex):**

```typescript
// Server: convex/things.ts
import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { authComponent } from "./auth"

export const getThings = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx)
    if (!user) return []
    return await ctx.db
      .query("things")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()
  },
})

export const createThing = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx)
    if (!user) throw new Error("Not authenticated")
    return await ctx.db.insert("things", {
      title: args.title,
      userId: user._id,
    })
  },
})
```

```typescript
// Client: app/page.tsx
import { useMutation, useQuery } from "convex/react"
import { api } from "backend/convex"

function ThingsManager() {
  const things = useQuery(api.things.getThings)
  const createThing = useMutation(api.things.createThing)
  // ...
}
```

**Target (Better Convex):**

```typescript
// Server: convex/things.ts
import { z } from "zod"
import { authQuery, authMutation } from "./crpc"

export const list = authQuery
  .input(z.object({ limit: z.number().optional() }))
  .query(async ({ ctx, input }) => {
    return ctx.db
      .query("things")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .take(input.limit ?? 50)
  })

export const create = authMutation
  .input(z.object({ title: z.string().min(1) }))
  .mutation(async ({ ctx, input }) => {
    return ctx.db.insert("things", {
      title: input.title,
      userId: ctx.user._id,
    })
  })
```

```typescript
// Client: app/page.tsx
import { useQuery, useMutation } from "@tanstack/react-query"
import { useCRPC } from "@/lib/crpc"

function ThingsManager() {
  const crpc = useCRPC()
  const { data: things } = useQuery(crpc.things.list.queryOptions({ limit: 50 }))
  const createThing = useMutation(crpc.things.create.mutationOptions())
  // ...
}
```

## Current State Analysis

### Packages in Use

| Package | Version | Purpose |
|---------|---------|---------|
| `convex` | ^1.31.6 | Core Convex SDK |
| `convex/react` | included | React hooks for queries/mutations |
| `@convex-dev/better-auth` | ^0.10.10 | Better Auth integration |
| `better-auth` | 1.4.9 | Authentication library |

### Current Architecture

```
apps/web/
├── app/
│   ├── providers.tsx      # ConvexBetterAuthProvider
│   ├── page.tsx           # Uses useQuery/useMutation from convex/react
│   └── lib/auth-client.ts # Better Auth client

packages/backend/
└── convex/
    ├── schema.ts          # Standard defineSchema
    ├── auth.ts            # Better Auth setup
    ├── http.ts            # HTTP router for auth
    └── things.ts          # Standard query/mutation exports
```

### Current Data Flow

1. Client uses `useQuery(api.things.getThings)` from `convex/react`
2. Server receives request, runs handler with `ctx.db`
3. Auth checked manually via `authComponent.getAuthUser(ctx)`
4. Results returned directly (no caching layer)

## Migration Phases

### Phase 1: Install Dependencies

Add Better Convex packages:

```bash
cd packages/backend
bun add better-convex zod

cd apps/web
bun add better-convex @tanstack/react-query
```

**Package Structure:**
- `better-convex/server` - cRPC builder, middleware, server caller
- `better-convex/react` - React client, providers, auth hooks
- `better-convex/rsc` - RSC prefetching and hydration (optional)

### Phase 2: Set Up cRPC Procedure Builder

Create the cRPC configuration:

```typescript
// convex/crpc.ts
import { createCRPC } from "better-convex/server"
import { z } from "zod"
import { authComponent } from "./auth"

// Base procedure with context
const crpc = createCRPC()

// Public procedure (no auth required)
export const publicQuery = crpc.query
export const publicMutation = crpc.mutation

// Authenticated procedure with auth middleware
export const authQuery = crpc
  .use(async ({ ctx, next }) => {
    const user = await authComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Not authenticated")
    }
    return next({ ctx: { ...ctx, user } })
  })
  .query

export const authMutation = crpc
  .use(async ({ ctx, next }) => {
    const user = await authComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Not authenticated")
    }
    return next({ ctx: { ...ctx, user } })
  })
  .mutation
```

### Phase 3: Migrate Server Functions

Migrate functions one at a time (Better Convex supports incremental adoption):

**Before:**
```typescript
// convex/things.ts
export const getThings = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx)
    if (!user) return []
    return await ctx.db
      .query("things")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()
  },
})
```

**After:**
```typescript
// convex/things.ts
import { z } from "zod"
import { authQuery, publicQuery } from "./crpc"

export const list = authQuery
  .input(z.object({
    limit: z.number().min(1).max(100).optional().default(50),
  }))
  .query(async ({ ctx, input }) => {
    // User is guaranteed to exist via middleware
    return ctx.db
      .query("things")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .take(input.limit)
  })
```

### Phase 4: Set Up Client Provider

Update the React providers to include TanStack Query:

```typescript
// apps/web/app/providers.tsx
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ConvexReactClient } from "convex/react"
import { CRPCProvider } from "better-convex/react"
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react"
import { useState, type ReactNode } from "react"
import { authClient } from "../lib/auth-client"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 minute
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <ConvexBetterAuthProvider client={convex} authClient={authClient}>
        <CRPCProvider convex={convex}>
          {children}
        </CRPCProvider>
      </ConvexBetterAuthProvider>
    </QueryClientProvider>
  )
}
```

### Phase 5: Migrate Client Components

Update components to use TanStack Query hooks:

**Before:**
```typescript
import { useMutation, useQuery } from "convex/react"
import { api } from "backend/convex"

function ThingsManager() {
  const things = useQuery(api.things.getThings)
  const createThing = useMutation(api.things.createThing)

  const handleCreate = async () => {
    await createThing({ title: "New Thing" })
  }
  // ...
}
```

**After:**
```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useCRPC } from "@/lib/crpc"

function ThingsManager() {
  const crpc = useCRPC()
  const queryClient = useQueryClient()

  const { data: things, isLoading } = useQuery(
    crpc.things.list.queryOptions({ limit: 50 })
  )

  const createThing = useMutation({
    ...crpc.things.create.mutationOptions(),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["things", "list"] })
    },
  })

  const handleCreate = () => {
    createThing.mutate({ title: "New Thing" })
  }
  // ...
}
```

### Phase 6: Add RSC Support (Optional)

For Next.js RSC prefetching:

```typescript
// app/things/page.tsx
import { createServerCaller } from "better-convex/rsc"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/query-client"
import { ThingsManager } from "./things-manager"

export default async function ThingsPage() {
  const queryClient = getQueryClient()
  const serverCaller = createServerCaller()

  // Prefetch on server
  await queryClient.prefetchQuery({
    queryKey: ["things", "list"],
    queryFn: () => serverCaller.things.list({ limit: 50 }),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ThingsManager />
    </HydrationBoundary>
  )
}
```

## Migration Checklist

### Phase 1: Dependencies
- [ ] Install `better-convex` in backend package
- [ ] Install `better-convex` and `@tanstack/react-query` in web app
- [ ] Add `zod` for input validation

### Phase 2: Server Setup
- [ ] Create `convex/crpc.ts` with procedure builders
- [ ] Set up auth middleware
- [ ] Create type exports for client

### Phase 3: Migrate Functions (per function)
- [ ] Convert to cRPC procedure syntax
- [ ] Add Zod input validation
- [ ] Remove manual auth checks (use middleware)
- [ ] Add return type validators
- [ ] Test function works

### Phase 4: Client Setup
- [ ] Add QueryClientProvider
- [ ] Add CRPCProvider
- [ ] Create crpc client hook

### Phase 5: Migrate Components (per component)
- [ ] Replace `useQuery` import
- [ ] Replace `useMutation` import
- [ ] Update query/mutation calls to use queryOptions/mutationOptions
- [ ] Add cache invalidation where needed
- [ ] Handle loading/error states with TanStack Query patterns

### Phase 6: Optional Enhancements
- [ ] Add RSC prefetching
- [ ] Add triggers for side effects
- [ ] Add aggregates for counts/sums

## Rollback Strategy

Better Convex supports incremental adoption, so rollback is straightforward:

1. Keep old `query`/`mutation` exports alongside new cRPC procedures
2. Both can coexist in the same file
3. Migrate client components one at a time
4. If issues arise, revert specific components to `convex/react` hooks

## Testing Strategy

1. **Unit Tests:** Test cRPC procedures in isolation with mocked context
2. **Integration Tests:** Test full flow from client to server
3. **Type Tests:** Verify type inference works end-to-end
4. **Performance Tests:** Compare query performance before/after

## Resources

- [Better Convex Documentation](https://www.better-convex.com/docs)
- [Better Convex GitHub](https://github.com/udecode/better-convex)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Zod Documentation](https://zod.dev)

## Decision Points

Before implementation, decide on:

| Decision | Options | Recommendation |
|----------|---------|----------------|
| **Adoption Approach** | Top-down (all at once) vs Bottom-up (incremental) | Bottom-up - migrate one function at a time |
| **SSR/RSC** | Client-only vs Server prefetching | Add RSC prefetching for key pages |
| **Triggers** | None vs On insert/update/delete | Add as needed for specific use cases |
| **Aggregates** | None vs Counts/sums | Add if performance becomes an issue |
