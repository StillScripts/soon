import type { Metadata } from "next"

import { HomePage } from "@/components/home-page"
import { HydrateClient, crpc, prefetch } from "@/lib/convex/rsc"

export const metadata: Metadata = {
	title: "Things Manager",
	description: "Create and manage your things with Convex, Better Auth, and TanStack Query",
}

/**
 * Home page with RSC prefetching.
 *
 * Data is prefetched on the server and streamed to the client for instant hydration.
 * The client component handles auth state and renders either login or the Things manager.
 */
export default async function Home() {
	// Prefetch things list for authenticated users
	// Uses skipUnauth to safely handle unauthenticated users without errors
	prefetch(crpc.things.list.staticQueryOptions({}, { skipUnauth: true }))

	return (
		<HydrateClient>
			<HomePage />
		</HydrateClient>
	)
}
