import { z } from "zod"

/**
 * Schema for creating a new thing
 */
export const createThingSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or less"),
	description: z
		.string()
		.max(2000, "Description must be 2000 characters or less")
		.optional(),
	imageId: z.string().optional(),
})

/**
 * Schema for getting a thing by ID
 */
export const getThingSchema = z.object({
	id: z.string(),
})

/**
 * Schema for removing a thing
 */
export const removeThingSchema = z.object({
	id: z.string(),
})

/**
 * Schema for listing things with optional limit
 */
export const listThingsSchema = z.object({
	limit: z.number().int().min(1).max(100).optional(),
})

/**
 * Schema for updating a thing
 */
export const updateThingSchema = z.object({
	id: z.string(),
	title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or less").optional(),
	description: z
		.string()
		.max(2000, "Description must be 2000 characters or less")
		.nullable()
		.optional(),
	imageId: z.string().nullable().optional(),
})

/**
 * Type inference helpers
 */
export type CreateThingInput = z.infer<typeof createThingSchema>
export type GetThingInput = z.infer<typeof getThingSchema>
export type RemoveThingInput = z.infer<typeof removeThingSchema>
export type ListThingsInput = z.infer<typeof listThingsSchema>
export type UpdateThingInput = z.infer<typeof updateThingSchema>
