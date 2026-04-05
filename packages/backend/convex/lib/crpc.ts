import { CRPCError } from "kitcn/server"

import { authComponent } from "../functions/auth"
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
 * This allows testing cRPC functions directly with convex-test's withIdentity().
 */
async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
	// Check for convex-test mock identity first (enables testing with t.withIdentity())
	const testIdentity = await ctx.auth.getUserIdentity()
	if (testIdentity) {
		// In tests, use the identity's subject as userId
		return { _id: testIdentity.subject, isTestUser: true as const }
	}

	// Production: use kitcn auth
	const user = await authComponent.getAuthUser(ctx)
	if (user) {
		return { ...user, isTestUser: false as const }
	}

	return null
}

// Auth query - supports both convex-test and kitcn auth
export const authQuery = c.query.meta({ auth: "required" }).use(async ({ ctx, next }) => {
	const user = await getAuthenticatedUser(ctx)
	if (!user) {
		throw new CRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" })
	}
	return next({ ctx: { ...ctx, user, userId: user._id } })
})

// Auth mutation - supports both convex-test and kitcn auth
export const authMutation = c.mutation.meta({ auth: "required" }).use(async ({ ctx, next }) => {
	const user = await getAuthenticatedUser(ctx)
	if (!user) {
		throw new CRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" })
	}
	return next({ ctx: { ...ctx, user, userId: user._id } })
})
