import type { inferApiInputs, inferApiOutputs } from "kitcn/server"

import type { api } from "../functions/_generated/api"

export type Api = typeof api
export type ApiInputs = inferApiInputs<Api>
export type ApiOutputs = inferApiOutputs<Api>
