import type { inferApiInputs, inferApiOutputs } from "better-convex/server"

import type { api } from "../_generated/api"

export type Api = typeof api
export type ApiInputs = inferApiInputs<Api>
export type ApiOutputs = inferApiOutputs<Api>
