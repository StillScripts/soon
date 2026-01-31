import { CRPCError, initCRPC } from "better-convex/server"

import type { DataModel } from "../functions/_generated/dataModel"
import {
	action,
	internalAction,
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "../functions/_generated/server"
import type { ActionCtx, MutationCtx, QueryCtx } from "../functions/_generated/server"
import { authComponent } from "../functions/auth"

export type GenericCtx = QueryCtx | MutationCtx | ActionCtx

const c = initCRPC.dataModel<DataModel>().create({
	query,
	internalQuery,
	mutation,
	internalMutation,
	action,
	internalAction,
})

export const publicQuery = c.query
export const publicMutation = c.mutation
export const publicAction = c.action

/**
 * Get authenticated user from context.
 * Supports both convex-test (via ctx.auth.getUserIdentity) and production (via better-auth).
 * This allows testing Better Convex functions directly with convex-test's withIdentity().
 */
async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
	// Check for convex-test mock identity first (enables testing with t.withIdentity())
	const testIdentity = await ctx.auth.getUserIdentity()
	if (testIdentity) {
		// In tests, use the identity's subject as userId
		return { _id: testIdentity.subject, isTestUser: true as const }
	}

	// Production: use better-auth
	const user = await authComponent.getAuthUser(ctx)
	if (user) {
		return { ...user, isTestUser: false as const }
	}

	return null
}

// Auth query - supports both convex-test and better-auth
export const authQuery = c.query.meta({ auth: "required" }).use(async ({ ctx, next }) => {
	const user = await getAuthenticatedUser(ctx)
	if (!user) {
		throw new CRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" })
	}
	return next({ ctx: { ...ctx, user, userId: user._id } })
})

// Auth mutation - supports both convex-test and better-auth
export const authMutation = c.mutation.meta({ auth: "required" }).use(async ({ ctx, next }) => {
	const user = await getAuthenticatedUser(ctx)
	if (!user) {
		throw new CRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" })
	}
	return next({ ctx: { ...ctx, user, userId: user._id } })
})
