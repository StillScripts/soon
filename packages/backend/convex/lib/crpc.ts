import { CRPCError, initCRPC } from "better-convex/server"

import type { DataModel } from "../functions/_generated/dataModel"
import { action, mutation, query } from "../functions/_generated/server"
import { authComponent } from "../functions/auth"

// cRPC initialization

const c = initCRPC.dataModel<DataModel>().create({
	query,
	mutation,
	action,
})

// Procedures

export const publicQuery = c.query
export const publicMutation = c.mutation
export const publicAction = c.action

// Auth query - inline auth check to preserve context types
export const authQuery = c.query.meta({ auth: "required" }).use(async ({ ctx, next }) => {
	const user = await authComponent.getAuthUser(ctx)
	if (!user) {
		throw new CRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" })
	}
	return next({ ctx: { ...ctx, user, userId: user._id } })
})

// Auth mutation - inline auth check to preserve context types
export const authMutation = c.mutation.meta({ auth: "required" }).use(async ({ ctx, next }) => {
	const user = await authComponent.getAuthUser(ctx)
	if (!user) {
		throw new CRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" })
	}
	return next({ ctx: { ...ctx, user, userId: user._id } })
})

// Note: authAction is not exported because actions don't have ctx.db,
// which is required by authComponent.getAuthUser(). For authenticated actions,
// use ctx.runQuery to call an internal query that checks auth, or use
// HTTP actions with the HTTP adapter via createAuth(ctx).
