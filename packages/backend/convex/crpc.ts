import { CRPCError, initCRPC } from "better-convex/server"

import type { DataModel } from "./_generated/dataModel"
import type { MutationCtx, QueryCtx } from "./_generated/server"
import { action, mutation, query } from "./_generated/server"
import { authComponent } from "./auth"

// Context types

type AuthUser = NonNullable<Awaited<ReturnType<typeof authComponent.getAuthUser>>>

interface AuthFields {
	user: AuthUser
	userId: string
}

export type AuthQueryCtx = QueryCtx & AuthFields
export type AuthMutationCtx = MutationCtx & AuthFields

// cRPC initialization

const c = initCRPC.dataModel<DataModel>().create({
	query,
	mutation,
	action,
})

// Auth middleware

const withAuth: Parameters<(typeof c)["query"]["use"]>[0] = async ({ ctx, next }) => {
	const user = await authComponent.getAuthUser(ctx)

	if (!user) {
		throw new CRPCError({
			code: "UNAUTHORIZED",
			message: "Not authenticated",
		})
	}

	return next({
		ctx: {
			...ctx,
			user,
			userId: user._id as string,
		},
	})
}

// Procedures

export const publicQuery = c.query
export const publicMutation = c.mutation
export const publicAction = c.action

export const authQuery = c.query.meta({ auth: "required" }).use(withAuth)
export const authMutation = c.mutation.meta({ auth: "required" }).use(withAuth)
export const authAction = c.action.meta({ auth: "required" }).use(withAuth)
