import { z } from "zod"

/**
 * Shared Zod Validation Schemas for "Things" Entity
 *
 * This file defines validation schemas that are shared between the web app and Convex backend.
 *
 * ## Pattern for New Models
 *
 * When adding a new model (e.g., "projects"), create a similar file with:
 * 1. createProjectSchema - For creating new records
 * 2. getProjectSchema - For fetching by ID
 * 3. removeProjectSchema - For deletion
 * 4. listProjectsSchema - For listing with optional pagination
 * 5. updateProjectSchema - For partial updates (all fields optional except ID)
 *
 * ## Why z.string() for IDs (not zid())
 *
 * We use `z.string()` for Convex document IDs because:
 * - `zid()` from `convex-helpers/server/zod4` is server-only (uses Convex internals)
 * - This package is shared between web app and backend
 * - On the Convex side, use `zid("tableName")` in `.output()` schemas for full type safety
 *
 * Example:
 *   // validators (shared): z.string() for ID
 *   // Convex output schema: zid("things") for ID
 */

/**
 * Schema for creating a new thing
 */
export const createThingSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or less"),
	description: z.string().max(2000, "Description must be 2000 characters or less").optional(),
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
	title: z
		.string()
		.min(1, "Title is required")
		.max(200, "Title must be 200 characters or less")
		.optional(),
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
