import type { Doc, Id } from "@convex/dataModel"

/** A Thing document with the computed `imageUrl` field added by query handlers. */
export type Thing = Doc<"things"> & { imageUrl: string | null }

/** Convenience alias for Thing document IDs. */
export type ThingId = Id<"things">
