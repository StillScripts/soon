import type { inferApiInputs, inferApiOutputs } from "better-convex/server"

import type { api } from "../_generated/api"

// Use the standard Convex api type
// cRPC procedures are included as they are standard Convex functions
export type Api = typeof api

// Helper types for inputs and outputs
export type ApiInputs = inferApiInputs<Api>
export type ApiOutputs = inferApiOutputs<Api>
