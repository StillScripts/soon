import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
	things: defineTable({
		title: v.string(),
		description: v.optional(v.string()),
		imageId: v.optional(v.union(v.id("_storage"), v.null())),
		userId: v.string(),
	}).index("by_user", ["userId"]),
})
