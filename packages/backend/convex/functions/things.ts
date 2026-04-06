import { v } from "convex/values"

import type { Id } from "./_generated/dataModel"
import { mutation, query } from "./_generated/server"
import { authComponent } from "./auth"

async function getAuthUserId(ctx: {
	auth: { getUserIdentity: () => Promise<{ subject: string } | null> }
}) {
	// Check for convex-test mock identity first (enables testing with t.withIdentity())
	const testIdentity = await ctx.auth.getUserIdentity()
	if (testIdentity) {
		return testIdentity.subject
	}

	try {
		// Cast needed because getAuthUser expects full QueryCtx but we only declare the auth subset
		const user = await authComponent.getAuthUser(ctx as any)
		if (user) {
			return user._id
		}
	} catch (error) {
		// oxlint-disable-next-line no-console
		console.error("Error getting auth user:", error)
		return null
	}

	return null
}

export const generateUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) throw new Error("Not authenticated")
		return await ctx.storage.generateUploadUrl()
	},
})

export const list = query({
	args: {
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) return []

		const q = ctx.db.query("things").withIndex("by_user", (q) => q.eq("userId", userId))

		const things = args.limit ? await q.take(args.limit) : await q.collect()

		return Promise.all(
			things.map(async (thing) => ({
				...thing,
				imageUrl: thing.imageId ? await ctx.storage.getUrl(thing.imageId) : null,
			}))
		)
	},
})

export const get = query({
	args: {
		id: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) return null

		const thing = await ctx.db.get(args.id as Id<"things">)
		if (!thing || thing.userId !== userId) {
			return null
		}
		return {
			...thing,
			imageUrl: thing.imageId ? await ctx.storage.getUrl(thing.imageId) : null,
		}
	},
})

export const create = mutation({
	args: {
		title: v.string(),
		description: v.optional(v.string()),
		imageId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) throw new Error("Not authenticated")

		if (args.title.length === 0 || args.title.length > 200) {
			throw new Error("Title must be between 1 and 200 characters")
		}

		return ctx.db.insert("things", {
			title: args.title,
			description: args.description,
			imageId: args.imageId as Id<"_storage"> | undefined,
			userId,
		})
	},
})

export const update = mutation({
	args: {
		id: v.string(),
		title: v.optional(v.string()),
		description: v.optional(v.union(v.string(), v.null())),
		imageId: v.optional(v.union(v.string(), v.null())),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) throw new Error("Not authenticated")

		const thing = await ctx.db.get(args.id as Id<"things">)
		if (!thing || thing.userId !== userId) {
			throw new Error("Not found or not authorized")
		}

		const updates: Partial<{
			title: string
			description: string | undefined
			imageId: Id<"_storage"> | undefined
		}> = {}

		if (args.title !== undefined) {
			updates.title = args.title
		}
		if (args.description !== undefined) {
			updates.description = args.description === null ? undefined : args.description
		}
		if (args.imageId !== undefined) {
			if (thing.imageId && args.imageId !== thing.imageId) {
				await ctx.storage.delete(thing.imageId)
			}
			updates.imageId = args.imageId === null ? undefined : (args.imageId as Id<"_storage">)
		}

		await ctx.db.patch(args.id as Id<"things">, updates)
	},
})

export const remove = mutation({
	args: {
		id: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) throw new Error("Not authenticated")

		const thing = await ctx.db.get(args.id as Id<"things">)
		if (!thing || thing.userId !== userId) {
			throw new Error("Not found or not authorized")
		}
		if (thing.imageId) {
			await ctx.storage.delete(thing.imageId)
		}
		await ctx.db.delete(args.id as Id<"things">)
	},
})
