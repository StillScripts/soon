import type { api as convexApi } from "./_generated/api"
import type * as things from "./things"

export type Api = typeof convexApi & {
  things: {
    list: typeof things.list
    get: typeof things.get
    create: typeof things.create
    remove: typeof things.remove
  }
}

export { api } from "./_generated/api"
