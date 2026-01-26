import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  things: defineTable({
    title: v.string(),
  }),
})
