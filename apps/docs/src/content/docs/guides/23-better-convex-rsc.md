---
title: Better Convex RSC Integration
description: Adding React Server Components support with Better Convex for server-side prefetching and hydration.
---

## What We Did

Added React Server Components (RSC) integration with Better Convex to enable server-side data prefetching. Data is now prefetched on the server and hydrated to the client for instant display, improving initial page load performance.

## Why RSC Prefetching

**Key benefits:**

- **Faster Initial Load**: Data is fetched on the server during SSR, eliminating client-side loading states
- **Non-Blocking Prefetch**: Data streams to the client without blocking the page render
- **Seamless Hydration**: TanStack Query cache is pre-populated, so client components have data immediately
- **Auth-Aware**: Uses `skipUnauth` to safely handle unauthenticated users without errors

**Better Convex RSC Patterns:**

1. `prefetch()` - Fire-and-forget, non-blocking data fetching hydrated to the client
2. `caller` - Direct server calls detached from query client, not cached or hydrated
3. `preloadQuery()` - Awaited fetching that returns data on the server

The `prefetch()` pattern is preferred for most cases as it enables non-blocking streaming while still hydrating data to the client.

## Implementation Details

### New File: `apps/web/lib/convex/rsc.tsx`

This file contains all server-side RSC utilities:

```tsx
import { cache } from "react"
import { headers } from "next/headers"
import { convexBetterAuth } from "better-convex/auth-nextjs"
import { createServerCRPCProxy, getServerQueryClientOptions } from "better-convex/rsc"

// Server-side Better Auth integration
const { createContext, createCaller } = convexBetterAuth<Api>({
  api,
  meta,
  convexSiteUrl,
})

// Cached context creation (per-request)
const createRSCContext = cache(async () => {
  const heads = await headers()
  return createContext({ headers: heads })
})

// Direct server caller for auth checks/redirects
export const caller = createCaller(createRSCContext)

// CRPC proxy for prefetching
export const crpc = createServerCRPCProxy<Api>({ api, meta })

// Cached QueryClient for RSC
export const getQueryClient = cache(() => {
  return new QueryClient({
    defaultOptions: getServerQueryClientOptions({
      getToken: async () => {
        const ctx = await createRSCContext()
        return ctx.token ?? undefined
      },
      convexSiteUrl,
    }),
  })
})

// Non-blocking prefetch
export function prefetch(queryOptions: {...}) {
  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(queryOptions)
}

// Awaited preload for server-side conditionals
export async function preloadQuery<T>(queryOptions: {...}): Promise<T | undefined> {
  const queryClient = getQueryClient()
  return queryClient.fetchQuery(queryOptions)
}

// Hydration wrapper component
export async function HydrateClient({ children }) {
  const queryClient = getQueryClient()
  const dehydratedState = dehydrate(queryClient)
  return <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
}
```

### Updated: `apps/web/app/page.tsx`

The page now uses RSC prefetching:

```tsx
import { HomePage } from "@/components/home-page"
import { HydrateClient, crpc, prefetch } from "@/lib/convex/rsc"

export default async function Home() {
	// Prefetch things list for authenticated users
	prefetch(crpc.things.list.staticQueryOptions({}, { skipUnauth: true }))

	return (
		<HydrateClient>
			<HomePage />
		</HydrateClient>
	)
}
```

### Component Refactoring

Split the monolithic `home-page.tsx` into focused client components:

```
apps/web/components/
├── home-page.tsx        # Auth state wrapper
├── things-manager.tsx   # CRUD operations for Things
└── user-header.tsx      # User info and sign out
```

**`things-manager.tsx`** - Extracted reusable upload helper:

```tsx
async function uploadFileToStorage(file: File, getUploadUrl: () => Promise<string>) {
	const uploadUrl = await getUploadUrl()
	const result = await fetch(uploadUrl, {
		method: "POST",
		headers: { "Content-Type": file.type },
		body: file,
	})
	const { storageId } = await result.json()
	return storageId as string
}
```

## Key Dependencies

No new dependencies - uses existing better-convex RSC exports:

- `better-convex/auth-nextjs` - Server-side auth integration
- `better-convex/rsc` - RSC utilities (`createServerCRPCProxy`, `getServerQueryClientOptions`)
- `@tanstack/react-query` - `HydrationBoundary`, `dehydrate`, `QueryClient`

## Integration with Existing Code

### How Hydration Works

1. **Server**: `prefetch()` calls populate the QueryClient cache
2. **Server**: `HydrateClient` serializes the cache via `dehydrate()`
3. **Client**: `HydrationBoundary` restores data on the client
4. **Client**: Components using `useQuery` receive instant data, then subscribe for real-time updates

### Query Key Matching

Server and client proxies generate identical query keys, ensuring prefetched data is discovered correctly by client components. The `@repo/api` hooks use the same `crpc.things.list.queryOptions({})` pattern, so the cache keys match.

## Context for AI

When working with RSC prefetching:

- **Use `prefetch()` for most cases** - Non-blocking, streams data to client
- **Use `preloadQuery()` only when needed** - For 404 checks, metadata generation, or server-side conditionals
- **Always wrap client components with `HydrateClient`** - Required for hydration to work
- **Use `skipUnauth: true` for auth-protected queries** - Prevents errors when user is not logged in
- **Use `staticQueryOptions` instead of `queryOptions`** in RSC - Static version doesn't depend on React hooks
- **Don't render prefetched data in RSC** - Let client components own the data to avoid desync after revalidation

## Outcomes

### Before

- Client-side only data fetching
- Loading states visible on initial page load
- All data fetched after React hydration

### After

- Server-side prefetching with streaming
- Instant data display on page load (when authenticated)
- Seamless hydration with TanStack Query

## Testing/Verification

```bash
# Run type checking
turbo check-types --filter=web

# Run linting
turbo lint --filter=web

# Run tests
turbo test --filter=web

# Start dev server to test
turbo dev --filter=web
```

Expected results:

- Page loads with data pre-populated (for authenticated users)
- No loading flicker on initial render
- Real-time updates continue to work after hydration

## Related Documentation

- [Better Convex RSC Docs](https://www.better-convex.com/docs/nextjs/rsc)
- [Better Convex Migration](./12-better-convex-migration)
- [Shared API Package](./22-api-package)
- [TanStack Query SSR Guide](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
