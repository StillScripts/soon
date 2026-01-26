// Re-export types for the cRPC client
import type { api as convexApi } from "./_generated/api"
import type * as things from "./things"

// Full API type that includes cRPC procedures (not filtered by "public" visibility)
export type Api = typeof convexApi & {
	things: {
		list: typeof things.list
		get: typeof things.get
		create: typeof things.create
		remove: typeof things.remove
	}
}

// Re-export the api for runtime use
export { api } from "./_generated/api"
