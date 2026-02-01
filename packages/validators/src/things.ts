import { z } from "zod"

/**
 * Shared Zod Input Schema for "Things" Entity
 *
 * This file defines the input validation schema for user data in forms.
 * Backend-specific schemas (get by id, delete, list, etc.) are defined
 * in the backend to keep this package focused on form validation.
 *
 * ## Pattern for New Models
 *
 * When adding a new model (e.g., "projects"), create a similar file with:
 * 1. projectInputSchema - Core input fields for create/update forms
 *
 * ## Why z.string() for IDs (not zid())
 *
 * We use `z.string()` for Convex document IDs because:
 * - `zid()` from `convex-helpers/server/zod4` is server-only (uses Convex internals)
 * - This package is shared between web app and backend
 * - On the Convex side, use `zid("tableName")` in `.output()` schemas for full type safety
 */

/**
 * Core input schema for Thing entity
 *
 * Used for:
 * - Create forms: all fields as-is
 * - Update forms: use .partial() in backend, merged with id
 */
export const thingInputSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or less"),
	description: z.string().max(2000, "Description must be 2000 characters or less").optional(),
	imageId: z.string().optional(),
})

/**
 * Type inference helpers
 */
export type ThingInput = z.infer<typeof thingInputSchema>
