import { cache } from "react"

import { headers } from "next/headers"

import { api } from "@convex/api"
import { meta } from "@convex/meta"
import type { Api } from "@repo/api/context"
import { QueryClient, dehydrate } from "@tanstack/react-query"
// Client component for hydration boundary
import { HydrationBoundary } from "@tanstack/react-query"
import { convexBetterAuth } from "better-convex/auth-nextjs"
import { createServerCRPCProxy, getServerQueryClientOptions } from "better-convex/rsc"

const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL!

/**
 * Server-side Better Auth integration for Convex.
 * Provides authenticated server calls via the caller pattern.
 */
const { createContext, createCaller } = convexBetterAuth<Api>({
	api,
	meta,
	convexSiteUrl,
})

/**
 * Create RSC context with headers from the request.
 * Cached per request to avoid duplicate auth checks.
 */
const createRSCContext = cache(async () => {
	const heads = await headers()
	return createContext({ headers: heads })
})

/**
 * Server-side caller for direct authenticated data fetching.
 * Use for server-side conditionals, redirects, and metadata generation.
 *
 * @example
 * ```tsx
 * // Direct server call (not cached for client)
 * const user = await caller.user.getCurrentUser();
 * if (!user) redirect('/login');
 * ```
 */
export const caller = createCaller(createRSCContext)

/**
 * Server-side CRPC proxy for RSC prefetching.
 * Use with prefetch() for non-blocking data hydration.
 *
 * @example
 * ```tsx
 * prefetch(crpc.things.list.queryOptions({}));
 * ```
 */
export const crpc = createServerCRPCProxy<Api>({ api, meta })

/**
 * Create a QueryClient configured for RSC prefetching.
 * Cached per request to share state across prefetch calls.
 */
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

/**
 * Prefetch a query for client hydration.
 * Non-blocking - data is streamed to client for instant hydration.
 *
 * @example
 * ```tsx
 * export default async function Page() {
 *   prefetch(crpc.things.list.queryOptions({}));
 *   return (
 *     <HydrateClient>
 *       <ThingsList />
 *     </HydrateClient>
 *   );
 * }
 * ```
 */
export function prefetch(queryOptions: {
	queryKey: readonly unknown[]
	meta?: { skipUnauth?: boolean }
}) {
	const queryClient = getQueryClient()
	// Prefetch without awaiting - allows streaming
	void queryClient.prefetchQuery(queryOptions as Parameters<typeof queryClient.prefetchQuery>[0])
}

/**
 * Preload a query and await the result.
 * Use for server-side conditionals like 404 checks or metadata generation.
 *
 * @example
 * ```tsx
 * const thing = await preloadQuery(crpc.things.get.queryOptions({ id }));
 * if (!thing) notFound();
 * ```
 */
export async function preloadQuery<T>(
	queryOptions: { queryKey: readonly unknown[]; meta?: { skipUnauth?: boolean } } & {
		queryFn?: () => Promise<T>
	}
): Promise<T | undefined> {
	const queryClient = getQueryClient()
	return queryClient.fetchQuery(
		queryOptions as Parameters<typeof queryClient.fetchQuery>[0]
	) as Promise<T | undefined>
}

/**
 * HydrateClient component for RSC -> Client hydration.
 * Wraps client components that consume prefetched data.
 *
 * @example
 * ```tsx
 * export default async function Page() {
 *   prefetch(crpc.things.list.queryOptions({}));
 *   return (
 *     <HydrateClient>
 *       <ClientComponent />
 *     </HydrateClient>
 *   );
 * }
 * ```
 */
export async function HydrateClient({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient()
	const dehydratedState = dehydrate(queryClient)

	return <HydrateClientInner dehydratedState={dehydratedState}>{children}</HydrateClientInner>
}

function HydrateClientInner({
	children,
	dehydratedState,
}: {
	children: React.ReactNode
	dehydratedState: ReturnType<typeof dehydrate>
}) {
	return <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
}
