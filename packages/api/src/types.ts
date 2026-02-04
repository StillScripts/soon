import type { ApiInputs, ApiOutputs } from "backend/types"

/**
 * Re-export API types from backend for convenient access.
 *
 * These types are inferred from the Convex API definition and provide
 * full type safety for inputs and outputs.
 */
export type { Api, ApiInputs, ApiOutputs } from "backend/types"

/** A single Thing entity with resolved image URL */
export type Thing = ApiOutputs["things"]["list"][number]

/** Input for creating a new Thing */
export type CreateThingInput = ApiInputs["things"]["create"]

/** Input for updating an existing Thing */
export type UpdateThingInput = ApiInputs["things"]["update"]

/** Input for listing Things */
export type ListThingsInput = ApiInputs["things"]["list"]
