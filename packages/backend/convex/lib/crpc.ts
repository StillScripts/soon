import { getAuthUserId } from "kitcn/auth"
import { CRPCError } from "kitcn/server"

import type { ActionCtx, MutationCtx, QueryCtx } from "../functions/generated/server"
import { initCRPC } from "../functions/generated/server"

export type GenericCtx = QueryCtx | MutationCtx | ActionCtx

const c = initCRPC.create()

export const publicQuery = c.query
export const publicMutation = c.mutation
export const publicAction = c.action

export const privateQuery = c.query.internal()
export const privateMutation = c.mutation.internal()
export const privateAction = c.action.internal()

/**
 * Get authenticated user from context.
 * Supports both convex-test (via ctx.auth.getUserIdentity) and production (via kitcn auth).
 */
async function getAuthenticatedUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
	// Check for convex-test mock identity first (enables testing with t.withIdentity())
	const testIdentity = await ctx.auth.getUserIdentity()
	if (testIdentity) {
		return testIdentity.subject
	}

	// Production: use kitcn auth
	return await getAuthUserId(ctx)

	return null
}

// Auth query - supports both convex-test and kitcn auth
export const authQuery = c.query.meta({ auth: "required" }).use(async ({ ctx, next }) => {
	const userId = await getAuthenticatedUserId(ctx)
	if (!userId) {
		throw new CRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" })
	}
	return next({ ctx: { ...ctx, userId } })
})

// Auth mutation - supports both convex-test and kitcn auth
export const authMutation = c.mutation.meta({ auth: "required" }).use(async ({ ctx, next }) => {
	const userId = await getAuthenticatedUserId(ctx)
	if (!userId) {
		throw new CRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" })
	}
	return next({ ctx: { ...ctx, userId } })
})
