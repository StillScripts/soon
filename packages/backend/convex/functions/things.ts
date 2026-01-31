import {
	createThingSchema,
	getThingSchema,
	listThingsSchema,
	removeThingSchema,
	updateThingSchema,
} from "@repo/validators/things"
import { zid } from "convex-helpers/server/zod4"
import { z } from "zod"

import type { Id } from "./_generated/dataModel"

import { authMutation, authQuery } from "../lib/crpc"

const thingOutputSchema = z.object({
	_id: zid("things"),
	_creationTime: z.number(),
	title: z.string(),
	description: z.string().optional(),
	imageId: zid("_storage").optional(),
	userId: z.string(),
	imageUrl: z.string().nullable(),
})

export const generateUploadUrl = authMutation.output(z.string()).mutation(async ({ ctx }) => {
	return await ctx.storage.generateUploadUrl()
})

export const list = authQuery
	.input(listThingsSchema)
	.output(z.array(thingOutputSchema))
	.query(async ({ ctx, input }) => {
		const query = ctx.db.query("things").withIndex("by_user", (q) => q.eq("userId", ctx.userId))

		const things = input.limit ? await query.take(input.limit) : await query.collect()

		return Promise.all(
			things.map(async (thing) =>
				Object.assign({}, thing, {
					imageUrl: thing.imageId ? await ctx.storage.getUrl(thing.imageId) : null,
				})
			)
		)
	})

export const get = authQuery
	.input(getThingSchema)
	.output(thingOutputSchema.nullable())
	.query(async ({ ctx, input }) => {
		const thing = await ctx.db.get(input.id as Id<"things">)
		if (!thing || thing.userId !== ctx.userId) {
			return null
		}
		return {
			...thing,
			imageUrl: thing.imageId ? await ctx.storage.getUrl(thing.imageId) : null,
		}
	})

export const create = authMutation
	.input(createThingSchema)
	.output(zid("things"))
	.mutation(async ({ ctx, input }) => {
		return ctx.db.insert("things", {
			title: input.title,
			description: input.description,
			imageId: input.imageId as Id<"_storage"> | undefined,
			userId: ctx.userId,
		})
	})

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
		if (thing.imageId && input.imageId !== thing.imageId) {
			await ctx.storage.delete(thing.imageId)
		}
		updates.imageId = input.imageId === null ? undefined : (input.imageId as Id<"_storage">)
	}

	await ctx.db.patch(input.id as Id<"things">, updates)
})

export const remove = authMutation.input(removeThingSchema).mutation(async ({ ctx, input }) => {
	const thing = await ctx.db.get(input.id as Id<"things">)
	if (!thing || thing.userId !== ctx.userId) {
		throw new Error("Not found or not authorized")
	}
	if (thing.imageId) {
		await ctx.storage.delete(thing.imageId)
	}
	await ctx.db.delete(input.id as Id<"things">)
})
