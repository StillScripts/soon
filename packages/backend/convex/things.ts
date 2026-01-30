import {
	createThingSchema,
	getThingSchema,
	listThingsSchema,
	removeThingSchema,
	updateThingSchema,
} from "@repo/validators/things"

import type { Id } from "./_generated/dataModel"
import { authMutation, authQuery } from "./crpc"

// Generate upload URL for images (requires auth)
export const generateUploadUrl = authMutation.mutation(async ({ ctx }) => {
	return await ctx.storage.generateUploadUrl()
})

// List all things for the authenticated user
export const list = authQuery.input(listThingsSchema).query(async ({ ctx, input }) => {
	const query = ctx.db.query("things").withIndex("by_user", (q) => q.eq("userId", ctx.userId))

	const things = input.limit ? await query.take(input.limit) : await query.collect()

	// Add image URLs
	return Promise.all(
		things.map(async (thing) => ({
			...thing,
			imageUrl: thing.imageId ? await ctx.storage.getUrl(thing.imageId) : null,
		}))
	)
})

// Get a single thing by ID (with ownership check)
export const get = authQuery.input(getThingSchema).query(async ({ ctx, input }) => {
	const thing = await ctx.db.get(input.id as Id<"things">)
	if (!thing || thing.userId !== ctx.userId) {
		return null
	}
	return {
		...thing,
		imageUrl: thing.imageId ? await ctx.storage.getUrl(thing.imageId) : null,
	}
})

// Create a new thing
export const create = authMutation.input(createThingSchema).mutation(async ({ ctx, input }) => {
	return ctx.db.insert("things", {
		title: input.title,
		description: input.description,
		imageId: input.imageId as Id<"_storage"> | undefined,
		userId: ctx.userId,
	})
})

// Update a thing (with ownership check)
export const update = authMutation.input(updateThingSchema).mutation(async ({ ctx, input }) => {
	const thing = await ctx.db.get(input.id as Id<"things">)
	if (!thing || thing.userId !== ctx.userId) {
		throw new Error("Not found or not authorized")
	}

	const updates: Partial<{
		title: string
		description: string | undefined
		imageId: Id<"_storage"> | undefined
	}> = {}

	if (input.title !== undefined) {
		updates.title = input.title
	}
	if (input.description !== undefined) {
		updates.description = input.description === null ? undefined : input.description
	}
	if (input.imageId !== undefined) {
		// Delete old image if replacing
		if (thing.imageId && input.imageId !== thing.imageId) {
			await ctx.storage.delete(thing.imageId)
		}
		updates.imageId = input.imageId === null ? undefined : (input.imageId as Id<"_storage">)
	}

	await ctx.db.patch(input.id as Id<"things">, updates)
})

// Delete a thing (with ownership check)
export const remove = authMutation.input(removeThingSchema).mutation(async ({ ctx, input }) => {
	const thing = await ctx.db.get(input.id as Id<"things">)
	if (!thing || thing.userId !== ctx.userId) {
		throw new Error("Not found or not authorized")
	}
	// Delete associated image if exists
	if (thing.imageId) {
		await ctx.storage.delete(thing.imageId)
	}
	await ctx.db.delete(input.id as Id<"things">)
})
