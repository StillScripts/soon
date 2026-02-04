"use client"

import { api } from "@convex/api"
import { meta } from "@convex/meta"
import { createCRPCContext } from "backend/react"

/**
 * Creates the CRPC context for Convex API access with TanStack Query integration.
 *
 * This provides type-safe query and mutation hooks with automatic type inference
 * from the backend API definition.
 *
 * @param convexSiteUrl - The Convex site URL (typically from NEXT_PUBLIC_CONVEX_SITE_URL)
 */
export function createApiContext(convexSiteUrl: string) {
	return createCRPCContext<typeof api>({
		api,
		meta,
		convexSiteUrl,
	})
}

/** Type of the API for use in generics */
export type Api = typeof api
