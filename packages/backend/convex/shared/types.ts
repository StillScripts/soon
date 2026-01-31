import type { inferApiInputs, inferApiOutputs } from "better-convex/server"

import type { api } from "../functions/_generated/api"

export type Api = typeof api
export type ApiInputs = inferApiInputs<Api>
export type ApiOutputs = inferApiOutputs<Api>

export { api } from "../functions/_generated/api"
