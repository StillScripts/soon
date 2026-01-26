/**
 * CRPC - Convex RPC
 * tRPC-style fluent API for Convex functions
 */

import { CRPCError, initCRPC } from "better-convex/server"
import type { DataModel } from "./_generated/dataModel"
import type { MutationCtx, QueryCtx } from "./_generated/server"
import { action, mutation, query } from "./_generated/server"
import { authComponent } from "./auth"

// =============================================================================
// Context Types
// =============================================================================

type AuthUser = NonNullable<
	Awaited<ReturnType<typeof authComponent.getAuthUser>>
>

/** Context with required auth - user/userId guaranteed */
export type AuthQueryCtx = QueryCtx & {
	user: AuthUser
	userId: string
}

export type AuthMutationCtx = MutationCtx & {
	user: AuthUser
	userId: string
}

// =============================================================================
// Initialize cRPC
// =============================================================================

const c = initCRPC.dataModel<DataModel>().create({
	query,
	mutation,
	action,
})

// =============================================================================
// Middleware
// =============================================================================

function requireAuth<T>(user: T | null): T {
	if (!user) {
		throw new CRPCError({
			code: "UNAUTHORIZED",
			message: "Not authenticated",
		})
	}
	return user
}

// =============================================================================
// Query Procedures
// =============================================================================

/** Public query - no auth required */
export const publicQuery = c.query

/** Auth query - ctx.user required */
export const authQuery = c.query
	.meta({ auth: "required" })
	.use(async ({ ctx, next }) => {
		const user = requireAuth(await authComponent.getAuthUser(ctx))

		return next({
			ctx: {
				...ctx,
				user,
				userId: user._id as string,
			},
		})
	})

// =============================================================================
// Mutation Procedures
// =============================================================================

/** Public mutation - no auth required */
export const publicMutation = c.mutation

/** Auth mutation - ctx.user required */
export const authMutation = c.mutation
	.meta({ auth: "required" })
	.use(async ({ ctx, next }) => {
		const user = requireAuth(await authComponent.getAuthUser(ctx))

		return next({
			ctx: {
				...ctx,
				user,
				userId: user._id as string,
			},
		})
	})

// =============================================================================
// Action Procedures
// =============================================================================

/** Public action - no auth required */
export const publicAction = c.action

/** Auth action - ctx.user required */
export const authAction = c.action
	.meta({ auth: "required" })
	.use(async ({ ctx, next }) => {
		const user = requireAuth(await authComponent.getAuthUser(ctx))

		return next({
			ctx: {
				...ctx,
				user,
				userId: user._id as string,
			},
		})
	})
