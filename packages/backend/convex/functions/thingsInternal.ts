/**
 * Internal (testable) versions of things functions.
 *
 * These functions bypass the better-auth middleware and accept userId directly,
 * making them suitable for testing with convex-test. The public functions in
 * things.ts use the auth middleware and delegate to these implementations.
 *
 * In tests, we can call these internal functions directly to test the core
 * business logic without needing to mock the better-auth component.
 */
import { v } from "convex/values"

import type { Id } from "./_generated/dataModel"
import { internalMutation, internalQuery } from "./_generated/server"

/**
 * Internal query to list things for a user.
 * Bypasses auth for testing purposes.
 */
export const listInternal = internalQuery({
	args: {
		userId: v.string(),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, { userId, limit }) => {
		const query = ctx.db.query("things").withIndex("by_user", (q) => q.eq("userId", userId))

		const things = limit ? await query.take(limit) : await query.collect()

		return Promise.all(
			things.map(async (thing) =>
				Object.assign({}, thing, {
					imageUrl: thing.imageId ? await ctx.storage.getUrl(thing.imageId) : null,
				})
			)
		)
	},
})

/**
 * Internal query to get a single thing by ID.
 * Returns null if not found or not owned by user.
 */
export const getInternal = internalQuery({
	args: {
		userId: v.string(),
		id: v.string(),
	},
	handler: async (ctx, { userId, id }) => {
		const thing = await ctx.db.get(id as Id<"things">)
		if (!thing || thing.userId !== userId) {
			return null
		}
		return {
			...thing,
			imageUrl: thing.imageId ? await ctx.storage.getUrl(thing.imageId) : null,
		}
	},
})

/**
 * Internal mutation to create a new thing.
 */
export const createInternal = internalMutation({
	args: {
		userId: v.string(),
		title: v.string(),
		description: v.optional(v.string()),
		imageId: v.optional(v.string()),
	},
	handler: async (ctx, { userId, title, description, imageId }) => {
		return ctx.db.insert("things", {
			title,
			description,
			imageId: imageId as Id<"_storage"> | undefined,
			userId,
		})
	},
})

/**
 * Internal mutation to update a thing.
 * Throws if not found or not owned by user.
 */
export const updateInternal = internalMutation({
	args: {
		userId: v.string(),
		id: v.string(),
		title: v.optional(v.string()),
		description: v.optional(v.union(v.string(), v.null())),
		imageId: v.optional(v.union(v.string(), v.null())),
	},
	handler: async (ctx, { userId, id, title, description, imageId }) => {
		const thing = await ctx.db.get(id as Id<"things">)
		if (!thing || thing.userId !== userId) {
			throw new Error("Not found or not authorized")
		}

		const updates: Partial<{
			title: string
			description: string | undefined
			imageId: Id<"_storage"> | undefined
		}> = {}

		if (title !== undefined) {
			updates.title = title
		}
		if (description !== undefined) {
			updates.description = description === null ? undefined : description
		}
		if (imageId !== undefined) {
			if (thing.imageId && imageId !== thing.imageId) {
				await ctx.storage.delete(thing.imageId)
			}
			updates.imageId = imageId === null ? undefined : (imageId as Id<"_storage">)
		}

		await ctx.db.patch(id as Id<"things">, updates)
	},
})

/**
 * Internal mutation to remove a thing.
 * Throws if not found or not owned by user.
 * Also deletes associated storage file if present.
 */
export const removeInternal = internalMutation({
	args: {
		userId: v.string(),
		id: v.string(),
	},
	handler: async (ctx, { userId, id }) => {
		const thing = await ctx.db.get(id as Id<"things">)
		if (!thing || thing.userId !== userId) {
			throw new Error("Not found or not authorized")
		}
		if (thing.imageId) {
			await ctx.storage.delete(thing.imageId)
		}
		await ctx.db.delete(id as Id<"things">)
	},
})

/**
 * Internal mutation to generate upload URL.
 * No user validation needed - just generates a storage URL.
 */
export const generateUploadUrlInternal = internalMutation({
	args: {},
	handler: async (ctx) => {
		return await ctx.storage.generateUploadUrl()
	},
})
