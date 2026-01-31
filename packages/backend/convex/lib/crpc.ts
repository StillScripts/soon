import { CRPCError, initCRPC } from "better-convex/server"

import {
	action,
	internalAction,
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "../functions/_generated/server"
import type { ActionCtx, MutationCtx, QueryCtx } from "../functions/_generated/server"
import type { DataModel } from "../functions/_generated/dataModel"
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
